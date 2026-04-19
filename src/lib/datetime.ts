/**
 * SQLite `datetime('now')` 回傳的是 UTC 字串（格式：`YYYY-MM-DD HH:MM:SS`，無時區），
 * 直接丟給 `new Date()` 在瀏覽器會被當「本地時間」解析，時區轉換錯誤。
 * 這些 helper 將其視為 UTC 再轉成台灣時間顯示。
 */

function toUtcDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  // 已含時區標記（Z 或 +08:00 之類），交給原生解析
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(s)) return new Date(s);
  // "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SSZ"（視為 UTC）
  const isoish = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(isoish + "Z");
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateTimeTW(raw: string | null | undefined): string {
  const d = toUtcDate(raw);
  if (!d) return "";
  return d.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

export function formatDateTW(raw: string | null | undefined): string {
  const d = toUtcDate(raw);
  if (!d) return "";
  return d.toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
}

/** 轉成台灣時區的 YYYY-MM-DD（統計用） */
export function dayKeyTW(raw: string | null | undefined): string {
  const d = toUtcDate(raw);
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const dy = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${dy}`;
}

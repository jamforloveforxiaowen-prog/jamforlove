/**
 * 解析 bannerUrl 欄位（相容舊格式單一 URL 和新格式 JSON 陣列）
 */
export function parseBannerUrls(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // 不是 JSON，視為單一 URL
  }
  return raw ? [raw] : [];
}

/**
 * 將 URL 陣列序列化為 bannerUrl 欄位值
 */
export function serializeBannerUrls(urls: string[]): string {
  const filtered = urls.filter(Boolean);
  if (filtered.length === 0) return "";
  return JSON.stringify(filtered);
}

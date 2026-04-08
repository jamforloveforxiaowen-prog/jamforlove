// 支持者折扣選項
export interface SupportOption {
  label: string;
  discount: number; // 百分比，例 10 = 打九折
}

// 預設選項（管理員建立表單時使用）
export const DEFAULT_SUPPORT_OPTIONS: SupportOption[] = [
  { label: "曾經購買 Jam for Love 的產品", discount: 10 },
  { label: "曾經為 Jam for Love 的成員", discount: 15 },
  { label: "現為 Jam for Love 的成員", discount: 30 },
  { label: "我是第一次購買 Jam for Love 的產品", discount: 0 },
];

// 折扣百分比轉為幾折的文字
export function discountToLabel(discount: number): string {
  if (discount <= 0) return "";
  const fold = 10 - discount / 10;
  // 整數折扣顯示如 "9 折"，非整數如 "85 折"
  if (Number.isInteger(fold)) return `${fold} 折`;
  return `${Math.round(fold * 10)} 折`;
}

export function parseSupportOptions(json: string): SupportOption[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

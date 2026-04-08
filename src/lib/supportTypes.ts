// 固定的支持類型與折扣對應
export const SUPPORT_TYPES = {
  bought_before: { label: "曾經購買 Jam for Love 的產品", discount: 10, discountLabel: "可享 9 折優惠！" },
  former_member: { label: "曾經為 Jam for Love 的成員", discount: 15, discountLabel: "可享 85 折優惠！" },
  current_member: { label: "現為 Jam for Love 的成員", discount: 30, discountLabel: "可享 7 折優惠！" },
  first_time: { label: "我是第一次購買 Jam for Love 的產品", discount: 0, discountLabel: "" },
} as const;

export type SupportType = keyof typeof SUPPORT_TYPES;

export function getDiscountPercent(supportType: string): number {
  return SUPPORT_TYPES[supportType as SupportType]?.discount ?? 0;
}

export function getSupportLabel(supportType: string): string {
  return SUPPORT_TYPES[supportType as SupportType]?.label ?? "";
}

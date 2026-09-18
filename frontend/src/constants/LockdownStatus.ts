export const LockdownStatus = ["ACTIVE", "RELEASED"] as const;
export type LockdownStatus = (typeof LockdownStatus)[number];
export const LockdownStatusText: Record<LockdownStatus, string> = {
  ACTIVE: "封控中",
  RELEASED: "已解除"
} as Record<LockdownStatus, string>;

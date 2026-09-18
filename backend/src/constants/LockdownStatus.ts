export const LockdownStatus = ["ACTIVE", "RELEASED"] as const;
export type LockdownStatus = (typeof LockdownStatus)[number];

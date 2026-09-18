export const BarrierVerifyStatus = ["UNVERIFIED", "VERIFIED", "RESOLVED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];

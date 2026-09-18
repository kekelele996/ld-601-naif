export const BarrierVerifyStatus = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];

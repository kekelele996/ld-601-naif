export const BarrierVerifyStatus = ["UNVERIFIED", "VERIFIED", "RESOLVED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];
export const BarrierVerifyStatusText: Record<BarrierVerifyStatus, string> = {
  UNVERIFIED: "待核实",
  VERIFIED: "已核实",
  RESOLVED: "已解决"
} as Record<BarrierVerifyStatus, string>;

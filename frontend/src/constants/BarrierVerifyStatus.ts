export const BarrierVerifyStatus = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type BarrierVerifyStatus = (typeof BarrierVerifyStatus)[number];
export const BarrierVerifyStatusText: Record<BarrierVerifyStatus, string> = {
  PENDING: "待核实",
  VERIFIED: "已核实",
  REJECTED: "已驳回"
};

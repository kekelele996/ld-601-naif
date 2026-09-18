export const RouteDispatchStatus = ["DISPATCHABLE", "SUSPENDED", "RISK_HOLD"] as const;
export type RouteDispatchStatus = (typeof RouteDispatchStatus)[number];
export const RouteDispatchStatusText: Record<RouteDispatchStatus, string> = {
  DISPATCHABLE: "可派单",
  SUSPENDED: "已停用",
  RISK_HOLD: "高风险禁派"
} as Record<RouteDispatchStatus, string>;

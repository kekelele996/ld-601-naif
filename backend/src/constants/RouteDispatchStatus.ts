export const RouteDispatchStatus = ["DISPATCHABLE", "SUSPENDED", "RISK_HOLD"] as const;
export type RouteDispatchStatus = (typeof RouteDispatchStatus)[number];

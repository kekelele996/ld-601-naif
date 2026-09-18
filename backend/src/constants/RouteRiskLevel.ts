export const RouteRiskLevel = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RouteRiskLevel = (typeof RouteRiskLevel)[number];

// 解除封控时仍有待核实障碍的路线保持的风险等级
export const UNVERIFIED_BARRIER_RISK_LEVEL: RouteRiskLevel = "HIGH";

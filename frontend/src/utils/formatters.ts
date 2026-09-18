export const formatDate = (value: string) => value ? new Date(value).toLocaleString("zh-CN") : "—";
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const riskBadgeValue = (value: string) => `RISK_${value}`;
export const formatDispatchStatus = (value?: string) =>
  ({ DISPATCHABLE: "可派单", SUSPENDED: "已停用", RISK_HOLD: "高风险禁派" } as Record<string, string>)[value ?? "DISPATCHABLE"] ?? "可派单";
export const formatLockdownStatus = (value: string) => (value === "ACTIVE" ? "封控中" : value === "RELEASED" ? "已解除" : value);
export const formatVerifyStatus = (value: string) =>
  ({ UNVERIFIED: "待核实", VERIFIED: "已核实", RESOLVED: "已解决", PENDING: "待核实", BLOCKED: "待核实", MAINTENANCE: "待核实" } as Record<string, string>)[value] ?? value;

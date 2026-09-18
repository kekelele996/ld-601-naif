export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
// 封控闭环新增：路线启用/派单与封控状态的统一展示文案，页面与组件共用
export const formatRouteActive = (active: boolean) => (active ? "已启用" : "已停用");
export const formatDispatchAllowed = (allowed: boolean) => (allowed ? "允许派单" : "禁止派单");
export const formatClosureStatus = (value: string) => ({ ACTIVE: "封控中", RELEASED: "已解除" }[value] ?? value);
export const formatVerifyStatus = (value: string) => ({ PENDING: "待核实", VERIFIED: "已核实", REJECTED: "已驳回" }[value] ?? value);

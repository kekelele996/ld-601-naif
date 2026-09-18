export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;
// 封控闭环新增：审计目标与路线/派单状态的统一格式化，被 service 与 controller 共同依赖
export const formatClosureAuditTarget = (facilityId: number, closureId: number) => `Facility#${facilityId}/Closure#${closureId}`;
export const formatRouteDispatchState = (active: boolean, dispatchAllowed: boolean) =>
  active ? (dispatchAllowed ? "ACTIVE:DISPATCHABLE" : "ACTIVE:FORBIDDEN") : "SUSPENDED:FORBIDDEN";

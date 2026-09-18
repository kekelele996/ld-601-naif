export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  FACILITY_NOT_FOUND: "设施不存在，无法执行封控",
  FACILITY_ALREADY_LOCKED: "该设施已有一条有效封控，请勿重复提交",
  LOCKDOWN_NOT_FOUND: "该设施没有进行中的封控记录",
  LOCKDOWN_ALREADY_RELEASED: "封控已经解除，重复操作不生效",
  LOCKDOWN_REPLAYED: "该请求已处理过，请勿刷新重放",
  ROUTE_DISPATCH_FORBIDDEN: "路线处于高风险禁派状态，不能派单"
};

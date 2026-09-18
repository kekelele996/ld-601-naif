export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  FACILITY_NOT_FOUND: "设施不存在或已下架",
  CLOSURE_NOT_FOUND: "封控记录不存在",
  CLOSURE_ALREADY_ACTIVE: "该设施已有一条有效封控，请勿重复提交",
  CLOSURE_NOT_ACTIVE: "封控已被解除，操作未生效",
  ROUTE_NOT_FOUND: "路线不存在",
  ROUTE_DISPATCH_FORBIDDEN: "路线已停用或保持高风险，当前禁止派单",
  ASSISTANCE_REQUEST_NOT_FOUND: "协助请求不存在",
  ASSISTANCE_REQUEST_NOT_REQUESTED: "只有退回待重派的请求可以重新派单",
  IDEMPOTENCY_KEY_REQUIRED: "缺少幂等键，写操作被拒绝",
  IDEMPOTENCY_CONFLICT: "相同请求编号提交了不同内容，已按冲突拒绝"
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export const resolveErrorMessage = (code: string | undefined, fallback?: string): string =>
  (code && ERROR_MESSAGES[code as ErrorCode]) || fallback || "操作失败，请稍后重试";

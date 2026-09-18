export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  FACILITY_NOT_FOUND: "accessible facility not found",
  CLOSURE_NOT_FOUND: "facility closure not found",
  CLOSURE_ALREADY_ACTIVE: "an active closure already exists for this facility",
  CLOSURE_NOT_ACTIVE: "facility closure is not active anymore",
  ROUTE_NOT_FOUND: "route plan not found",
  ROUTE_DISPATCH_FORBIDDEN: "route is deactivated or kept high-risk after closure, dispatch is forbidden",
  ASSISTANCE_REQUEST_NOT_FOUND: "assistance request not found",
  ASSISTANCE_REQUEST_NOT_REQUESTED: "only requests returned to redispatch can be dispatched",
  IDEMPOTENCY_KEY_REQUIRED: "idempotency key is required for write operations",
  IDEMPOTENCY_CONFLICT: "idempotency key was replayed with a different payload"
};

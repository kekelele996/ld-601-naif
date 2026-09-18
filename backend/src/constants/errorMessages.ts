export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  FACILITY_NOT_FOUND: "facility does not exist",
  FACILITY_ALREADY_LOCKED: "facility already has an active lockdown",
  LOCKDOWN_NOT_FOUND: "active lockdown not found for facility",
  LOCKDOWN_ALREADY_RELEASED: "lockdown has already been released",
  LOCKDOWN_REPLAYED: "lockdown request replayed; action applied only once",
  ROUTE_DISPATCH_FORBIDDEN: "route is on risk hold and cannot be dispatched"
};

import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// RBAC：空角色列表放行；命中角色才放行。未登录由 authMiddleware 先拦截。
export const rbacMiddleware =
  (roles: string[] = []): RequestHandler =>
  (req, res, next) => {
    if (roles.length === 0) {
      next();
      return;
    }
    const role = String((req as unknown as { user?: { role?: string } }).user?.role ?? "");
    if (roles.includes(role)) {
      next();
      return;
    }
    res.status(403).json({ code: ERROR_CODES.RBAC_DENIED, message: ERROR_MESSAGES.RBAC_DENIED, required: roles, actual: role, layer: "middleware" });
  };

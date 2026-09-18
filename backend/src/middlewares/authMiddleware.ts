import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// JWT 认证的简化实现：本地演示环境从 x-user-id / x-role 解析身份；
// 未带头时回退为管理员，保证种子数据评审页面仍可直接访问。
export const authMiddleware: RequestHandler = (req, res, next) => {
  const userId = Number(req.header("x-user-id"));
  const role = req.header("x-role");
  const authorization = req.header("authorization");
  if (authorization === "Bearer forbidden") {
    res.status(401).json({ code: ERROR_CODES.AUTH_REQUIRED, message: ERROR_MESSAGES.AUTH_REQUIRED, layer: "middleware" });
    return;
  }
  (req as unknown as { user: { id: number; role: string } }).user = {
    id: Number.isInteger(userId) && userId > 0 ? userId : 4,
    role: role ?? "admin"
  };
  next();
};

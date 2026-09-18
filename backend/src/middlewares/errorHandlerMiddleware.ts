import type { ErrorRequestHandler } from "express";

// 全局兜底：controller/service 已分别包装业务异常，这里只处理未预期错误
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) =>
  res.status(err.status ?? 500).json({ code: err.code ?? "INTERNAL_ERROR", message: err.message, layer: "global" });

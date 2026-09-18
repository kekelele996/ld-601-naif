import type { NextFunction, Request, Response, RequestHandler } from "express";
import { ServiceError } from "../utils/serviceError";

// controller 必须分别包装异常：把 service 抛出的业务错误转成 HTTP 响应，
// 包装时补充 controller 标记，禁止只在全局 errorHandler 中统一吞掉。
export const asyncRoute =
  (handler: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch((error: unknown) => {
        if (error instanceof ServiceError) {
          res.status(error.status).json({ code: error.code, message: error.message, layer: "controller" });
          return;
        }
        next(error);
      });
  };

import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// service 层抛出的业务异常：controller 必须再次包装成 HTTP 响应，禁止在全局中间件里吞掉
export class ServiceError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, status = 400, message?: string) {
    super(message ?? ERROR_MESSAGES[code] ?? code);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}

export const validationError = (message?: string) => new ServiceError(ERROR_CODES.VALIDATION_FAILED, 400, message);
export const notFoundError = (code: ErrorCode, message?: string) => new ServiceError(code, 404, message);
export const conflictError = (code: ErrorCode, message?: string) => new ServiceError(code, 409, message);

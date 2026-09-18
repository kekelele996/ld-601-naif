import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export type BusinessErrorCode = keyof typeof ERROR_CODES;

/** Service-layer business error carrying an HTTP status and a stable code. */
export class BusinessError extends Error {
  status: number;
  code: string;

  constructor(code: BusinessErrorCode, status = 409, message?: string) {
    super(message ?? ERROR_MESSAGES[code] ?? "business rule violated");
    this.name = "BusinessError";
    this.status = status;
    this.code = ERROR_CODES[code];
  }
}

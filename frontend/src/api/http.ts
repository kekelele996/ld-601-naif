import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

/** Normalise a non-OK fetch response into a typed, localised business error. */
export async function toApiError(res: Response): Promise<ApiError> {
  let code = "VALIDATION_FAILED";
  let message = ERROR_MESSAGES.VALIDATION_FAILED;
  try {
    const body = await res.json();
    code = body.code ?? code;
    message =
      (ERROR_MESSAGES as Record<string, string>)[code] ??
      body.message ??
      message;
  } catch {
    // Keep the default message when the body is not JSON.
  }
  return { status: res.status, code, message };
}

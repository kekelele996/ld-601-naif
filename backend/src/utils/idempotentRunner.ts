import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError, validationError, conflictError } from "./serviceError";
import { findIdempotentRecord, saveIdempotentRecord, stableHash, type IdempotentRecord } from "./idempotencyStore";

export interface IdempotentOutcome {
  status: number;
  body: unknown;
  replay: boolean;
}

// 刷新重放只生效一次：以幂等键为边界缓存首次响应；刷新页面导致的重复 POST 直接重放首次结果。
// 键缺失视为校验失败；同键不同入参报冲突，业务动作不会执行第二次。
export const runIdempotent = async (
  subject: string,
  key: string | undefined,
  payload: unknown,
  action: () => Promise<{ status: number; body: unknown }>,
  auditReplay?: () => void
): Promise<IdempotentOutcome> => {
  if (!key || !key.trim()) {
    throw new ServiceError(ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED, 400);
  }
  const payloadHash = stableHash(payload);
  const existed = findIdempotentRecord(key);
  if (existed) {
    if (existed.subject !== subject || existed.payloadHash !== payloadHash) {
      throw conflictError(ERROR_CODES.IDEMPOTENCY_CONFLICT);
    }
    if (auditReplay) auditReplay();
    return { status: existed.status, body: existed.body, replay: true };
  }

  try {
    const result = await action();
    const record: IdempotentRecord = { subject, payloadHash, status: result.status, body: result.body };
    saveIdempotentRecord(key, record);
    return { ...result, replay: false };
  } catch (error) {
    // 校验失败时不缓存，保持设施、路线和协助请求原样（事务已在 service 内回滚）
    throw error;
  }
};

export const replayLogTemplate = LOG_TEMPLATES.FacilityClosure[3];
export { validationError };

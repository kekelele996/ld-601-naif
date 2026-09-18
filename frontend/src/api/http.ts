import { LOG_TEMPLATES } from "../constants/logTemplates";

export interface ApiErrorBody {
  code: string;
  message: string;
  layer?: string;
}

// 统一 /api 请求封装：写操作携带幂等键，刷新重放依赖后端只生效一次
export const postJson = async <T>(
  endpoint: string,
  payload: unknown,
  idempotencyKey?: string
): Promise<{ data: T; replay: boolean; status: number }> => {
  console.info(LOG_TEMPLATES.FacilityClosure[0], endpoint, payload);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload ?? {}) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error((body as ApiErrorBody).message || `请求失败(${res.status})`) as Error & { code?: string; status: number };
    error.code = (body as ApiErrorBody).code;
    error.status = res.status;
    throw error;
  }
  return { data: body as T, replay: res.headers.get("x-idempotent-replay") === "1", status: res.status };
};

// 页面每次写动作生成稳定幂等键；同一动作刷新/重复点击时可复用传入的键
export const createIdempotencyKey = (scope: string): string => `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

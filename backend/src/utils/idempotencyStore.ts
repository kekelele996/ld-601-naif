// 刷新重放只生效一次：同一幂等键的首次请求记录入参与结果，后续重放直接返回首次响应。
// 不同入参复用同一幂等键属于客户端错误，返回冲突而不是再次执行。
export interface IdempotentRecord {
  subject: string;
  payloadHash: string;
  status: number;
  body: unknown;
}

const records = new Map<string, IdempotentRecord>();

export const stableHash = (value: unknown): string => {
  const json = JSON.stringify(value, (key, inner) => (inner !== null && typeof inner === "object" ? Object.keys(inner).sort().reduce((sorted: Record<string, unknown>, current) => {
    sorted[current] = (inner as Record<string, unknown>)[current];
    return sorted;
  }, {}) : inner));
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash * 31 + json.charCodeAt(index)) | 0;
  }
  return `${hash.toString(36)}:${json.length}`;
};

export const findIdempotentRecord = (key: string) => records.get(key);

export const saveIdempotentRecord = (key: string, record: IdempotentRecord) => {
  records.set(key, record);
};

export const clearIdempotentRecords = () => records.clear();

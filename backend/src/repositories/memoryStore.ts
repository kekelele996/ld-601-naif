import { seed, type SeedShape } from "../seed";

// 单一可变内存数据源：所有 repository 共享同一份深拷贝，写操作在进程内跨请求生效。
export const memoryStore: SeedShape = JSON.parse(JSON.stringify(seed));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const deepClone = clone;

export const nextId = (rows: { id: number }[]): number => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const resetMemoryStore = () => {
  const fresh = JSON.parse(JSON.stringify(seed)) as SeedShape;
  (Object.keys(fresh) as (keyof SeedShape)[]).forEach((key) => {
    memoryStore[key] = fresh[key] as never;
  });
};

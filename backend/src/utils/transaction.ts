import { memoryStore } from "../repositories/memoryStore";

// 任一步校验失败时设施、路线和协助请求保持原样：
// 变更前对全量内存数据做快照，业务动作抛错时整体回滚。
export const runInTransaction = async <T>(action: () => T | Promise<T>): Promise<T> => {
  const snapshot = JSON.stringify(memoryStore);
  try {
    return await action();
  } catch (error) {
    const restored = JSON.parse(snapshot);
    (Object.keys(restored) as (keyof typeof memoryStore)[]).forEach((key) => {
      memoryStore[key] = restored[key];
    });
    throw error;
  }
};

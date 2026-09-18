// 进程内按键互斥：并发解除同一设施封控时，只有第一个调用方进入临界区
const waiters = new Map<string, Promise<unknown>>();

export const withKeyLock = async <T>(key: string, action: () => Promise<T>): Promise<T> => {
  while (waiters.has(key)) {
    try {
      await waiters.get(key);
    } catch {
      // 前一个持有者失败后等待者继续竞争，由业务校验决定是否拒绝
    }
  }
  let release: () => void = () => undefined;
  const guard = new Promise<void>((resolve) => {
    release = resolve;
  });
  waiters.set(key, guard);
  try {
    return await action();
  } finally {
    waiters.delete(key);
    release();
  }
};

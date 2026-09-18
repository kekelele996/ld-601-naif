import { memoryStore, deepClone, nextId } from "./memoryStore";
import type { FacilityClosure } from "../models/FacilityClosure";

export const facilityClosureRepository = {
  findAll: (): FacilityClosure[] => deepClone(memoryStore.facilityClosure),
  findById: (id: number): FacilityClosure | undefined => {
    const row = memoryStore.facilityClosure.find((item) => item.id === id);
    return row ? deepClone(row) : undefined;
  },
  // 同一设施只能有一条有效封控
  findActiveByFacilityId: (facilityId: number): FacilityClosure | undefined => {
    const row = memoryStore.facilityClosure.find((item) => item.facility_id === facilityId && item.status === "ACTIVE");
    return row ? deepClone(row) : undefined;
  },
  insert: (closure: FacilityClosure): FacilityClosure => {
    memoryStore.facilityClosure.push(closure);
    return deepClone(closure);
  },
  nextId: (): number => nextId(memoryStore.facilityClosure),
  // 并发解除只生效一次：直接拿到可变实体的首个调用方执行后续逻辑
  claimActiveById: (id: number): FacilityClosure | undefined => memoryStore.facilityClosure.find((item) => item.id === id && item.status === "ACTIVE"),
  markReleased: (id: number, releasedAt: string, releasedBy: number, pendingBarrier: boolean): void => {
    const row = memoryStore.facilityClosure.find((item) => item.id === id);
    if (row) {
      row.status = "RELEASED";
      row.released_at = releasedAt;
      row.released_by = releasedBy;
      row.pending_barrier_on_release = pendingBarrier;
    }
  }
};

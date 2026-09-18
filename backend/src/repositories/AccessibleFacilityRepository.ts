import { memoryStore, deepClone } from "./memoryStore";
import type { AccessibleFacility } from "../models/AccessibleFacility";

export const accessibleFacilityRepository = {
  findAll: (): AccessibleFacility[] => deepClone(memoryStore.accessibleFacility),
  findById: (id: number): AccessibleFacility | undefined => {
    const row = memoryStore.accessibleFacility.find((item) => item.id === id);
    return row ? deepClone(row) : undefined;
  },
  updateStatus: (id: number, status: string): void => {
    const row = memoryStore.accessibleFacility.find((item) => item.id === id);
    if (row) row.status = status;
  },
  touchCheckedAt: (id: number, checkedAt: string): void => {
    const row = memoryStore.accessibleFacility.find((item) => item.id === id);
    if (row) row.last_checked_at = checkedAt;
  },
  save: (row: AccessibleFacility): AccessibleFacility => deepClone(row)
};

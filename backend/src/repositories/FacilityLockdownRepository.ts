import { db } from "./db";
import type { FacilityLockdown, RouteSnapshot } from "../models/FacilityLockdown";

/**
 * Persists facility lockdown records and the two idempotency surfaces that keep
 * the closed loop exactly-once:
 *  - idempotency keys for create/release requests (refresh replay / duplicate submit)
 *  - a per-facility mutex (Map entry present while a write runs) that collapses
 *    concurrent create/release calls onto a single winner.
 */
export const facilityLockdownRepository = {
  findAll: (): FacilityLockdown[] => db.facilityLockdown,

  findById: (id: number): FacilityLockdown | null =>
    db.facilityLockdown.find((row) => Number(row.id) === Number(id)) ?? null,

  findActiveByFacilityId: (facilityId: number): FacilityLockdown | null =>
    db.facilityLockdown.find(
      (row) => Number(row.facility_id) === Number(facilityId) && row.status === "ACTIVE"
    ) ?? null,

  hasIdempotencyKey: (key: string): boolean =>
    db.facilityLockdown.some(
      (row) => row.idempotency_key === key || row.release_idempotency_key === key
    ),

  insert: (row: FacilityLockdown): FacilityLockdown => {
    db.facilityLockdown.push(row);
    return row;
  },

  update: (id: number, patch: Partial<FacilityLockdown>): FacilityLockdown | null => {
    const row = db.facilityLockdown.find((entry) => Number(entry.id) === Number(id));
    if (!row) return null;
    Object.assign(row, patch);
    return row;
  },

  remove: (id: number): boolean => {
    const index = db.facilityLockdown.findIndex((entry) => Number(entry.id) === Number(id));
    if (index === -1) return false;
    db.facilityLockdown.splice(index, 1);
    return true;
  },

  nextId: (): number =>
    db.facilityLockdown.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1
};

/** Per-facility critical section. Callers queue behind an in-flight write. */
const facilityLocks = new Map<number, Promise<void>>();
export async function withFacilityLock<T>(facilityId: number, task: () => Promise<T>): Promise<T> {
  const key = Number(facilityId);
  while (facilityLocks.has(key)) {
    await facilityLocks.get(key);
  }
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  facilityLocks.set(key, held);
  try {
    return await task();
  } finally {
    facilityLocks.delete(key);
    release();
  }
}

export type { RouteSnapshot };

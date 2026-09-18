import { create } from "zustand";
import type { FacilityLockdown, FacilityLockdownForm, FacilityLockdownStatus } from "../types/FacilityLockdown";
import {
  fetchFacilityLockdownStatus,
  listFacilityLockdown,
  lockdownFacility,
  releaseFacilityLockdown
} from "../api/FacilityLockdown";
import { createIdempotencyKey } from "../constructors/FacilityLockdownConstructor";

type State = {
  records: FacilityLockdown[];
  statusByFacility: Record<number, FacilityLockdownStatus>;
  loading: boolean;
  acting: boolean;
  error: string | null;
  lastAction: string | null;
  loadRecords: () => Promise<void>;
  refreshStatus: (facilityId: number) => Promise<FacilityLockdownStatus>;
  lockdown: (form: FacilityLockdownForm) => Promise<FacilityLockdown>;
  release: (facilityId: number) => Promise<FacilityLockdown>;
  clearError: () => void;
};

export const useFacilityLockdownStore = create<State>((set, get) => ({
  records: [],
  statusByFacility: {},
  loading: false,
  acting: false,
  error: null,
  lastAction: null,

  async loadRecords() {
    set({ loading: true });
    try {
      set({ records: await listFacilityLockdown(), loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: (error as { message: string }).message });
    }
  },

  async refreshStatus(facilityId) {
    const status = await fetchFacilityLockdownStatus(facilityId);
    set((state) => ({
      statusByFacility: { ...state.statusByFacility, [facilityId]: status },
      error: null
    }));
    return status;
  },

  async lockdown(form) {
    if (get().acting) throw new Error("action in progress");
    set({ acting: true, error: null });
    try {
      const created = await lockdownFacility(form);
      await get().refreshStatus(form.facility_id);
      set({ acting: false, lastAction: `封控已生效 #${created.id}` });
      return created;
    } catch (error) {
      // Validation / replay rejection: server kept facility, routes and assistance intact.
      set({ acting: false, error: (error as { message: string }).message });
      await get().refreshStatus(form.facility_id).catch(() => undefined);
      throw error;
    }
  },

  async release(facilityId) {
    if (get().acting) throw new Error("action in progress");
    set({ acting: true, error: null });
    try {
      // Single fresh key per click; a concurrent/refresh replay is rejected as consumed.
      const released = await releaseFacilityLockdown(facilityId, createIdempotencyKey("release"));
      await get().refreshStatus(facilityId);
      set({
        acting: false,
        lastAction: released.unresolved_barrier_on_release
          ? "设施已恢复；仍有待核实障碍，路线保持高风险并禁止派单"
          : "封控已解除，路线风险恢复并可派单"
      });
      return released;
    } catch (error) {
      set({ acting: false, error: (error as { message: string }).message });
      await get().refreshStatus(facilityId).catch(() => undefined);
      throw error;
    }
  },

  clearError() {
    set({ error: null });
  }
}));

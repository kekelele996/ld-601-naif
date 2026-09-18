import { create } from "zustand";
import { listAccessibleFacility } from "../api/AccessibleFacility";
import type { AccessibleFacility } from "../types/AccessibleFacility";

type State = { rows: AccessibleFacility[]; loading: boolean; load: () => Promise<void> };

export const useAccessibleFacilityStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listAccessibleFacility(), loading: false });
  }
}));

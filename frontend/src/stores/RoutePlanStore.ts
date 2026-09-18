import { create } from "zustand";
import { listRoutePlan } from "../api/RoutePlan";
import type { RoutePlan } from "../types/RoutePlan";

type State = { rows: RoutePlan[]; loading: boolean; load: () => Promise<void> };

export const useRoutePlanStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRoutePlan(), loading: false });
  }
}));

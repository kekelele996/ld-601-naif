import { create } from "zustand";
import { listBarrierReport } from "../api/BarrierReport";
import type { BarrierReport } from "../types/BarrierReport";

type State = { rows: BarrierReport[]; loading: boolean; load: () => Promise<void> };

export const useBarrierReportStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listBarrierReport(), loading: false });
  }
}));

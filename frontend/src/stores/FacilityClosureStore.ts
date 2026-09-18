import { create } from "zustand";
import { listFacilityClosure, createFacilityClosure, releaseFacilityClosure } from "../api/FacilityClosure";
import type { FacilityClosure, CreateFacilityClosureForm } from "../types/FacilityClosure";

type ActionResult = { data: FacilityClosure; replay: boolean };

type State = {
  rows: FacilityClosure[];
  loading: boolean;
  submitting: boolean;
  lastReplay: boolean;
  load: () => Promise<void>;
  close: (form: CreateFacilityClosureForm, idempotencyKey: string) => Promise<ActionResult>;
  release: (id: number, idempotencyKey: string) => Promise<ActionResult>;
};

export const useFacilityClosureStore = create<State>((set) => ({
  rows: [],
  loading: false,
  submitting: false,
  lastReplay: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFacilityClosure(), loading: false });
  },
  async close(form, idempotencyKey) {
    set({ submitting: true });
    try {
      const result = await createFacilityClosure(form, idempotencyKey);
      set({ lastReplay: result.replay });
      return result;
    } finally {
      set({ submitting: false });
    }
  },
  async release(id, idempotencyKey) {
    set({ submitting: true });
    try {
      const result = await releaseFacilityClosure(id, idempotencyKey);
      set({ lastReplay: result.replay });
      return result;
    } finally {
      set({ submitting: false });
    }
  }
}));

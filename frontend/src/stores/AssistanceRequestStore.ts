import { create } from "zustand";
import { listAssistanceRequest } from "../api/AssistanceRequest";
import type { AssistanceRequest } from "../types/AssistanceRequest";

type State = { rows: AssistanceRequest[]; loading: boolean; load: () => Promise<void> };

export const useAssistanceRequestStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listAssistanceRequest(), loading: false });
  }
}));

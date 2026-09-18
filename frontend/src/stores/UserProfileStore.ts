import { create } from "zustand";
import { listUserProfile } from "../api/UserProfile";
import type { UserProfile } from "../types/UserProfile";

type State = { rows: UserProfile[]; loading: boolean; load: () => Promise<void> };

export const useUserProfileStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listUserProfile(), loading: false });
  }
}));

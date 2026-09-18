import { memoryStore, deepClone } from "./memoryStore";
import type { UserProfile } from "../models/UserProfile";

export const userProfileRepository = {
  findAll: (): UserProfile[] => deepClone(memoryStore.userProfile),
  save: (row: UserProfile): UserProfile => deepClone(row)
};

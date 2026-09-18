import { seed } from "../seed"; export const userProfileRepository = { findAll: () => seed.userProfile, save: (row: unknown) => row };

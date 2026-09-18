import { userProfileRepository } from "../repositories/UserProfileRepository";
import type { UserProfile } from "../models/UserProfile";

export const userProfileService = { list: () => userProfileRepository.findAll(), create: (row: unknown) => userProfileRepository.save(row as UserProfile) };

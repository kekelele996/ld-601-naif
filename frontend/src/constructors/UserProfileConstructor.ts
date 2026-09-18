import type { UserProfile } from "../types/UserProfile";

export const createDefaultUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 1 as never,
  nickname: "nickname 1" as never,
  phone: "13800000001" as never,
  mobility_type: "LOW_VISION" as never,
  assistive_device: "assistive device 1" as never,
  emergency_contact: "emergency contact 1" as never,
  preferred_language: "preferred language 1" as never,
  created_at: "2026-06-11T09:00:00Z" as never,
  ...overrides
});

export const createUserProfileForm = createDefaultUserProfile;
export const createUserProfileResponse = createDefaultUserProfile;

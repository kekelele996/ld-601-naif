import { mockData } from "../mocks/seedData";
import type { UserProfile } from "../types/UserProfile";

const endpoint = "/api/user-profile";

export async function listUserProfile(): Promise<UserProfile[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.userProfile as unknown as UserProfile[])];
}

export async function saveUserProfile(payload: UserProfile) {
  console.info("save UserProfile", payload);
  return payload;
}

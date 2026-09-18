import type { FacilityClosure, CreateFacilityClosureForm } from "../types/FacilityClosure";
import { postJson } from "./http";
import { mockData } from "../mocks/seedData";

const endpoint = "/api/facility-closure";

export async function listFacilityClosure(): Promise<FacilityClosure[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // 本地 mock 兜底，离线评审时页面仍可打开
  }
  return [...(mockData.facilityClosure as unknown as FacilityClosure[])];
}

export async function createFacilityClosure(form: CreateFacilityClosureForm, idempotencyKey: string) {
  return postJson<FacilityClosure>(endpoint, form, idempotencyKey);
}

export async function releaseFacilityClosure(id: number, idempotencyKey: string) {
  return postJson<FacilityClosure>(`${endpoint}/${id}/release`, {}, idempotencyKey);
}

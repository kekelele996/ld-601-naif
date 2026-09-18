import { memoryStore, deepClone, nextId } from "./memoryStore";
import type { AuditLogEntry } from "../models/AuditLogEntry";

export const auditLogRepository = {
  findAll: (): AuditLogEntry[] => deepClone(memoryStore.auditLog),
  append: (entry: Omit<AuditLogEntry, "id" | "created_at"> & { created_at?: string }): AuditLogEntry => {
    const created: AuditLogEntry = {
      id: nextId(memoryStore.auditLog),
      actor_id: entry.actor_id,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      created_at: entry.created_at ?? new Date().toISOString()
    };
    memoryStore.auditLog.push(created);
    return deepClone(created);
  }
};

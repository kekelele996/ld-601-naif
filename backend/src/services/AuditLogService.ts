import { auditLogRepository } from "../repositories/AuditLogRepository";
import { LOG_TEMPLATES } from "../constants/logTemplates";

// 所有写操作都要记录日志：动作名来自 constants/logTemplates，禁止在调用处散写字符串。
export const auditLogService = {
  record: (actorId: number, action: string, targetType: string, targetId: string | number) => {
    console.info("audit-log", action, `${targetType}#${targetId}`, "by", actorId);
    return auditLogRepository.append({ actor_id: actorId, action, target_type: targetType, target_id: String(targetId) });
  },
  list: () => auditLogRepository.findAll(),
  templates: LOG_TEMPLATES
};

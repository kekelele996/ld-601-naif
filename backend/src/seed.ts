import type { AccessibleFacility } from "./models/AccessibleFacility";
import type { RoutePlan } from "./models/RoutePlan";
import type { AssistanceRequest } from "./models/AssistanceRequest";
import type { BarrierReport } from "./models/BarrierReport";
import type { UserProfile } from "./models/UserProfile";
import type { FacilityClosure } from "./models/FacilityClosure";
import type { AuditLogEntry } from "./models/AuditLogEntry";

export interface SeedShape {
  userProfile: UserProfile[];
  accessibleFacility: AccessibleFacility[];
  routePlan: RoutePlan[];
  assistanceRequest: AssistanceRequest[];
  barrierReport: BarrierReport[];
  facilityClosure: FacilityClosure[];
  auditLog: AuditLogEntry[];
}

export const seed: SeedShape = {
  "userProfile": [
    {
      "id": 1,
      "nickname": "林晓",
      "phone": "13800000001",
      "mobility_type": "LOW_VISION",
      "assistive_device": "白盲杖",
      "emergency_contact": "林母 13900000001",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "nickname": "周岭",
      "phone": "13800000002",
      "mobility_type": "WHEELCHAIR",
      "assistive_device": "手动轮椅",
      "emergency_contact": "周父 13900000002",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "nickname": "吴桂芳",
      "phone": "13800000003",
      "mobility_type": "ELDERLY",
      "assistive_device": "助行器",
      "emergency_contact": "吴子 13900000003",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-13T09:00:00Z"
    },
    {
      "id": 4,
      "nickname": "巡检员-赵巡",
      "phone": "13700000004",
      "mobility_type": "LOW_VISION",
      "assistive_device": "",
      "emergency_contact": "调度室",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-14T09:00:00Z"
    }
  ],
  "accessibleFacility": [
    {
      "id": 1,
      "facility_type": "ELEVATOR",
      "name": "换乘大厅1号无障碍电梯",
      "location_code": "HUB-B1-E01",
      "floor": "B1",
      "status": "AVAILABLE",
      "last_checked_at": "2026-09-15T09:00:00Z",
      "owner_department": "枢纽运营一部",
      "note": "日常巡检正常"
    },
    {
      "id": 2,
      "facility_type": "RAMP",
      "name": "东门无障碍坡道",
      "location_code": "GATE-E-R02",
      "floor": "F1",
      "status": "AVAILABLE",
      "last_checked_at": "2026-09-16T09:00:00Z",
      "owner_department": "枢纽运营二部",
      "note": "坡道防滑条完好"
    },
    {
      "id": 3,
      "facility_type": "TACTILE_PAVING",
      "name": "连廊盲道A段",
      "location_code": "LINK-F2-T03",
      "floor": "F2",
      "status": "AVAILABLE",
      "last_checked_at": "2026-09-17T09:00:00Z",
      "owner_department": "枢纽养护部",
      "note": ""
    }
  ],
  "routePlan": [
    {
      "id": 1,
      "user_id": 2,
      "origin_text": "东门公交站",
      "destination_text": "B1换乘站台",
      "route_mode": "WHEELCHAIR",
      "risk_level": "LOW",
      "estimated_minutes": 12,
      "facility_ids": [
        2,
        1
      ],
      "created_at": "2026-09-10T09:00:00Z",
      "active": true,
      "dispatch_allowed": true
    },
    {
      "id": 2,
      "user_id": 1,
      "origin_text": "F2连廊入口",
      "destination_text": "B1换乘站台",
      "route_mode": "LOW_VISION",
      "risk_level": "LOW",
      "estimated_minutes": 15,
      "facility_ids": [
        3,
        1
      ],
      "created_at": "2026-09-11T09:00:00Z",
      "active": true,
      "dispatch_allowed": true
    },
    {
      "id": 3,
      "user_id": 3,
      "origin_text": "东门公交站",
      "destination_text": "F2服务中心",
      "route_mode": "ELDERLY",
      "risk_level": "MEDIUM",
      "estimated_minutes": 18,
      "facility_ids": [
        2,
        3
      ],
      "created_at": "2026-09-12T09:00:00Z",
      "active": true,
      "dispatch_allowed": true
    }
  ],
  "assistanceRequest": [
    {
      "id": 1,
      "user_id": 2,
      "route_plan_id": 1,
      "helper_id": 10,
      "request_time": "2026-09-18T02:30:00Z",
      "status": "ACCEPTED",
      "meet_point": "东门公交站爱心座椅",
      "contact_note": "手动轮椅，需坡道",
      "redispatch_required": false
    },
    {
      "id": 2,
      "user_id": 1,
      "route_plan_id": 2,
      "helper_id": 11,
      "request_time": "2026-09-18T03:00:00Z",
      "status": "REQUESTED",
      "meet_point": "F2连廊入口闸机",
      "contact_note": "低视力，需语音引导",
      "redispatch_required": false
    },
    {
      "id": 3,
      "user_id": 3,
      "route_plan_id": 3,
      "helper_id": 12,
      "request_time": "2026-09-18T03:20:00Z",
      "status": "COMPLETED",
      "meet_point": "东门公交站",
      "contact_note": "老年人，慢速同行",
      "redispatch_required": false
    }
  ],
  "barrierReport": [
    {
      "id": 1,
      "reporter_id": 4,
      "facility_id": 1,
      "barrier_type": "EQUIPMENT_FAULT",
      "description": "1号电梯厅门外护板翘起，疑似停运检修",
      "photo_url": "/mock/barrier-1.png",
      "verify_status": "PENDING",
      "priority": "HIGH"
    },
    {
      "id": 2,
      "reporter_id": 4,
      "facility_id": 2,
      "barrier_type": "OBSTACLE",
      "description": "坡道底部有共享单车占道，已现场挪走",
      "photo_url": "/mock/barrier-2.png",
      "verify_status": "REJECTED",
      "priority": "LOW"
    }
  ],
  "facilityClosure": [],
  "auditLog": []
};

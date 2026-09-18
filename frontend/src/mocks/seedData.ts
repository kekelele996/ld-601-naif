export const mockData = {
  "userProfile": [
    {
      "id": 1,
      "nickname": "nickname 1",
      "phone": "13800000001",
      "mobility_type": "LOW_VISION",
      "assistive_device": "assistive device 1",
      "emergency_contact": "emergency contact 1",
      "preferred_language": "preferred language 1",
      "created_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "nickname": "nickname 2",
      "phone": "13800000002",
      "mobility_type": "WHEELCHAIR",
      "assistive_device": "assistive device 2",
      "emergency_contact": "emergency contact 2",
      "preferred_language": "preferred language 2",
      "created_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "nickname": "nickname 3",
      "phone": "13800000003",
      "mobility_type": "ELDERLY",
      "assistive_device": "assistive device 3",
      "emergency_contact": "emergency contact 3",
      "preferred_language": "preferred language 3",
      "created_at": "2026-06-13T09:00:00Z"
    }
  ],
  "accessibleFacility": [
    {
      "id": 1,
      "facility_type": "LOW_VISION",
      "name": "name 1",
      "location_code": "location code 1",
      "floor": "floor 1",
      "status": "BLOCKED",
      "last_checked_at": "2026-06-11T09:00:00Z",
      "owner_department": "owner department 1",
      "note": "note 1"
    },
    {
      "id": 2,
      "facility_type": "WHEELCHAIR",
      "name": "name 2",
      "location_code": "location code 2",
      "floor": "floor 2",
      "status": "MAINTENANCE",
      "last_checked_at": "2026-06-12T09:00:00Z",
      "owner_department": "owner department 2",
      "note": "note 2"
    },
    {
      "id": 3,
      "facility_type": "ELDERLY",
      "name": "name 3",
      "location_code": "location code 3",
      "floor": "floor 3",
      "status": "AVAILABLE",
      "last_checked_at": "2026-06-13T09:00:00Z",
      "owner_department": "owner department 3",
      "note": "note 3"
    }
  ],
  "routePlan": [
    {
      "id": 1,
      "user_id": 1,
      "origin_text": "origin text 1",
      "destination_text": "destination text 1",
      "route_mode": "route mode 1",
      "risk_level": "LOW",
      "estimated_minutes": "estimated minutes 1",
      "facility_ids": [
        1,
        2
      ],
      "created_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "origin_text": "origin text 2",
      "destination_text": "destination text 2",
      "route_mode": "route mode 2",
      "risk_level": "MEDIUM",
      "estimated_minutes": "estimated minutes 2",
      "facility_ids": [
        1,
        2
      ],
      "created_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "user_id": 3,
      "origin_text": "origin text 3",
      "destination_text": "destination text 3",
      "route_mode": "route mode 3",
      "risk_level": "HIGH",
      "estimated_minutes": "estimated minutes 3",
      "facility_ids": [
        1,
        2
      ],
      "created_at": "2026-06-13T09:00:00Z"
    }
  ],
  "assistanceRequest": [
    {
      "id": 1,
      "user_id": 1,
      "route_plan_id": 1,
      "helper_id": 1,
      "request_time": "2026-06-11T09:00:00Z",
      "status": "BLOCKED",
      "meet_point": "meet point 1",
      "contact_note": "contact note 1"
    },
    {
      "id": 2,
      "user_id": 2,
      "route_plan_id": 2,
      "helper_id": 2,
      "request_time": "2026-06-12T09:00:00Z",
      "status": "MAINTENANCE",
      "meet_point": "meet point 2",
      "contact_note": "contact note 2"
    },
    {
      "id": 3,
      "user_id": 3,
      "route_plan_id": 3,
      "helper_id": 3,
      "request_time": "2026-06-13T09:00:00Z",
      "status": "AVAILABLE",
      "meet_point": "meet point 3",
      "contact_note": "contact note 3"
    }
  ],
  "barrierReport": [
    {
      "id": 1,
      "reporter_id": 1,
      "facility_id": 1,
      "barrier_type": "LOW_VISION",
      "description": "description 1",
      "photo_url": "/mock/photo_url-1.png",
      "verify_status": "BLOCKED",
      "priority": "priority 1"
    },
    {
      "id": 2,
      "reporter_id": 2,
      "facility_id": 2,
      "barrier_type": "WHEELCHAIR",
      "description": "description 2",
      "photo_url": "/mock/photo_url-2.png",
      "verify_status": "MAINTENANCE",
      "priority": "priority 2"
    },
    {
      "id": 3,
      "reporter_id": 3,
      "facility_id": 3,
      "barrier_type": "ELDERLY",
      "description": "description 3",
      "photo_url": "/mock/photo_url-3.png",
      "verify_status": "AVAILABLE",
      "priority": "priority 3"
    }
  ]
} as const;

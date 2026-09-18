CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY,
  nickname TEXT,
  phone TEXT,
  mobility_type TEXT,
  assistive_device TEXT,
  emergency_contact TEXT,
  preferred_language TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS accessible_facility (
  id INTEGER PRIMARY KEY,
  facility_type TEXT,
  name TEXT,
  location_code TEXT,
  floor TEXT,
  status TEXT,
  last_checked_at TEXT,
  owner_department TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS route_plan (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  origin_text TEXT,
  destination_text TEXT,
  route_mode TEXT,
  risk_level TEXT,
  estimated_minutes TEXT,
  facility_ids TEXT,
  created_at TEXT,
  active BOOLEAN DEFAULT TRUE,
  dispatch_allowed BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS assistance_request (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  route_plan_id TEXT,
  helper_id TEXT,
  request_time TEXT,
  status TEXT,
  meet_point TEXT,
  contact_note TEXT,
  redispatch_required BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS barrier_report (
  id INTEGER PRIMARY KEY,
  reporter_id TEXT,
  facility_id TEXT,
  barrier_type TEXT,
  description TEXT,
  photo_url TEXT,
  verify_status TEXT,
  priority TEXT
);

-- 设施封控闭环：同一设施至多一条 ACTIVE 记录（部分唯一索引保证并发安全）
CREATE TABLE IF NOT EXISTS facility_closure (
  id INTEGER PRIMARY KEY,
  facility_id INTEGER NOT NULL,
  inspector_id INTEGER,
  impact_scope TEXT NOT NULL,
  estimated_released_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  released_at TEXT,
  released_by INTEGER,
  affected_route_ids TEXT,
  returned_request_ids TEXT,
  pending_barrier_on_release BOOLEAN DEFAULT FALSE,
  previous_facility_status TEXT,
  previous_route_states TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_facility_closure_one_active
  ON facility_closure (facility_id)
  WHERE status = 'ACTIVE';

-- 幂等键表：刷新重放只生效一次
CREATE TABLE IF NOT EXISTS idempotency_record (
  idempotency_key TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);

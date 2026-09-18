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
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS assistance_request (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  route_plan_id TEXT,
  helper_id TEXT,
  request_time TEXT,
  status TEXT,
  meet_point TEXT,
  contact_note TEXT
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

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);

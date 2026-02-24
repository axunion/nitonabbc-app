CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  role         TEXT    NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  line_user_id TEXT    UNIQUE,
  invite_token TEXT    UNIQUE NOT NULL,
  invite_used  INTEGER NOT NULL DEFAULT 0 CHECK (invite_used IN (0, 1)),
  is_active    INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users (line_user_id);
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users (invite_token);

CREATE TABLE IF NOT EXISTS bulletins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  service_date  TEXT    NOT NULL UNIQUE,
  worship       TEXT    NOT NULL DEFAULT '[]',
  announcements TEXT    NOT NULL DEFAULT '[]',
  assignments   TEXT    NOT NULL DEFAULT '{}',
  created_by    INTEGER NOT NULL REFERENCES users(id),
  updated_by    INTEGER NOT NULL REFERENCES users(id),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bulletins_service_date ON bulletins (service_date);

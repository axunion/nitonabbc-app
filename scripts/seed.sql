-- Local development seed data.
-- Safe to re-run: INSERT OR IGNORE skips rows whose UNIQUE constraints already exist.
-- Run via: pnpm db:seed
-- For a clean slate: pnpm db:fresh (reset + seed)

-- Sample users (invite_token must be NOT NULL and UNIQUE)
-- id=1 is treated as the seed admin; DEV_AUTH auto-creates its own dev user separately.
-- service_roles lets the role-filtered pickers (司会/奏楽/説教/受付) show candidates.
INSERT OR IGNORE INTO users (id, name, role, line_user_id, invite_token, invite_used, is_active, service_roles)
VALUES
  (1, 'Seed Admin',  'admin',  NULL, 'seed-invite-admin-0001',  0, 1, '["説教"]'),
  (2, 'Tanaka Yuki', 'member', NULL, 'seed-invite-member-0002', 0, 1, '["司会","受付"]'),
  (3, 'Sato Hana',   'member', NULL, 'seed-invite-member-0003', 0, 1, '["奏楽"]');

-- No sample bulletin: create one from the bulletin list, which builds it from
-- the template the same way production does.

-- Local development seed data.
-- Safe to re-run: INSERT OR IGNORE skips rows whose UNIQUE constraints already exist.
-- Run via: pnpm db:seed
-- For a clean slate: pnpm db:fresh (reset + seed)

-- Sample users (invite_token must be NOT NULL and UNIQUE)
-- id=1 is treated as the seed admin; DEV_AUTH auto-creates its own dev user separately.
INSERT OR IGNORE INTO users (id, name, role, line_user_id, invite_token, invite_used, is_active)
VALUES
	(1, 'Seed Admin',  'admin',  NULL, 'seed-invite-admin-0001', 0, 1),
	(2, 'Tanaka Yuki', 'member', NULL, 'seed-invite-member-0002', 0, 1),
	(3, 'Sato Hana',   'member', NULL, 'seed-invite-member-0003', 0, 1);

-- Sample bulletin (references users.id=1 for FK constraints)
INSERT OR IGNORE INTO bulletins (id, service_date, sections, created_by, updated_by)
VALUES
	(1, '2025-01-05', '[]', 1, 1);

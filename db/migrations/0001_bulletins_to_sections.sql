-- Migration: Replace worship/announcements/assignments columns with sections JSON array
-- Run BEFORE deploying new code: wrangler d1 execute nitonabbc-db --file=db/migrations/0001_bulletins_to_sections.sql --remote
-- For local dev, reset instead: rm -rf .wrangler/state/ && pnpm dev

-- 1. Add sections column
ALTER TABLE bulletins ADD COLUMN sections TEXT NOT NULL DEFAULT '[]';

-- 2. Convert existing rows: wrap old 3 columns into SectionData[] format
UPDATE bulletins SET sections = json_array(
  json_object(
    'id', 'worship',
    'type', 'worship-program',
    'label', '礼拝プログラム',
    'data', json(worship)
  ),
  json_object(
    'id', 'announcements',
    'type', 'announcements',
    'label', 'お知らせ',
    'data', json(announcements)
  ),
  json_object(
    'id', 'assignments',
    'type', 'assignments',
    'label', '奉仕当番',
    'data', json(assignments)
  )
);

-- 3. Drop old columns (requires SQLite 3.35+; Cloudflare D1 supports this)
ALTER TABLE bulletins DROP COLUMN worship;
ALTER TABLE bulletins DROP COLUMN announcements;
ALTER TABLE bulletins DROP COLUMN assignments;

-- 4. Rename settings key worship_template -> bulletin_template and reshape value:
--    old: TemplateItem[]
--    new: SectionTemplate[] with single worship-program section wrapping the old items
INSERT OR REPLACE INTO settings (key, value, updated_at)
SELECT
  'bulletin_template',
  json_array(
    json_object(
      'id', 'worship',
      'type', 'worship-program',
      'label', '礼拝プログラム',
      'visible', json('true'),
      'config', json_object('items', json(value))
    )
  ),
  datetime('now')
FROM settings WHERE key = 'worship_template';

DELETE FROM settings WHERE key = 'worship_template';

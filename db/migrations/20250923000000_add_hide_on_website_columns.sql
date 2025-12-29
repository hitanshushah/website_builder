-- migrate:up
ALTER TABLE experiences ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;
ALTER TABLE certifications ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;
ALTER TABLE achievements ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;
ALTER TABLE publications ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;
ALTER TABLE education ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;
ALTER TABLE skills ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN hide_on_website BOOLEAN DEFAULT FALSE;

-- migrate:down
ALTER TABLE experiences DROP COLUMN hide_on_website;
ALTER TABLE certifications DROP COLUMN hide_on_website;
ALTER TABLE achievements DROP COLUMN hide_on_website;
ALTER TABLE publications DROP COLUMN hide_on_website;
ALTER TABLE education DROP COLUMN hide_on_website;
ALTER TABLE skills DROP COLUMN hide_on_website;
ALTER TABLE projects DROP COLUMN hide_on_website;

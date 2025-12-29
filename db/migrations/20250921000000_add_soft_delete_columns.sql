-- migrate:up
ALTER TABLE experiences ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE certifications ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE publications ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE achievements ADD COLUMN deleted_at TIMESTAMP NULL;

-- migrate:down
ALTER TABLE experiences DROP COLUMN deleted_at;
ALTER TABLE certifications DROP COLUMN deleted_at;
ALTER TABLE publications DROP COLUMN deleted_at;
ALTER TABLE achievements DROP COLUMN deleted_at;

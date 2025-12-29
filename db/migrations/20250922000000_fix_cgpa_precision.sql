-- migrate:up
ALTER TABLE education ALTER COLUMN cgpa TYPE DECIMAL(4,2);

-- migrate:down
ALTER TABLE education ALTER COLUMN cgpa TYPE DECIMAL(3,2);

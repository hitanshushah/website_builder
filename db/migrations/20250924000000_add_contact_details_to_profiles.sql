-- migrate:up
ALTER TABLE profiles 
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN secondary_email VARCHAR(255),
ADD COLUMN introduction TEXT,
ADD COLUMN hide_phone_on_website BOOLEAN DEFAULT FALSE,
ADD COLUMN hide_secondary_email_on_website BOOLEAN DEFAULT FALSE,
ADD COLUMN hide_introduction_on_website BOOLEAN DEFAULT FALSE,
ADD COLUMN override_email BOOLEAN DEFAULT FALSE;

-- migrate:down
ALTER TABLE profiles 
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS secondary_email,
DROP COLUMN IF EXISTS introduction,
DROP COLUMN IF EXISTS hide_phone_on_website,
DROP COLUMN IF EXISTS hide_secondary_email_on_website,
DROP COLUMN IF EXISTS hide_introduction_on_website,
DROP COLUMN IF EXISTS override_email;


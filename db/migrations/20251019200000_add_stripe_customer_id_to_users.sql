-- migrate:up
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) NULL;

-- Add index for faster lookups
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- migrate:down
DROP INDEX IF EXISTS idx_users_stripe_customer_id;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;

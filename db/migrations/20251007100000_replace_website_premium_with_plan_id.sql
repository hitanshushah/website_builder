-- migrate:up
-- Add premium_plan_id column with foreign key
ALTER TABLE users 
ADD COLUMN premium_plan_id INTEGER DEFAULT 1 NOT NULL,
ADD CONSTRAINT fk_users_premium_plan 
  FOREIGN KEY (premium_plan_id) 
  REFERENCES premium_plans(id);

-- Set existing premium users to plus plan (id=2), others stay at basic (id=1)
UPDATE users SET premium_plan_id = 2 WHERE website_premium = true;

-- Drop the old boolean column
ALTER TABLE users DROP COLUMN IF EXISTS website_premium;

-- migrate:down
-- Restore the old column
ALTER TABLE users ADD COLUMN website_premium BOOLEAN DEFAULT false;

-- Set website_premium based on plan
UPDATE users SET website_premium = true WHERE premium_plan_id IN (2, 3);

-- Remove the new column
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS fk_users_premium_plan,
DROP COLUMN IF EXISTS premium_plan_id;


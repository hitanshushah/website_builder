-- migrate:up
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    identifier text not null,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    thumbnail text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);


insert into templates (name, identifier, thumbnail) 
values ('test', 'abcd', 'http://localhost:4810/projectsdashboard/akadmin/images/1757982824_1757035080_Screenshot 2025-09-04 at 9.17.28 PM.png');
-- Create index on is_active for filtering active templates
CREATE INDEX idx_templates_is_active ON templates(is_active);

-- migrate:down
DROP INDEX IF EXISTS idx_templates_is_active;
DROP TABLE IF EXISTS templates;


-- migrate:up
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    identifier text not null,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    thumbnail text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);


insert into templates (name, identifier, thumbnail, is_default) 
values ('Nova', 'GbSPaBFr', 'https://minio.dev.hitanshushah.com/templates/nova.png', TRUE),
('Nebula', 'uYkJhyRn', 'https://minio.dev.hitanshushah.com/templates/nebula.png', FALSE),
('Astra', 'XFtSwkva', 'https://minio.dev.hitanshushah.com/templates/astra.png', FALSE),
('Orion', 'FbegNBEm', 'https://minio.dev.hitanshushah.com/templates/orion.png', FALSE),
('Titan', 'TnpaLjip', 'https://minio.dev.hitanshushah.com/templates/titan.png', FALSE),
('Zenith', 'BzGQHqTm', 'https://minio.dev.hitanshushah.com/templates/zenith.png', FALSE);

update templates set is_premium = TRUE where identifier = 'TnpaLjip';
update templates set is_premium = TRUE where identifier = 'uYkJhyRn';
-- Create index on is_active for filtering active templates
CREATE INDEX idx_templates_is_active ON templates(is_active);

-- migrate:down
DROP INDEX IF EXISTS idx_templates_is_active;
DROP TABLE IF EXISTS templates;

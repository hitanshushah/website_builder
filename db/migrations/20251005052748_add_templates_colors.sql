-- migrate:up
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    key text UNIQUE NOT NULL,
    name text NOT NULL,
    primary_color text NOT NULL,
    secondary_color text NOT NULL,
    background_color text NOT NULL,
    fourth_color text DEFAULT NULL,
    user_id int DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_color_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_templates (
    id SERIAL PRIMARY KEY,
    user_id int NOT NULL,
    template_id int NOT NULL,
    color_id int NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE CASCADE
);

INSERT INTO colors (key, name, primary_color, secondary_color, background_color, fourth_color, user_id, is_active, is_default)
    VALUES
('ocean_blue', 'Ocean Blue', '#2563eb', '#1e40af', '#3b82f6', NULL, NULL, TRUE, TRUE),
('forest_green', 'Forest Green', '#059669', '#047857', '#10b981', NULL, NULL, TRUE, FALSE),
('sunset_orange', 'Sunset Orange', '#ea580c', '#c2410c', '#f97316', NULL, NULL, TRUE, FALSE),
('royal_purple', 'Royal Purple', '#7c3aed', '#6d28d9', '#8b5cf6', NULL, NULL, TRUE, FALSE),
('rose_pink', 'Rose Pink', '#e11d48', '#be185d', '#f43f5e', NULL, NULL, TRUE, FALSE),
('charcoal_gray', 'Charcoal Gray', '#374151', '#1f2937', '#6b7280', NULL, NULL, TRUE, FALSE);


-- migrate:down


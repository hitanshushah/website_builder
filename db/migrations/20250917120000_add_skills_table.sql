-- migrate:up
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_skill FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_skill_category FOREIGN KEY(category_id) REFERENCES skill_categories(id) ON DELETE SET NULL
);

-- migrate:down
DROP TABLE IF EXISTS skills;

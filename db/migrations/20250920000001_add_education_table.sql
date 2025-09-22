-- migrate:up
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    university_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    from_date DATE,
    end_date DATE,
    location VARCHAR(255),
    cgpa DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_profile_education FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- migrate:down
DROP TABLE IF EXISTS education;

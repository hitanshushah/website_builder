-- migrate:up
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT,
    skills TEXT[],
    company_logo TEXT),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_experience FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    institute_name VARCHAR(255),
    certificate_pdf VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_certification FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_achievement FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    paper_name VARCHAR(255) NOT NULL,
    conference_name VARCHAR(255),
    description TEXT,
    published_date DATE,
    paper_pdf VARCHAR(255),
    paper_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_publication FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);


-- migrate:down


-- migrate:up
CREATE TABLE IF NOT EXISTS premium_plans (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


INSERT INTO premium_plans (key, name, price) VALUES
    ('basic', 'Basic', 0.00),
    ('plus', 'Plus', 5.99),
    ('pro', 'Pro', 9.99)
ON CONFLICT (key) DO NOTHING;

-- migrate:down
DROP TABLE IF EXISTS premium_plans;

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(250),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp,
    price_range INT CHECK(price_range >= 1 and price_range <= 1000)
);
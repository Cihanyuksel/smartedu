const coursesSchema = {
  createTable: `CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(250),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp,
    price_range INT CHECK(price_range >= 1 and price_range <= 1000),
    category_id BIGINT REFERENCES category(id)
        )`,
};

const CoursesSchema = (pool) => {
  for (let queryName in coursesSchema) {
    pool.query(coursesSchema[queryName], (error, result) => {
      if (error) {
        throw error;
      }
    });
  }
};

module.exports = CoursesSchema;

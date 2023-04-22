const categorySchema = {
  createTable: `CREATE TABLE IF NOT EXISTS category (
        id BIGINT PRIMARY KEY,
        NAME VARCHAR(50) NOT NULL UNIQUE
        )`,
};

const CategorySchema = (pool) => {
  for (let queryName in categorySchema) {
    pool.query(categorySchema[queryName], (error, result) => {
      if (error) {
        throw error;
      }
    });
  }
};

module.exports = CategorySchema;

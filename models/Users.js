const userSchema = {
  createTable: `CREATE TABLE IF NOT EXISTS users (
        ID SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) UNIQUE,
        password VARCHAR(18) NOT NULL
      )`,
};

const UserSchema = (pool) => {
  for (let queryName in userSchema) {
    pool.query(userSchema[queryName], (error, result) => {
      if (error) {
        throw error;
      }
    });
  }
};

module.exports = UserSchema;

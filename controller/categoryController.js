const db = require("../db");
const CategorySchema = require("../models/Category");

CategorySchema(db);

createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    console.log(name);
    const newCategory = await db.query("insert into category(name) values($1) returning*", [name]);
    res.status(201).json({
      status: "success",
      data: {
        category: newCategory.rowCount[0],
      },
    });
  } catch (err) {
    // If UNIQUE constraint is violated
    if (err.code == "23505") {
      const error = new Error("The course is already available!");
      error.status = 409;
      res.status(409).json({
        status: "fail",
        error: error.message,
      });
      next(error);
    } else {
      console.error(err.message);
      const error = new Error("Something Went Wrong!");
      error.status = 500;
      next(error);
    }
  }
};

deleteCategory = async (req, res) => {
  const { id } = req.params;
  await db.query(`DELETE FROM category WHERE ID = ${id}`);
  try {
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

getAllCategory = async (req, res) => {
  const categories = await db.query("SELECT * FROM category");
  res.status(200).json({ categories: categories.rows });
};

module.exports = {
  createCategory,
  deleteCategory,
  getAllCategory,
};

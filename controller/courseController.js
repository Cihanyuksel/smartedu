const db = require("../db");
const CoursesSchema = require("../models/Courses");

CoursesSchema(db);

// GET
getAllCourses = async (req, res) => {
  console.log(req);
  try {
    const results = await db.query("select * from courses");
    const courses = results.rows;
    res.status(200).json([...courses]);
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error,
    });
  }
};

getCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await db.query(`select * from courses where id = ${id}`);
    const course = results.rows[0];
    if (course) {
      res.status(200).json(course);
    } else {
      throw new Error(`Course with id ${id} not found`);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      error: error.message,
    });
  }
};

// POST
createCourse = async (req, res, next) => {
  try {
    const { name, description, price_range, category_id } = req.body;
    const newCourse = await db.query(
      "insert into courses(name, description, price_range, category_id) values($1, $2, $3, $4) returning *",
      [name, description, price_range, category_id]
    );
    res.status(201).json({
      status: "success",
      data: {
        courses: newCourse.rows[0],
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

// DELETE
deleteCourse = async (req, res) => {
  const { id } = req.params;
  await db.query(`DELETE FROM courses where ID = ${id}`);
  try {
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  deleteCourse,
};
// ALTER TABLE table_name
// ADD CONSTRAINT constraint_name UNIQUE (column1, column2, ... column_n);

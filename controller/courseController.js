const db = require("../db");

// GET
getAllCourses = async (req, res) => {
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
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

// POST
createCourse = async (req, res) => {
  try {
    const { name, description, price_range } = req.body;
    const newCourse = await db.query(
      "insert into courses(name, description, price_range) values($1, $2, $3) returning *",
      [name, description, price_range]
    );
    res.status(201).json({
      status: "success",
      data: {
        courses: newCourse.rows[0],
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
};

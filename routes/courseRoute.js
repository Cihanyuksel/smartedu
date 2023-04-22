const express = require("express");
const { getAllCourses, createCourse, getCourse, deleteCourse } = require("../controller/courseController");

const router = express.Router();

router.route("/").get(getAllCourses);
router.route("/").post(createCourse);
router.route("/:id").get(getCourse);
router.route("/:id").delete(deleteCourse);

module.exports = router;

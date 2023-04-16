const express = require("express");
const courseController = require("../controller/courseController");

const router = express.Router();

router.route("/").get(courseController.getAllCourses);
router.route("/").post(courseController.createCourse);
router.route("/:id").get(courseController.getCourse);

module.exports = router;

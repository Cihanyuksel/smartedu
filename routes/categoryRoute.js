const express = require("express");
const { createCategory, deleteCategory, getAllCategory } = require("../controller/categoryController");

const router = express.Router();

router.route("/").post(createCategory);
router.route("/").get(getAllCategory);
router.route("/:id").delete(deleteCategory);

module.exports = router;

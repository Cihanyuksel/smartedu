const express = require("express");
const { registerUser, loginUser, handleRefresh, logoutUser } = require("../controller/authContreller");

const router = express.Router();

// router.post("/login", loginUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/refresh").post(handleRefresh);

module.exports = router;

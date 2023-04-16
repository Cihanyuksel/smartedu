const express = require("express");
const dotenv = require("dotenv").config();
const db = require("../db");
const courseRoute = require("../routes/courseRoute");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/courses", courseRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});

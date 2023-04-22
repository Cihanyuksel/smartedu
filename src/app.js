const express = require("express");
const morgan = require("morgan");
// Routes
const courseRoute = require("../routes/courseRoute");
const categoryRoute = require("../routes/categoryRoute");
const userRoute = require("../routes/userRoute");
// Middleware
const { checkFields } = require("../middleware/checkField");

const app = express();

// -------------------------------
// const fs = require("fs");
// const path = require("path");
// const db = require("../db");
// const filePath = path.join(__dirname, "../models/User.sql");
// const sql = fs.readFileSync(filePath).toString();

// db.query(sql, (err, res) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log("Tables created successfully");
// });
// -------------------------------
// Middleware
app.use(express.json());
app.use(morgan("combined"));

// Routes
app.use("/api/v1/courses", checkFields, courseRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/users", userRoute);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

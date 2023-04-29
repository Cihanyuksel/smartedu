// Routes
const courseRoute = require("../routes/courseRoute");
const categoryRoute = require("../routes/categoryRoute");
const userRoute = require("../routes/userRoute");
// Third Party
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const db = require("../db");
// Middleware
const isAuth = require("../middleware/isAuth");
const compressFilter = require("../utils/compressFilter");
// ------

const app = express();

// Compression is used to reduce the size of the response body
app.use(compression({ filter: compressFilter }));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

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
app.use(cookieParser());
// origin is given a array if we want to have multiple origins later
// origin: String("http://localhost:3000|http://localhost:4000").split("|"),
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Routes
app.use("/api/v1/courses", isAuth, courseRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/users", userRoute);

app.get("/protected", isAuth, async (req, res) => {
  // console.log("aaaaaaaa", req.payload);
  const find = await db.query(`select * from users where id = ${req.payload.userId}`);
  const user = find.rows[0];
  res.json({ message: `Hello ${user.name}` });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

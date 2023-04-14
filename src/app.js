const express = require("express");
const dotenv = require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.end("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});

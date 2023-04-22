const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = require("../models/Users");

UserSchema(db);

const secretKey = process.env.SECRET_KEY;

registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [
      name,
      email,
      hashedPassword,
    ]);
    res.status(201).json({ status: "success", result });
  } catch (error) {
    res.status(500).send(error);
  }
};

loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await db.query(`SELECT email, password FROM users WHERE email= $1;`, [email]); //Verifying if the user exists in the database
    const user = data.rows;
    console.log(user);
    if (user.length === 0) {
      res.status(400).json({
        error: "User is not registered, Sign Up first",
      });
    } else {
      bcrypt.compare(password, user[0].password, (error, result) => {
        console.log(error);
        if (error) {
          res.status(500).json({
            error: "Server Error",
          });
        } else if (result === true) {
          const token = jwt.sign({ email }, secretKey);
          res.status(200).json({
            message: "User signed in!", // Successful login
            token,
          });
        } else {
          if (result !== true) {
            res.status(400).json({
              error: "Enter correct password!", // Wrong password
            });
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Database error occurred while signing in!", //Database connection error
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

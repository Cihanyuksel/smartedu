const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = require("../models/Users");
const { clearRefreshTokenCookieConfig, refreshTokenCookieConfig } = require("../config/configCookie");
const { createAccessToken, createRefreshToken } = require("../utils/generateToken");
// const createRefreshToken = require("../utils/generateToken");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET_KEY;
const refreshTokenCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME;

UserSchema(db);

registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Username and password are required.", status: 400 });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const result = await db.query("select count(*) from users where email=$1", [email]);

  if (result.rows[0].count > 0) {
    return res.status(409).json({ message: "This email address is already in use.", status: 409 });
  }

  try {
    const data = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [
      name,
      email,
      hashedPassword,
    ]);
    const user = data.rows[0];
    res.status(201).json({ message: "success", user, status: 201 });
  } catch (error) {
    res.status(500).send(error);
  }
};

loginUser = async (req, res) => {
  const cookies = req.cookies;
  console.log(`cookie available at login: ${JSON.stringify(cookies)}`);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Username and password are required.", status: 400 });
    }
    const data = await db.query(`SELECT * FROM users WHERE email= $1;`, [email]);
    const user = data.rows;

    if (user.length === 0) {
      res.status(401).json({
        status: 401,
        message: "User is not registered, Sign Up first",
      });
    } else {
      bcrypt.compare(password, user[0].password, async (error, result) => {
        if (error) {
          res.status(500).json({
            status: 500,
            error: "Server Error",
          });
        } else if (result === true) {
          if (cookies?.[refreshTokenCookieName]) {
            const refreshToken1 = cookies[refreshTokenCookieName];

            // check if the given refresh token is from the current user
            const checkRefreshTokenQuery = {
              text: "SELECT * FROM users WHERE $1 = ANY(refreshtoken) AND id = $2",
              values: [refreshToken1, user[0].id],
            };
            const checkRefreshTokenResult = await db.query(checkRefreshTokenQuery);
            const checkRefreshToken = checkRefreshTokenResult.rows[0];

            if (!checkRefreshToken) {
              // if this token does not exist in the database or belongs to another user,
              // then we clear all refresh tokens from the user in the db
              const clearRefreshTokensQuery = {
                text: "UPDATE users SET refreshtoken = ARRAY[]::text[] WHERE id = $1",
                values: [user[0].id],
              };
              await db.query(clearRefreshTokensQuery);
            } else {
              // else everything is fine and we just need to delete the one token
              const deleteRefreshTokenQuery = {
                text: "UPDATE users SET refreshtoken = array_remove(refreshtoken, $1::text) WHERE id = $2",
                values: [refreshToken1, user[0].id],
              };
              await db.query(deleteRefreshTokenQuery);
            }
          }

          const accessToken = jwt.sign({ userId: user[0].id }, accessTokenSecret, { expiresIn: "30s" });
          const refreshToken = jwt.sign({ userId: user[0].id }, refreshTokenSecret, { expiresIn: "1d" });

          // Add the new refresh token to the user's refresh token array in the database
          const addRefreshTokenQuery = {
            text: "UPDATE users SET refreshtoken = refreshtoken || $1 WHERE id = $2",
            values: [[refreshToken], user[0].id],
          };
          await db.query(addRefreshTokenQuery);

          // Set the new refresh token as a cookie
          res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieConfig);

          res.status(200).json({
            status: 200,
            message: "User signed in!",
            accessToken,
            refreshToken,
          });
        } else {
          if (result !== true) {
            res.status(400).json({
              status: 200,
              error: "Enter correct password!",
            });
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Database error occurred while signing in!",
    });
  }
  console.log(cookies);
};

logoutUser = async (req, res) => {
  const refreshToken = req.cookies[refreshTokenCookieName];

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token found, user is not logged in.", status: 400 });
  }

  try {
    const foundRefreshToken = await db.query("SELECT * FROM users WHERE refreshtoken @> ARRAY[$1]::text[]", [
      refreshToken,
    ]);

    if (!foundRefreshToken.rowCount) {
      res.clearCookie(refreshTokenCookieName, clearRefreshTokenCookieConfig);
      return res.status(400).json({ message: "Invalid refresh token. The user may not be logged in." });
    } else {
      const userId = foundRefreshToken.rows[0].id;

      // Remove refresh token from the user's record in the database
      await db.query("UPDATE users SET refreshtoken = array_remove(refreshtoken, $1) WHERE id = $2", [
        refreshToken,
        userId,
      ]);

      // Clear refresh token cookie
      res.clearCookie(refreshTokenCookieName, clearRefreshTokenCookieConfig);
      return res.status(200).json({ message: "User logged out successfully." });
    }
  } catch (error) {
    res.status(500).json({
      error: "Database error occurred while logging out!",
    });
  }
};

handleRefresh = async (req, res) => {
  const refreshToken = req.cookies[refreshTokenCookieName];
  if (!refreshToken) return res.sendStatus(401);

  res.clearCookie(refreshTokenCookieName, clearRefreshTokenCookieConfig);
  const foundRefreshToken = await db.query("SELECT * FROM users WHERE refreshtoken @> ARRAY[$1]::text[]", [
    refreshToken,
  ]);
  if (!foundRefreshToken.rowCount) {
    return res.sendStatus(403);
  } else {
    jwt.verify(refreshToken, refreshTokenSecret, async (error, payload) => {
      if (error) {
        res.status(403).json({ error: error.message });
      } else {
        const accessToken = createAccessToken(payload.userId);
        const newRefreshToken = createRefreshToken(payload.userId);

        await db.query("UPDATE users SET refreshtoken = array_remove(refreshtoken, $1) || $2::text WHERE id = $3", [
          refreshToken,
          newRefreshToken,
          payload.userId,
        ]);

        res.cookie(refreshTokenCookieName, newRefreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        return res.json({ accessToken });
      }
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  handleRefresh,
};

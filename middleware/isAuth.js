// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv").config();

// module.exports = (req, res, next) => {
//   const authHeader = req.headers?.authorization;
//   const token = authHeader && authHeader.split(" ")[1];
//   console.log(token);
//   if (!authHeader || !authHeader?.startsWith("Bearer "))
//     return res.status(401).json({ message: "Unauthorization error" }); // Access token not found
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (error, payload) => {
//     if (error) return res.status(403).json({ message: "invalid access token" });
//     req.payload = payload;
//     console.log("REQQQQQQQQQQQQQ", req.payload);
//     next();
//   });
// };

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

module.exports = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!authHeader || !authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorization error" }); // Access token not found
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        // Token süresi dolduysa, yeni bir access_token alın
        const refreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME];
        if (!refreshToken) return res.status(401).json({ message: "No refresh token found" });

        try {
          const newAccessToken = await refreshAccessToken(refreshToken);
          req.headers.authorization = `Bearer ${newAccessToken}`;
          jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET_KEY, (newTokenError, newPayload) => {
            if (newTokenError) return res.status(403).json({ message: "Invalid access token" });
            req.payload = newPayload;
            console.log("New token payload:", req.payload);
            next();
          });
        } catch (refreshError) {
          console.error(refreshError);
          res.status(403).json({ message: "Failed to refresh access token" });
        }
      } else {
        return res.status(403).json({ message: "Invalid access token" });
      }
    } else {
      req.payload = payload;
      console.log("REQ Payload:", req.payload);
      next();
    }
  });
};

async function refreshAccessToken(refreshToken) {
  return new Promise(async (resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (error, payload) => {
      if (error) {
        reject(error);
      } else {
        const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.ACCESS_TOKEN_SECRET_KEY, {
          expiresIn: "30s",
        });
        resolve(newAccessToken);
      }
    });
  });
}

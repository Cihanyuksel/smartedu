const { sign } = require("jsonwebtoken");

createAccessToken = (userId) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "30s",
  });
};

createRefreshToken = (userId) => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: "5d",
  });
};

module.exports = {
  createRefreshToken,
  createAccessToken,
};

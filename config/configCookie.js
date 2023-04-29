module.exports = refreshTokenCookieConfig = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

module.exports = clearRefreshTokenCookieConfig = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
};

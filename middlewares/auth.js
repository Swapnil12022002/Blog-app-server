const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthenticatedError } = require("../errors");
const asyncWrapper = require("./async");

const authMiddleware = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    payload = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = await User.findById(payload.id).select("-password");
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
});

module.exports = authMiddleware;

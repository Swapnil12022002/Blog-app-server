const CustomAPIError = require("./custom-error");
const UnauthenticatedError = require("./unauthenticated");
const BadRequestError = require("./bad-request");
const NotFoundError = require("./not-found-error");

module.exports = {
  CustomAPIError,
  UnauthenticatedError,
  BadRequestError,
  NotFoundError,
};

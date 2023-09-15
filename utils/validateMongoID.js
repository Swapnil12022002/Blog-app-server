const mongoose = require("mongoose");
const { BadRequestError } = require("../errors");

const validateID = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new BadRequestError("Invalid ID");
};

module.exports = validateID;

const mongoose = require("mongoose");

const connectDB = async (url) => {
  mongoose.connect(url);
  console.log("CONNECTED TO DB!!");
};

module.exports = connectDB;

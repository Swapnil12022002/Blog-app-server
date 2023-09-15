const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user is required"]
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
},{timestamps: true})

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
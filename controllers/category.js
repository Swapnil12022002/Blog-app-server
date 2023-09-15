const asyncWrapper = require("../middlewares/async");
const Category = require("../models/Category");

const createCategoryCtrl = asyncWrapper(async (req, res) => {
  const category = await Category.create({
    user: req.user._id,
    title: req.body.title,
  });

  res.json(category);
});

const fetchCategoriesCtrl = asyncWrapper(async (req, res) => {
  const categories = await Category.find({})
    .populate("user")
    .sort("-createdAt");

  res.json(categories);
});

const fetchCategoryCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate("user");

  res.json(category);
});

const updateCategoryCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(
    id,
    {
      title: req.body.title,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json(category);
});

const deleteCategoryCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);

  res.json(category);
});

module.exports = {
  createCategoryCtrl,
  fetchCategoriesCtrl,
  fetchCategoryCtrl,
  updateCategoryCtrl,
  deleteCategoryCtrl,
};

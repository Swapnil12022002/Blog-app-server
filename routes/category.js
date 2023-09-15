const express = require("express");
const {
  createCategoryCtrl,
  fetchCategoriesCtrl,
  fetchCategoryCtrl,
  updateCategoryCtrl,
  deleteCategoryCtrl,
} = require("../controllers/category");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router
  .route("/:id")
  .get(authMiddleware, fetchCategoryCtrl)
  .put(authMiddleware, updateCategoryCtrl)
  .delete(authMiddleware, deleteCategoryCtrl);
router
  .route("/")
  .post(authMiddleware, createCategoryCtrl)
  .get(authMiddleware, fetchCategoriesCtrl);

module.exports = router;

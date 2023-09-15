const express = require("express");
const {createCategoryCtrl, fetchCategoriesCtrl, fetchCategoryCtrl, updateCategoryCtrl} = require("../controllers/category");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router.route("/").post(authMiddleware, createCategoryCtrl).get(authMiddleware, fetchCategoriesCtrl);
router.route("/:id").get(authMiddleware, fetchCategoryCtrl).put(authMiddleware, updateCategoryCtrl);

module.exports = router;
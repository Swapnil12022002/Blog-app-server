const express = require("express");
const {
  createCommentCtrl,
  fetchAllCommentsCtrl,
  fetchCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl,
} = require("../controllers/comment");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router
  .route("/")
  .post(authMiddleware, createCommentCtrl)
  .get(fetchAllCommentsCtrl);

router
  .route("/:id")
  .get(authMiddleware, fetchCommentCtrl)
  .put(authMiddleware, updateCommentCtrl)
  .delete(authMiddleware, deleteCommentCtrl);

module.exports = router;

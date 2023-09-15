const express = require("express");
const {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  updatePostCtrl,
  deletePostCtrl,
  toggleAddLikeToPostCtrl,
  toggleAddDislikeToPostCtrl,
} = require("../controllers/post");
const authMiddleware = require("../middlewares/auth");
const { photoUpload, postImgResize } = require("../middlewares/photoUpload");
const router = express.Router();

router.route("/likes").put(authMiddleware, toggleAddLikeToPostCtrl);
router.route("/dislikes").put(authMiddleware, toggleAddDislikeToPostCtrl);
router
  .route("/:id")
  .get(fetchPostCtrl)
  .put(authMiddleware, updatePostCtrl)
  .delete(authMiddleware, deletePostCtrl);
router
  .route("/")
  .get(fetchPostsCtrl)
  .post(
    authMiddleware,
    photoUpload.single("image"),
    postImgResize,
    createPostCtrl
  );

module.exports = router;

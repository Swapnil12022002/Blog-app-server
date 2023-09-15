const express = require("express");
const router = express.Router();
const {
  userRegisterCtrl,
  userLoginCtrl,
  getAllUsersCtrl,
  deleteUserCtrl,
  getSingleUserCtrl,
  userProfileCtrl,
  updateProfileCtrl,
  updatePasswordCtrl,
  followingUserCtrl,
  unFollowingUserCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  forgotPasswordTokenCtrl,
  resetPasswordCtrl,
  profilePhotoUploadCtrl,
} = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");
const {
  photoUpload,
  profilePhotoResize,
} = require("../middlewares/photoUpload");

router.route("/").get(authMiddleware, getAllUsersCtrl);
router.route("/register").post(userRegisterCtrl);
router.route("/login").post(userLoginCtrl);
router.route("/profile/:id").get(authMiddleware, userProfileCtrl);
router
  .route("/generate-verify-email-token")
  .post(authMiddleware, generateVerificationTokenCtrl);
router.route("/generate-forgot-password-token").post(forgotPasswordTokenCtrl);
router.route("/verify-account").post(authMiddleware, accountVerificationCtrl);
router.route("/reset-password").post(resetPasswordCtrl);
router
  .route("/profilephoto-upload")
  .put(
    authMiddleware,
    photoUpload.single("image"),
    profilePhotoResize,
    profilePhotoUploadCtrl
  );
router.route("/follow").put(authMiddleware, followingUserCtrl);
router.route("/unfollow").put(authMiddleware, unFollowingUserCtrl);
router.route("/block-user/:id").put(authMiddleware, blockUserCtrl);
router.route("/unblock-user/:id").put(authMiddleware, unBlockUserCtrl);
router.route("/password/:id").put(authMiddleware, updatePasswordCtrl);

router
  .route("/:id")
  .get(getSingleUserCtrl)
  .delete(deleteUserCtrl)
  .put(authMiddleware, updateProfileCtrl);

module.exports = router;

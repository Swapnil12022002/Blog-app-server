const User = require("../models/User");
const asyncWrapper = require("../middlewares/async");
const generateToken = require("../config/generate-token");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
const { StatusCodes } = require("http-status-codes");
const validateID = require("../utils/validateMongoID");
const nodemailer = require("nodemailer");
const fs = require("fs");
const crypto = require("crypto");
const cloudinaryUploadImg = require("../utils/cloudinary");

const userRegisterCtrl = asyncWrapper(async (req, res) => {
  const checkUser = await User.findOne({ email: req.body.email });
  if (checkUser) {
    throw new BadRequestError(
      `User already exists with email : ${req.body.email}`
    );
  }

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    user,
  });
});

const userLoginCtrl = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    throw new NotFoundError(`No User registered with email : ${email}`);

  const isMatched = await user.matchPassword(password);
  if (!isMatched)
    throw new UnauthenticatedError("Incorrect Password! Try again.");

  const token = generateToken(user._id);
  res.status(StatusCodes.OK).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePhoto: user.profilePhoto,
    isAdmin: user.isAdmin,
    token,
  });
});

const getAllUsersCtrl = asyncWrapper(async (req, res) => {
  const users = await User.find();
  res.status(StatusCodes.OK).json(users);
});

const deleteUserCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  res.status(StatusCodes.OK).json(user);
});

const getSingleUserCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const user = await User.findById(id).populate("posts");
  if (!user) throw new NotFoundError(`User not found with id : ${id}`);

  res.status(StatusCodes.OK).json(user);
});

const userProfileCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const myProfile = await User.findById(id);
  if (!myProfile) throw new NotFoundError(`User not found with id : ${id}`);

  res.status(StatusCodes.OK).json(myProfile);
});

const updateProfileCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);

  if (req.user._id.toString() !== id.toString()) {
    throw new UnauthenticatedError(`you can only update your own profile`);
  }

  const { firstName, lastName, email, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { firstName, lastName, email, bio },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError(`User not found with id : ${id}`);
  } else {
    res.status(StatusCodes.OK).json(user);
  }
});

const updatePasswordCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);

  if (req.user._id.toString() !== id.toString()) {
    throw new UnauthenticatedError(`you can only update your own password`);
  }

  const user = await User.findById(id).select("+password");
  if (!user) {
    throw new NotFoundError(`User not found with id : ${id}`);
  } else {
    const { oldPassword, newPassword } = req.body;
    const isMatched = await user.matchPassword(oldPassword);
    if (!isMatched) {
      throw new UnauthenticatedError(
        "You need to enter your old Password correctly in order to update it."
      );
    } else {
      user.password = newPassword;
      await user.save();
    }
    res.status(StatusCodes.OK).json(user);
  }
});

const followingUserCtrl = asyncWrapper(async (req, res) => {
  const { followId } = req.body;
  validateID(followId);
  const loginUserId = req.user._id;

  const targetUser = await User.findById(followId);
  const alreadyFollowing = targetUser.followers.find(
    (userId) => userId.toString() === loginUserId.toString()
  );
  if (alreadyFollowing)
    throw new BadRequestError("You are already following this user");

  await User.findByIdAndUpdate(
    followId,
    { $push: { followers: loginUserId } },
    { new: true, runValidators: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    { $push: { following: followId } },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json("You have successfully followed this user.");
});

const unFollowingUserCtrl = asyncWrapper(async (req, res) => {
  const { unFollowId } = req.body;
  validateID(unFollowId);
  const loginUserId = req.user._id;

  const targetUser = await User.findById(unFollowId);
  const alreadyFollowing = targetUser.followers.find(
    (userId) => userId.toString() === loginUserId.toString()
  );

  if (!alreadyFollowing) {
    throw new BadRequestError("You are not following this user.");
  } else {
    await User.findByIdAndUpdate(
      unFollowId,
      { $pull: { followers: loginUserId } },
      { new: true, runValidators: true }
    );

    await User.findByIdAndUpdate(
      loginUserId,
      { $pull: { following: unFollowId } },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json("You have unFollowed this user.");
  }
});

const blockUserCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json(user);
});

const unBlockUserCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json(user);
});

const generateVerificationTokenCtrl = asyncWrapper(async (req, res) => {
  const { _id: loginUserId } = req.user;
  const user = await User.findById(loginUserId);
  const verificationToken = user.createAccountVerificationToken();
  await user.save();

  const resetUrl = `If you requested to verify your email,verify within 30 minutes otherwise ignore this message. <a href= "http://localhost:3000/verify-account/${verificationToken}">Click here to activate your account. </a>`;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  let msg = {
    from: process.env.EMAIL, // Sender email
    to: user.email, // Receiver email
    subject: "Verification", // Title email
    html: resetUrl, // Html in email
  };

  await transporter.sendMail(msg);

  res.json(resetUrl);
});

const accountVerificationCtrl = asyncWrapper(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new NotFoundError("Invalid verification Token or Token has expired.");

  user.isAccountVerified = true;
  user.accountVerificationToken = undefined;
  user.accountVerificationTokenExpires = undefined;
  await user.save();
  res.json(user);
});

const forgotPasswordTokenCtrl = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError(`User not found with email: ${email}`);

  const forgotPasswordToken = user.createForgotPasswordToken();
  await user.save();

  const resetUrl = `If you forgot your password, reset it within 30 minutes otherwise ignore this message. <a href= "http://localhost:3000/reset-password/${forgotPasswordToken}}">Click here to reset your password. </a>`;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  let msg = {
    from: process.env.EMAIL, // Sender email
    to: user.email, // Receiver email
    subject: "Reset Password", // Title email
    html: resetUrl, // Html in email
  };

  await transporter.sendMail(msg);

  res.json(resetUrl);
});

const resetPasswordCtrl = asyncWrapper(async (req, res) => {
  const { token, newPassword } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new NotFoundError(
      "Invalid password reset token or token has expired"
    );

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json(user);
});

const profilePhotoUploadCtrl = asyncWrapper(async (req, res) => {
  const localPath = `public/images/profile/${req.file.filename}`;
  const uploadedImg = await cloudinaryUploadImg(localPath);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePhoto: uploadedImg.url,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  // console.log(uploadedImg);
  res.json(user);
  fs.unlinkSync(localPath);
});

module.exports = {
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
};

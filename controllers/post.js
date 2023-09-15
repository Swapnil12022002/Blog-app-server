const User = require("../models/User");
const Post = require("../models/Post");
const fs = require("fs");
const asyncWrapper = require("../middlewares/async");
const {
  UnauthenticatedError,
  BadRequestError,
  NotFoundError,
} = require("../errors");
const validateID = require("../utils/validateMongoID");
const Filter = require("bad-words");
const cloudinaryUploadImg = require("../utils/cloudinary");

const createPostCtrl = asyncWrapper(async (req, res) => {
  //     validateID(req.body.user);
  //   if (req.user._id.toString() !== req.body.user.toString()) {
  //     throw new UnauthenticatedError(
  //       "You can only create posts from your own account"
  //     );
  //   }

  const filter = new Filter();
  const isProfaneTitle = filter.isProfane(req.body.title);
  const isProfaneDescription = filter.isProfane(req.body.description);
  //   console.log(isProfaneTitle, isProfaneDescription);
  if (isProfaneTitle || isProfaneDescription) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        isBlocked: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    throw new BadRequestError(
      "Post Creation failed because it contains profane words and you have been blocked"
    );
  }

  // const localPath = `public/images/posts/${req.file.filename}`;
  // const uploadedImg = await cloudinaryUploadImg(localPath);

  const post = await Post.create({
    ...req.body,
    // image: uploadedImg.url,
    user: req.user._id,
  });
  res.json(post);
  // fs.unlinkSync(localPath);
});

const fetchPostsCtrl = asyncWrapper(async (req, res) => {
  const posts = await Post.find({}).populate("user");
  res.json(posts);
});

const fetchPostCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const post = await Post.findById(id)
    .populate("user")
    .populate("likes")
    .populate("disLikes");
  if (!post) {
    throw new NotFoundError(`No post found with id : ${id}`);
  }
  await Post.findByIdAndUpdate(
    id,
    {
      $inc: { numViews: 1 },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(post);
});

const updatePostCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const post = await Post.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(post);
});

const deletePostCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const post = await Post.findByIdAndDelete(id);
  res.json(post);
});

const toggleAddLikeToPostCtrl = asyncWrapper(async (req, res) => {
  const loggedInUser = req.user._id;
  const { postId } = req.body;

  const post = await Post.findById(postId);

  if (post.disLikes.includes(loggedInUser)) {
    post.disLikes.pull(loggedInUser);
    await post.save();
  }

  if (post.likes.includes(loggedInUser)) {
    post.likes.pull(loggedInUser);
    await post.save();
  } else {
    post.likes.push(loggedInUser);
    await post.save();
  }

  res.json(post);
});

const toggleAddDislikeToPostCtrl = asyncWrapper(async (req, res) => {
  const loggedInUser = req.user._id;
  const { postId } = req.body;

  const post = await Post.findById(postId);

  if (post.likes.includes(loggedInUser)) {
    post.likes.pull(loggedInUser);
    await post.save();
  }

  if (post.disLikes.includes(loggedInUser)) {
    post.disLikes.pull(loggedInUser);
    await post.save();
  } else {
    post.disLikes.push(loggedInUser);
    await post.save();
  }

  res.json(post);
});

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  updatePostCtrl,
  deletePostCtrl,
  toggleAddLikeToPostCtrl,
  toggleAddDislikeToPostCtrl,
};

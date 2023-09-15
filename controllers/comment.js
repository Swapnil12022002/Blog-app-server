const Comment = require("../models/Comment");
const asyncWrapper = require("../middlewares/async");
const validateID = require("../utils/validateMongoID");

const createCommentCtrl = asyncWrapper(async (req, res) => {
  const { postId, description } = req.body;
  const comment = await Comment.create({
    post: postId,
    user: req.user,
    description,
  });
  res.json(comment);
});

const fetchAllCommentsCtrl = asyncWrapper(async (req, res) => {
  const comments = await Comment.find({}).sort("-createdAt");
  res.json(comments);
});

const fetchCommentCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const comment = await Comment.findById(id);
  res.json(comment);
});

const updateCommentCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    {
      description: req.body.description,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json(updatedComment);
});

const deleteCommentCtrl = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateID(id);
  const deletedComment = await Comment.findByIdAndDelete(id);
  res.json(deletedComment);
});

module.exports = {
  createCommentCtrl,
  fetchAllCommentsCtrl,
  fetchCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl,
};

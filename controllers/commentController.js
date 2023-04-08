const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/User');

// @desc Get all comments
// @route GET /comments
// @access private
const getAllComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find({}).lean().exec();

    if (!comments?.length) {
        return res.status(400).json({ message: 'No Comments' })
    }

    // user promise all to response the exact user anh post
    // const commentWithUserAnfPost = await Promise.all(comments.map(async (comment) => {
    //     const user = await User.findById(comment.user);
    //     return { ...comment, user: user.username }
    // }))

    res.json(comments);
});

// @desc Create new comments
// @route POST /comments
// @access private
const createNewComment = asyncHandler(async (req, res) => {
    const { userId, postId, text } = req.body;

    // Confirm
    if (!userId || !postId || !text) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const comment = await Comment.create({
        user: userId,
        post: postId,
        text
    });

    res.json({ message: `Comment ${comment._id} of User ${comment.user} created` });
});

// @desc Update comment
// @route PATCH /comments
// @access private
const updateComment = asyncHandler(async (req, res) => {
    const { id, like } = req.body;

    // Confirm
    if (!id || !like) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Find Comment
    const comment = await Comment.findById(id).exec();

    if (!comment) {
        return res.status(400).json({ message: 'Comment not found' });
    }

    if (comment.like > 0) {
        comment.like = like === 'like' ? comment.like + 1 : comment.like - 1;
    } else {
        comment.like = like === 'like' ? comment.like + 1 : comment.like;
    }

    const updatedComment = await comment.save(); // update comment 

    res.json({ message: `Comment of  ${updatedComment.user} at post ${comment.post} with ID ${updatedComment._id} updated` });
});

// @desc Delete comment
// @route DELETE /comments
// @access private
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm 
    if (!id) {
        return res.status(400).json({ message: 'Comment ID required' });
    }

    const comment = await Comment.findById(id).exec();

    if (!comment) {
        return res.status(400).json({ message: 'Comment not found' });
    }

    const result = await comment.deleteOne();

    res.json({ message: `Comment of ${result.user} at post ${comment.post} with ID ${result._id} deleted` });
});

// @desc Get comment by id
// @route GET /comments/:id
// @access private
const getCommentsByPostId = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const comment = await Comment.find({ post: postId }).lean().exec();
    if (!comment) {
        return res.status(400).json({ message: 'Comment not found' });
    }

    res.json(comment);
});

module.exports = {
    getAllComments,
    createNewComment,
    updateComment,
    deleteComment,
    getCommentsByPostId
}
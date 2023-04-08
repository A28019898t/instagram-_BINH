const express = require('express');
const router = express.Router();
const { getAllComments, createNewComment, updateComment, deleteComment, getCommentsByPostId } = require('../controllers/commentController');

router.route('/')
    .get(getAllComments)
    .post(createNewComment)
    .patch(updateComment)
    .delete(deleteComment)

router.get('/:postId', getCommentsByPostId)

module.exports = router;
const express = require('express');
const router = express.Router();
const { getAllPosts, createNewPost, updatePost, deletePost, getPost } = require('../controllers/postsControllers');
const { upload } = require('../controllers/uploadFileController')

router.route('/')
    .get(getAllPosts)
    .post(upload.single("filename"), createNewPost)
    .patch(updatePost)
    .delete(deletePost)

router.get('/:id', getPost);

module.exports = router;
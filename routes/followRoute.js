const express = require('express');
const router = express.Router();
const { getAllFollow, createNewFollow, updateFollow, deleteFollow, getFollow } = require('../controllers/followController');

router.route('/')
    .get(getAllFollow)
    .post(createNewFollow)
    .patch(updateFollow)
    .delete(deleteFollow)

module.exports = router;
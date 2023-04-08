const express = require('express');
const router = express.Router();
const { getAllUsers, createNewUser, updateUser, deleteUser, getUser } = require('../controllers/userController');

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .patch(updateUser)
    .delete(deleteUser)

router.get('/:id', getUser);

module.exports = router;
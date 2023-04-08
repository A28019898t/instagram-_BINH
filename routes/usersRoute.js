const express = require('express');
const router = express.Router();
const { getAllUsers, createNewUser, updateUser, deleteUser, getUser } = require('../controllers/userController');
const { upload } = require('../controllers/uploadFileController')

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .patch(upload.single("filename"), updateUser)
    .delete(upload.single("filename"), deleteUser)

router.get('/:id', getUser);

module.exports = router;
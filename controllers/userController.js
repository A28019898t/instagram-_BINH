const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { storage, currentDateTime } = require('./uploadFileController');
const { ref, getDownloadURL, uploadBytesResumable, deleteObject } = require('firebase/storage')


// @desc Get all users
// @route GET /users
// @access private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').lean().exec();

    if (!users?.length) {
        return res.status(400).json({ message: 'No Users' })
    }

    res.json(users);
});

// @desc Create new users
// @route POST /users
// @access private
const createNewUser = asyncHandler(async (req, res) => {
    const { fullName, username, password, email, phone } = req.body;

    // Confirm
    if (!fullName || !username || !password || !(email || phone)) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check duplicate
    const duplicate = {
        username: false,
        email: false,
        phone: false
    }

    // check username
    const duplicateUsername = await User.findOne({ username }).lean().exec();
    if (duplicateUsername) {
        duplicate.username = true;
    }
    // check phone
    if (phone) {
        const duplicatePhone = await User.findOne({ phone }).lean().exec();
        if (duplicatePhone) {
            duplicate.phone = true;
        }
    }
    // check email
    if (email) {
        const duplicateEmail = await User.findOne({ email }).lean().exec();
        if (duplicateEmail) {
            duplicate.email = true;
        }
    }

    if (duplicate.username || duplicate.phone || duplicate.email) {
        let text = '';
        for (let key in duplicate) {
            if (duplicate[key]) {
                text = `${text} ${key}`
            }
        }
        return res.status(400).json({ message: `${text} duplicated` });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // 

    let userCreate = {
        fullName,
        username,
        password: hashedPwd,
        fullName
    }

    if (!duplicate.phone) {
        userCreate = { ...userCreate, phone }
    }
    if (!duplicate.email) {
        userCreate = { ...userCreate, email }
    }

    const user = await User.create(userCreate);

    res.json({ message: `User ${user.username} created` });
});

// @desc Update user
// @route PATCH /users
// @access private
const updateUser = asyncHandler(async (req, res) => {
    const { id, fullName, username, avatarImage, password, email, phone, gender, bio } = req.body;

    // Confirm
    if (!id || !username) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Find User
    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check duplicate
    const duplicate = {
        username: false,
        email: false,
        phone: false
    }

    // check username
    const duplicateUsername = await User.findOne({ username }).lean().exec();
    if (duplicateUsername && duplicateUsername?._id.toString() !== id) {
        duplicate.username = true;
    }
    // check phone
    if (phone) {
        const duplicatePhone = await User.findOne({ phone }).lean().exec();
        if (duplicatePhone && duplicatePhone?._id.toString() !== id) {
            duplicate.phone = true;
        }
    }
    // check email
    if (email) {
        const duplicateEmail = await User.findOne({ email }).lean().exec();
        if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
            duplicate.email = true;
        }
    }

    if (duplicate.username || duplicate.phone || duplicate.email) {
        let text = '';
        for (let key in duplicate) {
            if (duplicate[key]) {
                text = `${text} ${key}`
            }
        }
        return res.status(400).json({ message: `${text} duplicated` });
    }

    user.username = username;

    if (req?.file) { // update file media
        const storageRef = ref(storage, `avatars/${req.file.originalname + '    ' + currentDateTime()}`);

        // Find the file in Cloud files
        const url = user.avatarImage; // get the url of file

        const { _location: { path_ } } = ref(storage, url); // get the path of file

        if (path_) {
            // Create a reference to the file to delete
            const desertRef = ref(storage, path_);

            // Delete file in Cloud Storage
            deleteObject(desertRef).then(() => {
                // File deleted successfully
                console.log('delete file successfully');
            }).catch((err) => {
                console.log(err);
            });
        }

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        user.avatarImage = await getDownloadURL(snapshot.ref);

        console.log('file success upload');
    }

    if (password) { // update password
        user.password = await bcrypt.hash(password, 10);
    }
    if (fullName) { // update full name
        user.fullName = fullName;
    }
    if (email) { // update email
        user.email = email;
    }
    if (phone) { // update phone number
        user.phone = phone;
    }
    if (gender) { // update gender
        user.gender = gender;
    }
    if (bio) { // update bio
        user.bio = bio;
    }

    const updatedUser = await user.save(); // update user 

    res.json({ message: `User ${updatedUser.username} with ID ${updatedUser._id} updated` });

});

// @desc Delete user
// @route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm 
    if (!id) {
        return res.status(400).json({ message: 'User ID required' });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Find the file in Cloud files
    const url = user.avatarImage; // get the url of file

    const { _location: { path_ } } = ref(storage, url);

    if (path_) {
        // Create a reference to the file to delete
        const desertRef = ref(storage, path_);

        // Delete file in Cloud Storage
        deleteObject(desertRef).then(() => {
            // File deleted successfully
            console.log('delete file successfully');
        }).catch((err) => {
            console.log(err);
        });
    }

    const result = await user.deleteOne();

    res.json({ message: `User ${result.username} with ID ${result._id} deleted` });
});

// @desc Get user by id
// @route GET /users/:id
// @access private
const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).lean().exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    res.json(user);
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
    getUser
}
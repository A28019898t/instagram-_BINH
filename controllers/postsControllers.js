const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const { storage, currentDateTime } = require('./uploadFileController');
const { ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage')

// @desc Get all posts
// @route GET /posts
// @access private
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({}).select('-password').lean().exec();

    if (!posts?.length) {
        return res.status(400).json({ message: 'No Posts' })
    }

    res.json(posts);
});

// @desc Create new post
// @route POST /posts
// @access private
const createNewPost = asyncHandler(async (req, res) => {
    const { userId, title } = req.body;

    // Confirm
    if (!userId) {
        return res.status(400).json({ message: 'User ID required' });
    }

    // post for create
    let postCreate = {
        user: userId,
    }

    // set a URL for file
    let downLoadUrl;

    if (req?.file) {
        const storageRef = ref(storage, `posts/${req.file.originalname + '    ' + currentDateTime()}`);

        //Create file metadata including the content type
        const metadata = {
            contentType: req.file.mine,
        }

        // Upload the file tin the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        // by using uploadBytesResumable, we can control the progress of uploading like pause, resume, cancle

        // Grab the public url
        downLoadUrl = await getDownloadURL(snapshot.ref);

        postCreate = { ...postCreate, media: downLoadUrl }

        console.log('file success upload');
    }

    if (title) {
        postCreate = { ...postCreate, title };
    }



    const post = await Post.create(postCreate);

    res.json({ message: `Post ${post._id} created` });
});

// @desc Get all posts
// @route PATCH /posts
// @access private
const updatePost = asyncHandler(async (req, res) => {
    const { id, fullName, postname, avatarImage, password, email, phone, gender, bio } = req.body;

    // Confirm
    if (!id || !postname) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Find Post
    const post = await Post.findById(id).exec();

    if (!post) {
        return res.status(400).json({ message: 'Post not found' });
    }

    // Check duplicate
    const duplicate = {
        postname: false,
        email: false,
        phone: false
    }

    // check postname
    const duplicatePostname = await Post.findOne({ postname }).lean().exec();
    if (duplicatePostname && duplicatePostname?._id.toString() !== id) {
        duplicate.postname = true;
    }
    // check phone
    if (phone) {
        const duplicatePhone = await Post.findOne({ phone }).lean().exec();
        if (duplicatePhone && duplicatePhone?._id.toString() !== id) {
            duplicate.phone = true;
        }
    }
    // check email
    if (email) {
        const duplicateEmail = await Post.findOne({ email }).lean().exec();
        if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
            duplicate.email = true;
        }
    }

    if (duplicate.postname || duplicate.phone || duplicate.email) {
        let text = '';
        for (let key in duplicate) {
            if (duplicate[key]) {
                text = `${text} ${key}`
            }
        }
        return res.status(400).json({ message: `${text} duplicated` });
    }

    post.postname = postname;

    if (password) { // update password
        post.password = await bcrypt.hash(password, 10);
    }
    if (fullName) { // update full name
        post.fullName = fullName;
    }
    if (avatarImage) { // update avatar image
        post.avatarImage = avatarImage;
    }
    if (email) { // update email
        post.email = email;
    }
    if (phone) { // update phone number
        post.phone = phone;
    }
    if (gender) { // update gender
        post.gender = gender;
    }
    if (bio) { // update bio
        post.bio = bio;
    }

    const updatedPost = await post.save(); // update post 

    res.json({ message: `Post ${updatedPost.postname} with ID ${updatedPost._id} updated` });

});

// @desc Get all posts
// @route DELETE /posts
// @access private
const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm 
    if (!id) {
        return res.status(400).json({ message: 'Post ID required' });
    }

    const post = await Post.findById(id).exec();

    if (!post) {
        return res.status(400).json({ message: 'Post not found' });
    }

    const result = await post.deleteOne();

    res.json({ message: `Post ${result.postname} with ID ${result._id} deleted` });
});

// @desc Get post by id
// @route GET /posts/:id
// @access private
const getPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id).lean().exec();

    if (!post) {
        return res.status(400).json({ message: 'Post not found' });
    }

    res.json(post);
});

module.exports = {
    getAllPosts,
    createNewPost,
    updatePost,
    deletePost,
    getPost
}
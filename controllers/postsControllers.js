const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const { storage, currentDateTime } = require('./uploadFileController');
const { ref, getDownloadURL, uploadBytesResumable, deleteObject } = require('firebase/storage')

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

    if (req?.file) {
        const storageRef = ref(storage, `posts/${req.file.originalname + '    ' + currentDateTime()}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        postCreate = { ...postCreate, media: await getDownloadURL(snapshot.ref) }

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
    const { id, title, like } = req.body;
    console.log(req.body);

    // Confirm
    if (!id) {
        return res.status(400).json({ message: 'ID required' });
    }

    // Find Post
    const post = await Post.findById(id).exec();

    if (!post) {
        return res.status(400).json({ message: 'Post not found' });
    }

    if (title) { // update title
        post.title = title;
    }
    if (req?.file) { // update file media
        const storageRef = ref(storage, `posts/${req.file.originalname + '    ' + currentDateTime()}`);

        // Find the file in Cloud files
        const url = post.media; // get the url of file

        const { _location: { path_ } } = ref(storage, url); // get the path of file

        // Create a reference to the file to delete
        const desertRef = ref(storage, path_);

        // Delete file in Cloud Storage
        deleteObject(desertRef).then(() => {
            // File deleted successfully
            console.log('delete file successfully');
        }).catch((err) => {
            console.log(err);
        });

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        post.media = await getDownloadURL(snapshot.ref);

        console.log('file success upload');
    }

    if (like) { // update like
        if (post.like > 0) {
            post.like = like === 'like' ? post.like + 1 : post.like - 1;
        } else {
            post.like = like === 'like' ? post.like + 1 : post.like;
        }
    }

    const updatedPost = await post.save(); // update post 

    res.json({ message: `Post with ID ${updatedPost._id} updated` });

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

    // Find the file in Cloud files
    const url = post.media; // get the url of file

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

    const result = await post.deleteOne();

    res.json({ message: `Post with ID ${result._id} deleted` });
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
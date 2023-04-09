const asyncHandler = require('express-async-handler');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Post = require('../models/User');

// @desc Get all follows
// @route GET /follows
// @access private
const getAllFollow = asyncHandler(async (req, res) => {
    const follows = await Follow.find({}).lean().exec();

    if (!follows?.length) {
        return res.status(400).json({ message: 'No Follows' })
    }

    // user promise all to response the exact user anh post
    // const followWithUserAnfPost = await Promise.all(follows.map(async (follow) => {
    //     const user = await User.findById(follow.user);
    //     return { ...follow, user: user.username }
    // }))

    // if ()

    res.json(follows);
});

// @desc Create new follows
// @route POST /follows
// @access private
const createNewFollow = asyncHandler(async (req, res) => {
    const { userId, postId, text } = req.body;

    // Confirm
    if (!userId || !postId || !text) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const follow = await Follow.create({
        user: userId,
        post: postId,
        text
    });

    res.json({ message: `Follow ${follow._id} of User ${follow.user} created` });
});

// @desc Update follow
// @route PATCH /follows
// @access private
const updateFollow = asyncHandler(async (req, res) => {
    const { id, like } = req.body;

    // Confirm
    if (!id || !like) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Find Follow
    const follow = await Follow.findById(id).exec();

    if (!follow) {
        return res.status(400).json({ message: 'Follow not found' });
    }

    if (follow.like > 0) {
        follow.like = like === 'like' ? follow.like + 1 : follow.like - 1;
    } else {
        follow.like = like === 'like' ? follow.like + 1 : follow.like;
    }

    const updatedFollow = await follow.save(); // update follow 

    res.json({ message: `Follow of  ${updatedFollow.user} at post ${follow.post} with ID ${updatedFollow._id} updated` });
});

// @desc Delete follow
// @route DELETE /follows
// @access private
const deleteFollow = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm 
    if (!id) {
        return res.status(400).json({ message: 'Follow ID required' });
    }

    const follow = await Follow.findById(id).exec();

    if (!follow) {
        return res.status(400).json({ message: 'Follow not found' });
    }

    const result = await follow.deleteOne();

    res.json({ message: `Follow of ${result.user} at post ${follow.post} with ID ${result._id} deleted` });
});

// @desc Get follow by id
// @route GET /follows/:id
// @access private
const getFollowsByPostId = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const follow = await Follow.find({ post: postId }).lean().exec();
    if (!follow) {
        return res.status(400).json({ message: 'Follow not found' });
    }

    res.json(follow);
});

module.exports = {
    getAllFollow,
    createNewFollow,
    updateFollow,
    deleteFollow,
    getFollowsByPostId
}
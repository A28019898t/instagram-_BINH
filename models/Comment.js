const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    text: {
        type: String,
        required: true
    },
    like: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);

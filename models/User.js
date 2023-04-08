const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    avatarImage: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    gender: {
        type: String,
        default: 'Prefer not to say'
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userModel);
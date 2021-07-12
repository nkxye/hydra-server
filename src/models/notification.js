const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    pod_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 15
    },
    createdAt: {
        type: Date,
        expires: 604800, // automatically deletes after 7 days
        default: Date.now
    }
})

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
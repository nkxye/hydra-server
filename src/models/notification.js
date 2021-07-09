const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    data_id: {
        type: String,
        ref: 'Sensor Data',
        required: true
    },
    createdAt: {
        type: Date,
        expires: 604800, // automatically deletes after 7 days
        default: Date.now
    }
})

/**
 * JSON Format for the Notification Object.
 *
 * This instance method converts the ObjectId to timestamp and stores it in the createdAt property.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 * @return {Object} notif   The retrieved object for the specific notification.
 */
notificationSchema.methods.toJSON = function () {
    const notif = this.toObject()

    notif.createdAt = notif._id.getTimestamp()

    return notif
}

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
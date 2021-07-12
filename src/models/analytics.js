const mongoose = require('mongoose')

const analyticSchema = new mongoose.Schema({
    sensor: {
        type: String,
        required: true,
        trim: true
    },
    crop_id: {
        type: String,
        ref: 'Crop',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    average: {
        type: mongoose.Decimal128,
        required: true
    },
    relative_range: {
        type: mongoose.Decimal128
    },
    percentage: {
        type: mongoose.Decimal128
    }
})

/**
 * JSON Format for the Analytics Object.
 *
 * This instance method converts the ObjectId to timestamp and stores it in the createdAt property.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 * @return {Object} notif   The retrieved object for the specific notification.
 */
analyticSchema.methods.toJSON = function () {
    const analytics = this.toObject()
    analytics.createdAt = analytics._id.getTimestamp()
    return analytics
}

const Analytics = mongoose.model('Analytics', analyticSchema, 'analytics')

module.exports = Analytics
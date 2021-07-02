const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    crop_id: {
        type: mongoose.ObjectId,
        ref: 'Crop',
        required: true
    },
    start_date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    end_date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    automated: {
        type: Boolean,
        default: false
    }
})

const Journal = mongoose.model('Journal', journalSchema)

module.exports = Journal
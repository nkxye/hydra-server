const mongoose = require('mongoose')
const validator = require('validator')

const cropSchema = new mongoose.Schema({
    pod_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 15
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    crop_name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        image_bin: {
            type: Buffer
        },
        content_type: {
            type: String
        }
    },
    healthy: {
        type: Boolean,
        required: true,
        default: true
    },
    initialize_pumps: {
        type: Boolean,
        required: true
    },
    threshold_values: {
        conductivity: {
            min: {
                type: mongoose.Decimal128,
                required: true
            },
            max: {
                type: mongoose.Decimal128,
                required: true
            }
        },
        humidity: {
            min: {
                type: mongoose.Decimal128,
                required: true
            },
            max: {
                type: mongoose.Decimal128,
                required: true
            }
        },
        ph_level: {
            min: {
                type: mongoose.Decimal128,
                required: true
            },
            max: {
                type: mongoose.Decimal128,
                required: true
            }
        },
        temperature: {
            min: {
                type: mongoose.Decimal128,
                required: true
            },
            max: {
                type: mongoose.Decimal128,
                required: true
            }
        }
    }
}, {
    timestamps: true
})

/**
 * Convert Crop Name to Titlecase
 *
 * This function triggers before the Crop object gets saved to the database and converts the crop name to Titlecase.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 */
cropSchema.pre('save', async function (next) {
    const crop = this

    if (validator.isUppercase(crop.crop_name) || validator.isLowercase(crop.crop_name)) {
        const words = crop.crop_name.split(' ')
        crop.crop_name = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    }

    next()
})

const Crop = mongoose.model('Crop', cropSchema)

module.exports = Crop
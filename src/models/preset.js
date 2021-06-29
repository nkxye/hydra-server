const mongoose = require('mongoose')

const presetSchema = new mongoose.Schema({
    schema_version: {
        type: Number,
        default: 1
    },
    user_defined: {
        type: Boolean,
        default: true
    },
    preset_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25
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
})

const Preset = mongoose.model('Preset', presetSchema)

module.exports = Preset
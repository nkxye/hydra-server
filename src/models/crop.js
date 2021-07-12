const mongoose = require('mongoose')
const validator = require('validator')
const mqttClient = require('../middleware/mqtt_client')

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
        air_temperature: {
            min: {
                type: mongoose.Decimal128,
                required: true
            },
            max: {
                type: mongoose.Decimal128,
                required: true
            }
        }
    },
    latest_data: {
        conductivity: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: mongoose.Decimal128,
                default: 0.0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        humidity: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: mongoose.Decimal128,
                default: 0.0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        ph_level: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: mongoose.Decimal128,
                default: 0.0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        air_temperature: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: mongoose.Decimal128,
                default: 0.0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        water_temperature: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: mongoose.Decimal128,
                default: 0.0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        nutrient_A: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: Number,
                default: 0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        nutrient_B: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: Number,
                default: 0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        nutrient_C: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: Number,
                default: 0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        ph_up: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: Number,
                default: 0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        ph_down: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: Number,
                default: 0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        },
        water_level: {
            timestamp: {
                type: Date,
                default: Date.now()
            },
            value: {
                type: Number,
                default: 0
            },
            increase: {
                type: Number, // -1 = decrease, 0 = equal, 1 = increase
                default: 0
            },
            normal: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
})

/**
 * JSON Format for the Crop Object.
 *
 * This instance method excludes initialize_pumps and image binary by default when returning the Crop object in JSON.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 * @return {Object} cropInfo   The retrieved object for the specific crop.
 */
cropSchema.methods.toJSON = function () {
    const cropInfo = this.toObject()

    delete cropInfo.initialize_pumps

    if (cropInfo.image && typeof cropInfo.image !== "undefined") {
        cropInfo.image = '/crop/' + cropInfo._id + '/image'
    }

    if (!cropInfo.active) {
        cropInfo.report = '/report/' + cropInfo.pod_name + '/' + cropInfo._id
    }

    return cropInfo
}

/**
 * Convert Crop Name to Titlecase
 * Publish Changed Values to MQTT
 *
 * This function triggers before the Crop object gets saved to the database and converts the crop name to Titlecase,
 * and then publishes detected changed values to the MQTT broker.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 */
cropSchema.pre('save', async function (next) {
    const crop = this

    if (crop.isModified('crop_name') && (validator.isUppercase(crop.crop_name) || validator.isLowercase(crop.crop_name))) {
        const words = crop.crop_name.split(' ')
        crop.crop_name = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    }

    if (!crop.isNew) {
        if (crop.isModified('threshold_values.conductivity.min') || crop.isModified('threshold_values.conductivity.max')) {
            mqttClient.publishRevisedCropSettings(crop.pod_name, 'ec_reading', {
                'ec_reading': [
                    parseFloat(crop.threshold_values.conductivity.min),
                    parseFloat(crop.threshold_values.conductivity.max)
                ]
            })
        }

        if (crop.isModified('threshold_values.ph_level.min') || crop.isModified('threshold_values.ph_level.max')) {
            mqttClient.publishRevisedCropSettings(crop.pod_name, 'ph_reading', {
                'ph_reading': [
                    parseFloat(crop.threshold_values.ph_level.min),
                    parseFloat(crop.threshold_values.ph_level.max)
                ]
            })
        }

        if (crop.isModified('threshold_values.humidity.min') || crop.isModified('threshold_values.humidity.max')) {
            mqttClient.publishRevisedCropSettings(crop.pod_name, 'air_humidity', {
                'air_humidity': [
                    parseFloat(crop.threshold_values.humidity.min),
                    parseFloat(crop.threshold_values.humidity.max)
                ]
            })
        }

        if (crop.isModified('threshold_values.temperature.min') || crop.isModified('threshold_values.temperature.max')) {
            mqttClient.publishRevisedCropSettings(crop.pod_name, 'air_temperature', {
                'air_temperature': [
                    parseFloat(crop.threshold_values.air_temperature.min),
                    parseFloat(crop.threshold_values.air_temperature.max)
                ]
            })
        }
    }

    next()
})

const Crop = mongoose.model('Crop', cropSchema)

module.exports = Crop
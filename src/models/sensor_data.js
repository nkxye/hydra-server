const mongoose = require('mongoose')

const sensorDataSchema = new mongoose.Schema({
    sensor: {
        type: String,
        required: true,
        trim: true
    },
    crop: {
        type: mongoose.ObjectId,
        ref: 'Crop',
        required: true
    },
    start: {
        type: Date,
        required: true,
        default: Date.now()
    },
    end: {
        type: Date,
        required: true,
        default: Date.now()
    },
    measurements: [{
        timestamp: {
            type: Date,
            default: Date.now(),
            required: true
        },
        value: {
            type: mongoose.Decimal128,
            required: true,
            default: 0.0
        }
    }],
    measurement_count: {
        type: Number,
        default: 0
    },
    sum_values: {
        type: mongoose.Decimal128,
        default: 0.0
    }
})

const SensorData = mongoose.model('Sensor Data', sensorDataSchema, 'sensor_data')

module.exports = SensorData
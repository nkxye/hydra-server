const mongoose = require('mongoose')

const sensorDataSchema = new mongoose.Schema({
    sensor_id: {
        type: String,
        required: true,
        trim: true
    },
    crop_id: {
        type: String,
        required: true,
        trim: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date
    },
    measurements: [{
        timestamp: {
            type: Date,
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

const SensorData = mongoose.model('Sensor Data', sensorDataSchema)

module.exports = SensorData
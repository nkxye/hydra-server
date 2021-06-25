const mongoose = require('mongoose')

const sensorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 25
    },
    pods_linked: [{
        pod_name: {
            type: String,
            required: true,
            trim: true,
            minLength: 5,
            maxLength: 15
        },
        calibrated: {
            type: Boolean,
            default: true
        },
        last_calibrated: {
            type: Date,
            default: Date.now()
        }
    }]
})

const Sensor = mongoose.model('Sensor', sensorSchema)

module.exports = Sensor
const SensorData = require('../models/sensor_data')

/**
 * Retrieve Data.
 *
 * Stores the newly parsed data from the MQTT broker to the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.retrieve = async (message) => {
    try {
        // TODO: crop data logic via sensor data

        // TODO: create new document once measurement_count hits 30
        // TODO: add latest sensor data to active crop
    } catch (e) {
    }
}

exports.initSensors = async (podName) => {

}
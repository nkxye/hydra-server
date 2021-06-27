const SensorData = require('../models/sensor_data')
const Sensor = require("../models/sensor");

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

/**
 * Insert Sensors.
 *
 * This function inserts 1 document for each sensor. This needs to be called on the first boot of the app.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.insertSensors = () => {
    let executed = false
    return async () => {
        if (!executed) {
            executed = true
            const sensorNames = [
                {'name': 'air_humidity'},
                {'name': 'air_temperature'},
                {'name': 'water_temperature'},
                {'name': 'ec_reading'},
                {'name': 'ph_reading'},
                {'name': 'contactless_liquid_level'},
                {'name': 'uv_light'},
                {'name': 'infrared_light'},
                {'name': 'visible_light'},
                {'name': 'reservoir_level'}
            ]

            const sensors = await Sensor.insertMany(sensorNames)
            await sensors.save()
        }
    }
}

/**
 * Initialize Sensors.
 *
 * This function links the pod to the sensors.
 *
 * @param podName   req.body.setupName passed by another function
 */
exports.initSensors = async (podName) => {
    const sensorNames = ['air_humidity', 'air_temperature', 'water_temperature', 'ec_reading', 'ph_reading',
        'contactless_liquid_level', 'uv_light', 'infrared_light', 'visible_light', 'reservoir_level']

    for (const sensor of sensorNames) {
        let sensorRecord = await Sensor.findOne({'name': sensor})

        sensorRecord.pods_linked = sensorRecord.pods_linked.concat({
            pod_name: podName
        })

        await sensorRecord.save()
    }
}
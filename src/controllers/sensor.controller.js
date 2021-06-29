const SensorData = require('../models/sensor_data')
const Sensor = require("../models/sensor");
const Crop = require("../models/crop");

/**
 * Retrieve Data.
 *
 * Stores the newly parsed data from the MQTT broker to the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.retrieve = async (topic, message) => {
    try {
        // identify pod name and data type (sensor_data, probe_data) thru slice and split
        const topic = topic.slice(0, -1)
        const [podName, dataType] = topic.split("/")

        // parse string into JSON
        const messageJSON = JSON.parse(message)

        // add latest sensor data to active crop
        const crop = await Crop.findOne({'pod_name': podName, 'active': true})
        const cropId = crop._id

        // map sensor names in DB with sensor names in MQTT
        const sensorNames = {
            'humidity': 'air_humidity',
            'air_temperature': 'air_temperature',
            'nutrient_A': 'contactless_liquid_level',
            'nutrient_B': 'contactless_liquid_level',
            'nutrient_C': 'contactless_liquid_level',
            'ph_up': 'contactless_liquid_level',
            'ph_down': 'contactless_liquid_level',
            'water_level': 'reservoir_level'
        }

        // map sensor names in DB with probe names in MQTT
        const probeNames = {
            'conductivity': 'ec_reading',
            'ph_level': 'ph_reading',
            'water_temperature': 'water_temperature'
        }

        // sensors with threshold values specified
        const hasThreshold = ['humidity', 'conductivity', 'ph_level', 'air_temperature']

        if (dataType === 'sensor_data') {
            // convert boolean to 15% and 100%
            if (messageJSON.contactless_liquid_level) {
                messageJSON.contactless_liquid_level = 100
            } else {
                messageJSON.contactless_liquid_level = 15
            }

            for (const key of sensorNames) {
                let increaseVal = 0 // -1 = decrease, 0 = equal, 1 = increase
                let normalVal = true
                let lastValue = crop.latest_data[key].value
                let currentValue = messageJSON[sensorNames[key]]

                // check if the value has increased/decreased
                if (lastValue > currentValue) {
                    increaseVal = -1
                } else if (lastValue < currentValue) {
                    increaseVal = 1
                }

                // check if the value is within threshold
                if (hasThreshold.includes(key)) {
                    if (currentValue < crop.threshold_values[key].min || currentValue > crop.threshold_values[key].max) {
                        normalVal = false
                    }
                }

                // update latest_data property of crop
                crop.latest_data[key] = {
                    timestamp: Date.now(),
                    value: currentValue,
                    increase: increaseVal,
                    normal: normalVal
                }

                await updateBucket(key, cropId, currentValue)
            }
        } else if (dataType === 'probe_data') {
            for (const key of probeNames) {
                let increaseVal = 0 // -1 = decrease, 0 = equal, 1 = increase
                let normalVal = true
                let lastValue = crop.latest_data[key].value
                let currentValue = messageJSON[probeNames[key]]

                // check if the value has increased/decreased
                if (lastValue > currentValue) {
                    increaseVal = -1
                } else if (lastValue < currentValue) {
                    increaseVal = 1
                }

                // check if the value is within threshold
                if (hasThreshold.includes(key)) {
                    if (currentValue < crop.threshold_values[key].min || currentValue > crop.threshold_values[key].max) {
                        normalVal = false
                    }
                }

                // update latest_data property of crop
                crop.latest_data[key] = {
                    timestamp: Date.now(),
                    value: currentValue,
                    increase: increaseVal,
                    normal: normalVal
                }

                await updateBucket(key, cropId, currentValue)
            }
        }

        await crop.save()
    } catch (e) {
        console.log(e)
    }
}

/**
 * Insert Sensors.
 *
 * This closure function inserts 1 document for each sensor. This needs to be called on the first boot of the app.
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
                {'name': 'conductivity'},
                {'name': 'humidity'},
                {'name': 'ph_level'},
                {'name': 'air_temperature'},
                {'name': 'water_temperature'},
                {'name': 'nutrient_A'},
                {'name': 'nutrient_B'},
                {'name': 'nutrient_C'},
                {'name': 'ph_up'},
                {'name': 'ph_down'},
                {'name': 'water_level'}
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
    const sensorNames = ['conductivity', 'humidity', 'ph_level', 'air_temperature', 'water_temperature',
        'nutrient_A', 'nutrient_B', 'nutrient_C', 'ph_up', 'ph_down', 'water_level']

    for (const sensor of sensorNames) {
        let sensorRecord = await Sensor.findOne({'name': sensor})

        sensorRecord.pods_linked = sensorRecord.pods_linked.concat({
            pod_name: podName
        })

        await sensorRecord.save()
    }
}

/**
 * Update Bucket.
 *
 * This function updates or creates a Sensor Data bucket document based on the measurement count.
 *
 * @param sensor     Sensor name in the database.
 * @param cropId     ObjectId of the crop being monitored.
 * @param newValue   New sensor value to set in the database.
 */
exports.updateBucket = async (sensor, cropId, newValue) => {
    // find bucket where measurement_count < 30
    const data = await SensorData.findOne({sensor: sensor, crop: cropId, measurement_count: {$lt: 30}})

    // update sensor measurement bucket
    if (data) {
        data.end = Date.now()
        data.measurements = data.measurements.concat({
            timestamp: Date.now(),
            value: newValue
        })
        data.measurement_count = data.measurement_count + 1
        data.sum_values = data.sum_values + newValue

        await data.save()
    } else {
        // create new bucket document
        const newData = new SensorData({
            sensor: sensor,
            crop: cropId,
            start: Date.now(),
            end: Date.now(),
            measurement_count: 1,
            sum_values: newValue
        })

        newData.measurements = newData.measurements.concat({
            timestamp: Date.now(),
            value: newValue
        })

        await newData.save()
    }
}
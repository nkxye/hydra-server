const Crop = require('../models/crop')
const mqttClient = require('../middleware/mqtt_client')

/**
 * Start New Crop.
 *
 * Stores the new crop settings to the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.startNewCrop = async (req, res) => {
    try {
        const activeCropExists = await Crop.findOne({'crop_name': req.body.cropName, 'active': true})

        if (activeCropExists) {
            return res.status(400).send('An active crop with the same name already exists.')
        } else {
            const initializePumps = (req.body.initializePumps === "on")
            let podExists = false
            let podAlreadyOccupied = false

            for (let i = 0; i < req.user.pods_owned.length; i++) {
                if (req.user.pods_owned[i].pod_name === req.body.setupName) {
                    podExists = true

                    if (req.user.pods_owned[i].occupied) {
                        podAlreadyOccupied = true
                    } else {
                        req.user.pods_owned[i].occupied = true
                    }

                    break
                }
            }

            if (podExists) {
                if (podAlreadyOccupied) {
                    return res.status(400).send('Pod is already occupied!')
                } else {
                    const crop = new Crop({
                        crop_name: req.body.cropName,
                        pod_name: req.body.setupName,
                        image: {
                            image_bin: req.file.buffer,
                            content_type: req.content_type,
                        },
                        initialize_pumps: initializePumps,
                        threshold_values: {
                            conductivity: {
                                min: req.body.conductivityStart,
                                max: req.body.conductivityEnd
                            },
                            humidity: {
                                min: req.body.humidityStart,
                                max: req.body.humidityEnd
                            },
                            ph_level: {
                                min: req.body.phStart,
                                max: req.body.phEnd
                            },
                            temperature: {
                                min: req.body.tempStart,
                                max: req.body.tempEnd
                            }
                        }
                    })

                    let data = {
                        "pod_name": req.body.setupName, // pod name should be lower kebabcase
                        "air_humidity": [parseFloat(req.body.humidityStart), parseFloat(req.body.humidityEnd)],
                        "air_temperature": [parseFloat(req.body.tempStart), parseFloat(req.body.tempEnd)],
                        "ec_reading": [parseFloat(req.body.conductivityStart), parseFloat(req.body.conductivityEnd)],
                        "ph_reading": [parseFloat(req.body.phStart), parseFloat(req.body.phEnd)],
                        "init_pumps": 0
                    }

                    if (initializePumps) {
                        data['init_pumps'] = 1
                        mqttClient.publishNewCropSettings(crop.pod_name, data)
                    } else {
                        mqttClient.publishNewCropSettings(crop.pod_name, data)
                    }

                    await crop.save()
                    await req.user.save()

                    res.status(201).send(crop)
                }
            } else {
                return res.status(400).send('Pod name does not exist!')
            }
        }
    } catch (e) {
        res.status(400).send(e)
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
}

/**
 * Change Threshold.
 *
 * Revises the threshold value/s for the crop.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.changeThreshold = async (req, res) => {
    try {
        const fields = Object.keys(req.body)
        const revisableFields = ['cropName', 'conductivityStart', 'conductivityEnd', 'humidityStart',
            'humidityEnd', 'phStart', 'phEnd', 'tempStart', 'tempEnd']
        const validUpdate = fields.every((field) => revisableFields.includes(field))

        if (!validUpdate) {
            return res.status(400).send({error: 'Invalid update!'})
        }

        // searches only for an active crop to avoid detecting past crops with the same crop name
        const crop = await Crop.findOne({'pod_name': req.params.podName, 'active': true})

        fields.forEach((field) => {
            let newValue = req.body[field]

            if (field === 'cropName' && crop.crop_name !== newValue) {
                crop.crop_name = newValue
            } else if (field === 'conductivityStart' && crop.threshold_values.conductivity.min !== newValue) {
                crop.threshold_values.conductivity.min = newValue
            } else if (field === 'conductivityEnd' && crop.threshold_values.conductivity.max !== newValue) {
                crop.threshold_values.conductivity.max = newValue
            } else if (field === 'humidityStart' && crop.threshold_values.humidity.min !== newValue) {
                crop.threshold_values.humidity.min = newValue
            } else if (field === 'humidityEnd' && crop.threshold_values.humidity.max !== newValue) {
                crop.threshold_values.humidity.max = newValue
            } else if (field === 'phStart' && crop.threshold_values.ph_level.min !== newValue) {
                crop.threshold_values.ph_level.min = newValue
            } else if (field === 'phEnd' && crop.threshold_values.ph_level.max !== newValue) {
                crop.threshold_values.ph_level.max = newValue
            } else if (field === 'tempStart' && crop.threshold_values.temperature.min !== newValue) {
                crop.threshold_values.temperature.min = newValue
            } else if (field === 'tempEnd' && crop.threshold_values.temperature.max !== newValue) {
                crop.threshold_values.temperature.max = newValue
            }
        })

        if (crop.image.image_bin !== req.file.buffer) {
            crop.image.image_bin = req.file.buffer
            crop.image.content_type = req.content_type
        }

        await crop.save()
        res.status(202).send('Your threshold changes have been saved successfully.')
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Harvest Crop.
 *
 * Sets the crop's active field to false and archives a historical report.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.harvestCrop = async (req, res) => {
    try {
        // searches only for an active crop to avoid detecting past crops with the same crop name
        const crop = await Crop.findOne({'pod_name': req.params.podName, 'active': true})
        crop.active = false

        req.user.pods_owned.forEach((pod) => {
            if (pod.pod_name === crop.pod_name) {
                pod.occupied = false
            }
        })

        await req.user.save()
        await crop.save()

        mqttClient.publishCropHarvest(crop.pod_name, '1')

        // TODO: crop history report derivation logic
        res.status(200).send()
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Get Active Crop Data.
 *
 * Sends the crop data based on the latest published data from the MQTT topic/s.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getActiveCropData = async (req, res) => {
    try {
        // searches only for an active crop to avoid detecting past crops with the same crop name
        const crop = await Crop.findOne({'pod_name': req.params.podName, 'active': true})
        res.status(200).send(crop)
        
        // TODO: crop data logic via sensor data
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Get Crop Image.
 *
 * Returns the image for the corresponding crop.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getCropImage = async (req, res) => {
    const crop = await Crop.findById(req.params.cropId)

    if (!crop.image) {
        res.status(404).send()
    } else {
        res.set('Content-Type', crop.image.content_type)
        res.status(200).send(crop.image.image_bin)
    }
}
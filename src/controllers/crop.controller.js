const Crop = require('../models/crop')
const Journal = require('../models/journal')
const mqttClient = require('../middleware/mqtt_client')
const presetController = require('../controllers/preset.controller')
const reportMaker = require('../middleware/pdf_generator')
const fs = require('fs')

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
                    await req.user.save()
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
                        air_temperature: {
                            min: req.body.tempStart,
                            max: req.body.tempEnd
                        }
                    }
                })

                if (typeof req.file !== "undefined") {
                    crop.image = {
                        image_bin: req.file.buffer,
                        content_type: req.content_type
                    }
                }

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

                mqttClient.subscribeToPod(crop.pod_name)

                await crop.save()
                await presetController.createNewPreset(crop.crop_name, crop.threshold_values)

                res.status(201).send(crop)
            }
        } else {
            return res.status(400).send('Pod name does not exist!')
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

        // searches only for an active crop to avoid detecting past crops with the same pod name
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
            } else if (field === 'tempStart' && crop.threshold_values.air_temperature.min !== newValue) {
                crop.threshold_values.air_temperature.min = newValue
            } else if (field === 'tempEnd' && crop.threshold_values.air_temperature.max !== newValue) {
                crop.threshold_values.air_temperature.max = newValue
            }
        })

        if (typeof req.file !== "undefined") {
            if (crop.image.image_bin !== req.file.buffer) {
                crop.image.image_bin = req.file.buffer
                crop.image.content_type = req.content_type
            }
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
        // searches only for an active crop to avoid detecting past crops with the same pod name
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

        const entries = await Journal.find({'crop_id': crop._id})

        reportMaker(crop, entries, entries.length)
        res.status(200).send()
    } catch (e) {
        res.status(400).send(e.message)
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
        // TODO: use socket.io
        // TODO: get last will to let front end know that arduino is offline - get pod data
        const crop = await Crop.findOne({'pod_name': req.params.podName, 'active': true})
        res.status(200).send(crop)
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Get Active Crop List.
 *
 * Sends the list of active crops to display on the homepage.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getActiveCropList = async (req, res) => {
    try {
        const activeCrops = JSON.stringify(await Crop.find({'active': true}))
        const cropInfo = JSON.parse(activeCrops, (key, value) => (key !== 'threshold_values') ? value : key[-1]);
        res.status(200).send(cropInfo)
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

/**
 * Get Past Crops (History).
 *
 * Returns the list of past crops to display in the History page.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getPastCrops = async (req, res) => {
    try {
        const pastCrops = JSON.stringify(await Crop.find({'active': false}))
        const filteredCrops = JSON.parse(pastCrops, (key, value) => (key !== 'threshold_values' && key !== 'latest_data') ? value : key[-1]);
        res.status(200).send(filteredCrops)
    } catch (e) {
        res.status(400).send(e.message)
    }
}

/**
 * Get PDF Report
 *
 * Returns the PDF Report file for the past crop.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getReport = async (req, res) => {
    try {
        const fileName = '/reports/'+ req.params.podName + '_' + req.params.id + '_report.pdf'
        if (fs.existsSync('.' + fileName)) {
            fs.readFile(process.cwd() + fileName, (err,data) => {
                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline; filename=" + process.cwd() + fileName,
                })
                res.status(200).send(data)
            })
        }
    } catch (e) {
        res.status(404).send(e)
    }
}
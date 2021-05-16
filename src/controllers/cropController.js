const Crop = require('../models/crop')

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

            let podExists = false

            req.user.pods_owned.forEach((pod) => {
                if (pod.pod_name === req.body.setupName) {
                    pod.occupied = true
                    podExists = true
                }
            })

            if (podExists) {
                await crop.save()
                await req.user.save()
                res.status(201).send(crop)

                // if (initializePumps) {
                //     // TODO: initialize pumps publish logic
                // }
            } else {
                return res.status(400).send({error: 'Pod name does not exist!'})
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
    // TODO: crop settings logic
    // const fields = Object.keys(req.body)
    // const revisableFields = ['email', 'password']
    // const validUpdate = fields.every((field) => revisableFields.includes(field))
    //
    // if (!validUpdate) {
    //     return res.status(400).send({error: 'Invalid update!'})
    // }
    //
    // try {
    //     fields.forEach((field) => req.user[field] = req.body[field])
    //     await req.user.save()
    //     res.status(202).send(req.user)
    // } catch (e) {
    //     res.status(500).send(e)
    // }
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
        const crop = await Crop.findOne({'crop_name': req.params.cropName})
        crop.active = false
        await crop.save()

        // TODO: crop history report derivation logic

        res.status(200).send()
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Get Crop Data.
 *
 * Sends the crop data based on the latest published data from the MQTT topic/s.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getCropData = async (req, res) => {
    // res.status(200).send(req.crop)
    // TODO: crop data logic with topic middleware
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
    const crop = await Crop.findOne({'crop_name': req.params.cropName})

    if (!crop.image) {
        res.status(404).send()
    } else {
        res.set('Content-Type', crop.image.content_type)
        res.status(200).send(crop.image.image_bin)
    }
}
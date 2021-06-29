const Preset = require('../models/preset')

/**
 * Create New Preset.
 *
 * Store unique data as a new preset.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.setupNewPod = async (req, res) => {
    try {
        // TODO: save new preset
        res.status(201).send()
    } catch (e) {
    }
}

/**
 * Get Preset Names.
 *
 * Get preset names for dropdown usage in "Start New Crop".
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getPresetNames = async (req, res) => {
    const presets = await Preset.find()
    const presetNames = JSON.parse(JSON.stringify(presets), (key, value) => {
        if (key !== 'schema_version' && key !== 'user_defined' && key !== '_id') {
            return value
        } else {
            return key[-1]
        }
    })

    res.status(200).send(presetNames)
}
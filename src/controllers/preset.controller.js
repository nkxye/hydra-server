const Preset = require('../models/preset')

/**
 * Create New Preset.
 *
 * Store unique data as a new preset.
 *
 * @param cropName          crop name derived from "Start New Crop"
 * @param thresholdValues   threshold values derived from "Start New Crop"
 */
exports.createNewPreset = async (cropName, thresholdValues) => {
    try {
        const presetExists = await Preset.exists({'preset_name': cropName})

        if (!presetExists) {
            const preset = new Preset({
                preset_name: cropName,
                threshold_values: thresholdValues
            })

            await preset.save()
        }
    } catch (e) {
        throw new Error(e)
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
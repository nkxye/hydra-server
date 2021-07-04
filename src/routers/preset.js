const express = require('express')
const auth = require('../middleware/auth')
const presetController = require('../controllers/preset.controller')

const router = new express.Router()

/**
 * Get Preset Names.
 *
 * Get preset names for dropdown usage in "Start New Crop".
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
router.get('/presets/list', auth, presetController.getPresetNames)

module.exports = router
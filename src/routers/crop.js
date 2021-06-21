const express = require('express')
const auth = require('../middleware/auth')
const cropController = require('../controllers/crop.controller')
const router = new express.Router()
const multer = require('multer')
const upload = multer({
    limits: {
        fileSize: 3000000 // 3mb limit for images
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png)$/)) {
            return callback(new Error('File must be an image in GIF/JPEG/TIFF/PNG format. Please try again.'))
        } else {
            req.content_type = file.mimetype
            callback(undefined, true)
        }
    }
})

/**
 * Start New Crop.
 *
 * Stores the new crop settings to the database.
 *
 * @param {String} route path                   The endpoint at which requests can be made.
 * @param {Object} auth                         Auth middleware to validate token.
 * @param {function(String)} upload.single()    Upload middleware from the multer package.
 * @param {function(Object, Object)}            Async route handler callback with HTTP Request and Response object args.
 */
router.post('/crop/new', auth, upload.single('cropImage'), cropController.startNewCrop)

/**
 * Change Threshold.
 *
 * Revises the threshold value/s for the crop.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.patch('/crop/:podName/update', auth, upload.single('cropImage'), cropController.changeThreshold)

/**
 * Harvest Crop.
 *
 * Sets the crop's active field to false and archives a historical report.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.patch('/crop/:podName/harvest', auth, cropController.harvestCrop)

/**
 * Get Active Crop Data.
 *
 * Sends the crop data based on the latest published data from the MQTT topic/s.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/crop/:podName', cropController.getActiveCropData)

// END OF ACTIVE CROP ROUTES. BELOW ARE GENERAL CROP-RELATED ROUTES

/**
 * Get Crop Image.
 *
 * Renders the crop image from binary to its respective file type for img src tag usage.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/crop/:cropId/image', cropController.getCropImage)

// TODO: get past crops (for History)

module.exports = router
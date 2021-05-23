const express = require('express')
const auth = require('../middleware/auth')
const cropController = require('../controllers/cropController')
const router = new express.Router()
const multer = require('multer')

const upload = multer({
    limits: {
        fileSize: 3000000 // 3mb limit for images
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png)$/)) {
            return callback(new Error('File must be an image. Please try again.'))
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
router.patch('/crop/:cropName/update', auth, cropController.changeThreshold)

/**
 * Harvest Crop.
 *
 * Sets the crop's active field to false and archives a historical report.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/crop/harvest', auth, cropController.harvestCrop)

/**
 * Get Crop Data.
 *
 * Sends the crop data based on the latest published data from the MQTT topic/s.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/crop/:podName', cropController.getCropData)

/**
 * Get Crop Data.
 *
 * Sends the crop data based on the latest published data from the MQTT topic/s.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/crop/:cropName/image', cropController.getCropImage)

module.exports = router
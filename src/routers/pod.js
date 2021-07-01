const express = require('express')
const auth = require('../middleware/auth')
const podController = require('../controllers/pod.controller')

const router = new express.Router()

/**
 * Add New Setup
 *
 * Stores the newly added setup/pod to the database.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/pod/new', auth, podController.setupNewPod)

/**
 * Get List of Vacant Pods.
 *
 * Sends a list of all the unoccupied pods to display on the "Setup Name" field of "Start New Crop".
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/pod/vacant', auth, podController.getVacantPods)

module.exports = router
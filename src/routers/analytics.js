const express = require('express')
const analyticsController = require('../controllers/analytics.controller')

const router = new express.Router()

/**
 * Get Chart Data.
 *
 * Sends a JSON to populate the line chart in the crop dashboard.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/chart/data/:cropId', analyticsController.getChartData)

module.exports = router
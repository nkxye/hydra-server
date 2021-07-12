const express = require('express')
const notificationController = require('../controllers/notification.controller')

const router = new express.Router()

/**
 * Send Notification.
 *
 * Pushes the notification via service worker using a new/existing subscription.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/notifications/subscribe', notificationController.sendNotification)

module.exports = router
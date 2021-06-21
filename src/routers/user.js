const express = require('express')
const auth = require('../middleware/auth')
const userController = require('../controllers/user.controller')

const router = new express.Router()

/**
 * Register Admin.
 *
 * Stores the newly created admin credentials to the database.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/admin/register', userController.registerAdmin)

/**
 * Elevate Role.
 *
 * This function elevates the role to admin to give access to critical CRUD functions.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/admin/elevate', userController.elevateRole)

/**
 * End Session.
 *
 * Ends the admin's current session by removing the current token.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/admin/end', auth, userController.endSession)

/**
 * Update Password and/or Recovery Email.
 *
 * Updates the password and/or recovery email of the user.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.patch('/admin/update', auth, userController.updateCredentials)

/**
 * Get Admin Info.
 *
 * Sends the admin info without the password and tokens.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/admin', auth, userController.getAdminInfo)

module.exports = router
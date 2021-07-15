const express = require('express')
const rssController = require('../controllers/rss.controller')

const router = new express.Router()

/**
 * Get RSS Feed.
 *
 * Returns the RSS feed from Reddit as a proxy server to circumvent the CORS error.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/rss', rssController.getRss)

module.exports = router
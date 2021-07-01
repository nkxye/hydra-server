const express = require('express')
const journalController = require('../controllers/journal.controller')

const router = new express.Router()

/**
 * Create Journal Entry.
 *
 * Stores the user's manually created journal entry to the database.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.post('/journal/new', journalController.createJournalEntry)

/**
 * Edit Journal Entry.
 *
 * Sends a list of all the unoccupied pods to display on the "Setup Name" field of "Start New Crop".
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.patch('/journal/edit', journalController.editJournalEntry())

/**
 * Delete Manual Journal Entry.
 *
 * Deletes a manually created journal entry.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.delete('/journal/:id/delete', journalController.deleteJournalEntry())

/**
 * Get List of Vacant Pods.
 *
 * Sends a list of all the unoccupied pods to display on the "Setup Name" field of "Start New Crop".
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/journal/:podName', journalController.getJournalEntries())

module.exports = router
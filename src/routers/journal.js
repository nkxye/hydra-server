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
 * Updates the journal entry with the provided input.
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
 * Get List of Journal Entries
 *
 * Sends a list of all the journal entries to display on the calendar.
 *
 * @param {String} route path          The endpoint at which requests can be made.
 * @param {Object} auth                Auth middleware to validate token.
 * @param {function(Object, Object)}   Async route handler callback with HTTP Request and Response object arguments.
 */
router.get('/journal/:cropId', journalController.getJournalEntries())

module.exports = router
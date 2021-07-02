const Journal = require('../models/journal')

/**
 * Create Journal Entry.
 *
 * Stores the user's manually created journal entry to the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.createJournalEntry = async (req, res) => {
    try {
        const entry = new Journal({
            title: req.body.title,
            crop_id: req.body.cropId,
            start_date: req.body.start,
            end_date: req.body.end
        })

        await entry.save()
        res.status(201).send(entry)
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Create Automated Journal Entry.
 *
 * Creates an automated journal entry when the value gets detected as critical (below/above threshold).
 *
 * @param title     Title for the journal entry.
 * @param crop      ObjectId for the target crop.
 * @param start     Start date for the journal entry.
 * @param end       End date for the journal entry.
 * @param pod       Target pod/setup for the journal entry.
 */
exports.createAutomatedJournalEntry = async (title, start, end, crop, pod) => {
    // TODO: integrate in sensor data for critical
    try {
        const entry = new Journal({
            title: title,
            crop_id: crop,
            start_date: start,
            end_date: end,
            automated: true
        })

        await entry.save()
    } catch (e) {
        throw new Error(e)
    }
}

/**
 * Edit Journal Entry.
 *
 * Updates the journal entry with the provided input.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.editJournalEntry = async (req, res) => {
    try {
        const fields = Object.keys(req.body)
        const revisableFields = ['title', 'start', 'end']
        const validUpdate = fields.every((field) => revisableFields.includes(field))

        if (!validUpdate) {
            return res.status(400).send({error: 'Invalid update!'})
        }

        const entry = await Journal.findById(req.body.cropId)

        fields.forEach((field) => entry[field] = req.body[field])
        await entry.save()

        res.status(202).send("Journal entry changes have been successfully saved!")
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Delete Manual Journal Entry.
 *
 * Deletes a manually created journal entry.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.deleteJournalEntry = async (req, res) => {
    try {
        const entry = await Journal.findById(req.params.id)

        if (entry && entry.automated) {
            return res.status(403).send("The entry you're deleting is either automated or does not exist.")
        } else {
            await Journal.deleteOne({_id: req.params.id})
            res.status(202).send("Journal entry has been successfully deleted.")
        }
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Get Journal Entries.
 *
 * Sends a list of all the journal entries to display on the calendar.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getJournalEntries = async (req, res) => {
    try {
        const entries = await Journal.find({crop_id: req.params.cropId})
        res.status(200).send(entries)
    } catch (e) {
        res.status(400).send(e)
    }
}
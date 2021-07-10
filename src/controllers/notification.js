const Preset = require('../models/preset')
const notifier = require('../middleware/notification')

/**
 * Send Notification.
 *
 * Pushes the notification via service worker using a new/existing subscription
 *
 * @param cropName          crop name derived from "Start New Crop"
 * @param thresholdValues   threshold values derived from "Start New Crop"
 */
exports.sendNotification = async (req, res) => {
    try {
        const subscription = req.body
        notifier.notify(subscription)
        res.status(200).send({'success': true})
    } catch (e) {
        throw new Error(e.message)
    }
}
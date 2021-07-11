const Preset = require('../models/preset')
const notifier = require('../middleware/notification')

/**
 * Send Notification.
 *
 * Pushes the notification via service worker using a new/existing subscription.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
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
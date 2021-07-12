const webPush = require('web-push')
const Notif = require("../models/notification")

/**
 * Notification Class.
 *
 * This middleware is responsible for all notification-related processes.
 */
class Notification {
    constructor() {
        this.payload = null
        this.pushContact = process.env.WEBPUSH_MAIL
        this.publicKey = process.env.PUBLIC_VAPID_KEY
        this.privateKey = process.env.PRIVATE_VAPID_KEY
    }

    setVapid() {
        webPush.setVapidDetails(this.pushContact, this.publicKey, this.privateKey)
    }

    notify(subscription) {
        webPush.sendNotification(subscription, this.payload).then(result => console.log(result)).catch(e => console.log(e.message))
    }

    setPayload(podName, notifType, sensorKey) {
        const pod = podName.toUpperCase()

        const sensors = {
            'humidity': 'humidity',
            'air_temperature': 'air temperature',
            'nutrient_A': 'Nutrient A',
            'nutrient_B': 'Nutrient B',
            'nutrient_C': 'Nutrient C',
            'ph_up': 'pH Up Buffer',
            'ph_down': 'pH Down Buffer',
            'water_level': 'Water Reservoir',
            'conductivity': 'EC',
            'ph_level': 'pH Level',
            'water_temperature': 'water temperature'
        }

        if (Object.keys(sensors).includes(sensorKey) || sensorKey === 'init') {
            const reservoirKeys = ['nutrient_A', 'nutrient_B', 'nutrient_C', 'ph_up', 'ph_down', 'water_level']
            let title, body, mitigation, sensorName = ''

            if (sensorKey !== 'init') sensorName = sensors[sensorKey]

            if (reservoirKeys.includes(sensorKey) && notifType === 'critical') {
                title = '[' + pod + ']' + sensorName + ': Critical Level'
                mitigation = 'Refill is needed.'
                if (sensorKey === 'water_level') {
                    body = 'The ' + sensorName + ' has hit its critical level! ' + mitigation
                } else {
                    body = 'The ' + sensorName + ' container has hit its critical level! ' + mitigation
                }
            } else if (notifType === 'max') {
                title = '[' + pod + ']' + sensorName + ': Exceeded Threshold'

                if (sensorKey === 'air_temperature' || sensorKey === 'humidity') {
                    mitigation = 'Turning on the fan...'
                } else if (sensorKey === 'conductivity') {
                    mitigation = 'Please refill the water reservoir.'
                } else if (sensorKey === 'ph_level') {
                    mitigation = 'Adjusting using the pH Down Buffer...'
                }

                body = 'The ' + sensorName + ' has exceeded the maximum threshold value! ' + mitigation
            } else if (notifType === 'min') {
                title = '[' + pod + ']' + sensorName + ': Below Threshold'

                if (sensorKey === 'air_temperature') {
                    mitigation = 'Please move the setup to a warmer spot.'
                } else if (sensorKey === 'humidity') {
                    mitigation = 'Please use a humidifier.'
                } else if (sensorKey === 'conductivity') {
                    mitigation = 'Pumping in nutrient solution...'
                } else if (sensorKey === 'ph_level') {
                    mitigation = 'Adjusting using the pH Up Buffer...'
                }

                body = 'The ' + sensorName + ' has fallen below the minimum threshold value! ' + mitigation
            } else if (notifType === 'init') {
                title = pod + ' has been initialized!'
                body = 'You should now see the crop\'s progress in its very own dashboard.'
            }

            const entry = new Notif({
                title: title,
                message: body,
                pod_name: podName
            })

            entry.save(function (err) {
                if (err) console.error(err)
            })

            this.payload = JSON.stringify({
                title: title,
                body: body
            })
        } else {
            console.error('Sensor key is invalid! Value: ' + sensorKey)
        }
    }
}

module.exports = new Notification()
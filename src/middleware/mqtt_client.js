const mqtt = require('mqtt')
const sensorData = require('../controllers/sensor.controller')

/**
 * MqttClient Class.
 *
 * This middleware is responsible for all MQTT-related server-side processes.
 * This is currently connected to a HiveMQ broker for (testing) and will be revised to cater to the local MQTT broker.
 */
class MqttClient {
    constructor() {
        this.client = null
        this.host = process.env.HIVEMQ_URL
        this.port = process.env.MQTT_PORT
        this.protocol = 'mqtts'
        this.username = process.env.MQTT_USERNAME
        this.password = process.env.MQTT_PASSWORD
    }

    connectToBroker() {
        this.client = mqtt.connect({
            host: this.host,
            port: this.port,
            protocol: this.protocol,
            username: this.username,
            password: this.password
        })

        this.client.on('error', function (e) {
            console.log(e);
            this.client.end();
        })

        this.client.on('connect', function () {
            console.log('Successfully connected to the MQTT broker.')
        })

        this.client.on('message', function (topic, message) {
            // TODO: store message to Sensor Data collection
            sensorData.retrieve(message)
        })
    }

    // subscribe to topic :podName/sensor_data/
    subscribeToPod(podName) {
        this.client.subscribe(podName + '/sensor_data/')
        this.client.subscribe(podName + '/probe_data/')
    }

    // publish JSON to topic :podName/commands/new_crop/
    publishNewCropSettings(podName, data) {
        let topic = podName + '/commands/new_crop/'

        try {
            this.client.publish(topic, JSON.stringify(data), {
                qos: 0,
                retain: true
            })
        } catch (e) {
            console.error(e)
        }
    }

    // publish JSON to topic :podName/commands/change_value/sensor/
    publishRevisedCropSettings(podName, sensor, data) {
        let sensors = ['air_humidity', 'air_temperature', 'ec_reading', 'ph_reading']

        if (sensors.indexOf(sensor) !== -1) {
            let topic = podName + '/commands/change_value/' + sensor + "/"

            try {
                this.client.publish(topic, JSON.stringify(data), {
                    qos: 0,
                    retain: true
                })
            } catch (e) {
                console.error(e)
            }
        } else {
            console.error('Sensor name is invalid.')
        }
    }

    publishCropHarvest(podName, data) {
        let harvestTopic = podName + '/commands/harvest/'
        let newCropTopic = podName + '/commands/new_crop/'
        let changeValueTopic = podName + '/commands/change_value/'
        let sensors = ['air_humidity', 'air_temperature', 'ec_reading', 'ph_reading']

        try {
            this.client.publish(newCropTopic, '', {
                qos: 0,
                retain: false
            })
            sensors.forEach((sensor) => {
                this.client.publish(changeValueTopic + sensor + '/', '', {
                    qos: 0,
                    retain: false
                })
            })
            this.client.publish(harvestTopic, data, {
                qos: 0,
                retain: false
            })
        } catch (e) {
            console.error(e)
        }
    }
}

module.exports = new MqttClient()
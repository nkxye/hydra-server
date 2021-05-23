const mqtt = require('mqtt')

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
        })
    }

    // subscribe to topic :podName/sensor_data
    subscribeToPod(podName) {
        this.client.subscribe(podName + '/sensor_data')
    }

    // publish JSON to topic :podName/commands/new_crop
    publishNewCropSettings(podName, data) {
        let topic = podName + '/commands/new_crop'

        try {
            this.client.publish(topic, JSON.stringify(data), {
                qos: 0,
                retain: true
            })
        } catch (e) {
            console.error(e)
        }
    }

    // publish JSON to topic :podName/commands/init_pumps
    initializePumps(podName, answer) {
        let topic = podName + '/commands/init_pumps'

        try {
            this.client.publish(topic, answer)
        } catch (e) {
            console.error(e)
        }
    }

    // publish JSON to topic :podName/commands/change_value/sensor
    publishRevisedCropSettings(podName, sensor, data) {
        let topic = podName + '/commands/change_value/' + sensor

        try {
            this.client.publish(topic, data)
        } catch (e) {
            console.error(e)
        }
    }

    harvestCrop(podName, data) {
        let harvestTopic = podName + '/commands/harvest/'
        let newCropTopic = podName + '/commands/new_crop/'

        try {
            this.client.publish(harvestTopic, data)
            this.client.publish(newCropTopic, '', {
                qos: 0,
                retain: false
            })
        } catch (e) {
            console.error(e)
        }
    }
}

module.exports = new MqttClient()
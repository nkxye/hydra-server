const mqtt = require('mqtt')
// const fs = require('fs')
// const caFile = fs.readFileSync("./certs/ca.crt")
// const key = fs.readFileSync('./certs/client.key')
// const cert = fs.readFileSync('./certs/client.crt')
const sensorController = require('../controllers/sensor.controller')

/**
 * MqttClient Class.
 *
 * This middleware is responsible for all MQTT-related server-side processes.
 * This is currently connected to a HiveMQ broker for (testing) and will be revised to cater to the local MQTT broker.
 */
class MqttClient {
    // HiveMQ constructor
    constructor() {
        this.client = null
        this.host = process.env.HIVEMQ_URL
        this.port = process.env.MQTT_PORT
        this.protocol = 'mqtts'
        this.username = process.env.MQTT_USERNAME
        this.password = process.env.MQTT_PASSWORD
    }

    // local MQTTS constructor
    // constructor() {
    //     this.client = null
    //     this.host = process.env.LOCAL_URL
    //     this.port = process.env.MQTT_PORT
    //     this.protocol = 'mqtts'
    //     this.key = key
    //     this.cert = cert
    //     this.caFile = caFile
    // }

    connectToBroker() {
        // HiveMQ connect
        this.client = mqtt.connect({
            host: this.host,
            port: this.port,
            protocol: this.protocol,
            username: this.username,
            password: this.password,
            clean: true
        })

        // local MQTTS connect
        // this.client = mqtt.connect({
        //     host: this.host,
        //     port: this.port,
        //     protocol: this.protocol,
        // resubscribe: true
        //     key: this.key,
        //     cert: this.cert,
        //     ca: this.caFile,
        //     protocolVersion: 4
        // })

        this.client.on('error', function (e) {
            console.error(e)
            process.exit()
        })

        this.client.on('connect', async function () {
            console.log('Successfully connected to the MQTT broker.')
        })

        this.client.on('message', async function (topic, message) {
            // identify pod name and data type (sensor_data, probe_data) thru slice and split
            const [podName, dataType] = topic.slice(0, -1).split("/")
            await sensorController.retrieve(podName, dataType, message).then(r => console.log('Data from "' + topic + '" received.'))
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
                qos: 1,
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
                    qos: 1,
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
                qos: 1,
                retain: false
            })
            sensors.forEach((sensor) => {
                this.client.publish(changeValueTopic + sensor + '/', '', {
                    qos: 1,
                    retain: false
                })
            })
            this.client.publish(harvestTopic, data, {
                qos: 1,
                retain: false
            })

            this.client.unsubscribe(podName + '/sensor_data/')
            this.client.unsubscribe(podName + '/probe_data/')
        } catch (e) {
            console.error(e)
        }
    }
}

module.exports = new MqttClient()
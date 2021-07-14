const { startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, format } = require('date-fns')
const yargs = require('yargs')
const chalk = require('chalk')
require('../db/mongoose')
const SensorData = require('../models/sensor_data')
const Crop = require('../models/crop')
const User = require('../models/user')
const analyticsController = require('../controllers/analytics.controller')

const threshold_values = {
    conductivity: {
        min: 0.5,
        max: 2
    },
    humidity: {
        min: 50,
        max: 60
    },
    ph_level: {
        min: 5.5,
        max: 6.5
    },
    air_temperature: {
        min: 18,
        max: 16
    }
}

// Math.floor(Math.random() * (max - min + 1)) + min

yargs.version('1.0.0')

yargs.command({
    command: 'crop',
    describe: 'Inserts dummy data for past crops into the database',
    builder: {
        podName: {
            describe: 'Pod/setup name',
            demandOption: true,
            type: 'string'
        }
        },
    handler: async (argv) => {
        console.log(chalk.bold.blue.inverse('Inserting dummy past crops...'))

        const crop = new Crop({
            crop_name: "Cherry Tomatoes",
            pod_name: argv.podName,
            active: false,
            initialize_pumps: true,
            threshold_values: threshold_values
        })

        await crop.save()

        crop.createdAt = new Date() // TODO: random date
        crop.updatedAt = new Date() // TODO: random date

        await crop.save({ timestamps: false })
    }
})

yargs.command({
    command: 'sensor-data',
    describe: 'Inserts dummy data for sensor data into the database',
    builder: {
        cropId: {
            describe: 'Crop ObjectId',
            demandOption: true,
            type: 'string'
        }
    },
    handler: async (argv) => {
        console.log(chalk.bold.blue.inverse('Inserting dummy sensor data for the provided Crop ID...'))

        const data = [
            {
                sensor: 'conductivity',
                crop: argv.cropId,
                start: Date.now(), // TODO: random date
                end: Date.now(), // TODO: random date
                measurement_count: 1,
                sum_values: 1.2
            },
            {
                sensor: 'humidity',
                crop: argv.cropId,
                start: Date.now(), // TODO: random date
                end: Date.now(), // TODO: random date
                measurement_count: 1,
                sum_values: 60
            },
            {
                sensor: 'ph_level',
                crop: argv.cropId,
                start: Date.now(), // TODO: random date
                end: Date.now(), // TODO: random date
                measurement_count: 1,
                sum_values: 6
            },
            {
                sensor: 'air_temperature',
                crop: argv.cropId,
                start: Date.now(), // TODO: random date
                end: Date.now(), // TODO: random date
                measurement_count: 1,
                sum_values: 26
            }
        ]

        const sensorData = await new SensorData.insertMany(data)
        await sensorData.save()
    }
})

yargs.command({
    command: 'analytics',
    describe: 'Inserts dummy data for analytics into the database',
    builder: {
        cropId: {
            describe: 'Crop ObjectId',
            demandOption: true,
            type: 'string'
        }
    },
    handler: async (argv) => {
        console.log(chalk.bold.blue.inverse('Inserting dummy analytics for the provided Crop ID...'))
        await analyticsController.updateAnalytics(argv.cropId)
    }
})

yargs.parse()
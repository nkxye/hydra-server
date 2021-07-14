const yargs = require('yargs')
const chalk = require('chalk')
const mongoose = require('mongoose')
const SensorData = require('../models/sensor_data')
const Crop = require('../models/crop')
const sensorController = require('../controllers/sensor.controller')
const analyticsController = require('../controllers/analytics.controller')
const MONGODB_URL = 'mongodb://127.0.0.1:27017/hydr-a'

// Math.floor(Math.random() * (max - min + 1)) + min

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('Successfully connected to the MongoDB cluster.')
    sensorController.insertSensors()
}).catch((e) => {
    console.error(e);
});

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
            threshold_values: {
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
                    max: 26
                }
            }
        })

        await crop.save()

        crop.createdAt = new Date(2021, 7, 1)
        crop.updatedAt = new Date(2021, 7, 14)

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
                start: new Date(2021, 6, 12, 11, 30),
                end: new Date(2021, 6, 12, 23, 30),
                measurement_count: 30,
                sum_values: 54
            },
            {
                sensor: 'humidity',
                crop: argv.cropId,
                start: new Date(2021, 6, 12, 11, 30),
                end: new Date(2021, 6, 12, 23, 30),
                measurement_count: 21,
                sum_values: 1145
            },
            {
                sensor: 'ph_level',
                crop: argv.cropId,
                start: new Date(2021, 6, 12, 11, 30),
                end: new Date(2021, 6, 12, 23, 30),
                measurement_count: 30,
                sum_values: 174
            },
            {
                sensor: 'air_temperature',
                crop: argv.cropId,
                start: new Date(2021, 6, 12, 11, 30),
                end: new Date(2021, 6, 12, 23, 30),
                measurement_count: 30,
                sum_values: 570
            },
            {
                sensor: 'conductivity',
                crop: argv.cropId,
                start: new Date(2021, 6, 13, 11, 30),
                end: new Date(2021, 6, 13, 23, 30),
                measurement_count: 30,
                sum_values: 24
            },
            {
                sensor: 'humidity',
                crop: argv.cropId,
                start: new Date(2021, 6, 13, 11, 30),
                end: new Date(2021, 6, 13, 23, 30),
                measurement_count: 17,
                sum_values: 947
            },
            {
                sensor: 'ph_level',
                crop: argv.cropId,
                start: new Date(2021, 6, 13, 11, 30),
                end: new Date(2021, 6, 13, 23, 30),
                measurement_count: 30,
                sum_values: 176
            },
            {
                sensor: 'air_temperature',
                crop: argv.cropId,
                start: new Date(2021, 6, 13, 11, 30),
                end: new Date(2021, 6, 13, 23, 30),
                measurement_count: 30,
                sum_values: 654
            },
            {
                sensor: 'conductivity',
                crop: argv.cropId,
                start: new Date(2021, 6, 14, 11, 30),
                end: new Date(2021, 6, 14, 23, 30),
                measurement_count: 30,
                sum_values: 20
            },
            {
                sensor: 'humidity',
                crop: argv.cropId,
                start: new Date(2021, 6, 14, 11, 30),
                end: new Date(2021, 6, 14, 23, 30),
                measurement_count: 17,
                sum_values: 887
            },
            {
                sensor: 'ph_level',
                crop: argv.cropId,
                start: new Date(2021, 6, 14, 11, 30),
                end: new Date(2021, 6, 14, 23, 30),
                measurement_count: 30,
                sum_values: 253
            },
            {
                sensor: 'air_temperature',
                crop: argv.cropId,
                start: new Date(2021, 6, 14, 11, 30),
                end: new Date(2021, 6, 14, 23, 30),
                measurement_count: 30,
                sum_values: 762
            },
            {
                sensor: 'conductivity',
                crop: argv.cropId,
                start: new Date(2021, 6, 15, 11, 30),
                end: new Date(2021, 6, 15, 23, 30),
                measurement_count: 80,
                sum_values: 47
            },
            {
                sensor: 'humidity',
                crop: argv.cropId,
                start: new Date(2021, 6, 15, 11, 30),
                end: new Date(2021, 6, 15, 23, 30),
                measurement_count: 30,
                sum_values: 1582
            },
            {
                sensor: 'ph_level',
                crop: argv.cropId,
                start: new Date(2021, 6, 15, 11, 30),
                end: new Date(2021, 6, 15, 23, 30),
                measurement_count: 30,
                sum_values: 216
            },
            {
                sensor: 'air_temperature',
                crop: argv.cropId,
                start: new Date(2021, 6, 15, 11, 30),
                end: new Date(2021, 6, 15, 23, 30),
                measurement_count: 30,
                sum_values: 576
            }
        ]

        await SensorData.insertMany(data).then((r) => {
            console.log(chalk.bold.green.inverse('Successfully seeded sensor data for cropId: ' + argv.cropId + '.'))
            process.exit()
        })
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
        await analyticsController.updateAnalyticsDailySeeder(argv.cropId, new Date(2021, 6, 12))
        await analyticsController.updateAnalyticsDailySeeder(argv.cropId, new Date(2021, 6, 13))
        await analyticsController.updateAnalyticsDailySeeder(argv.cropId, new Date(2021, 6, 14))
        await analyticsController.updateAnalyticsDailySeeder(argv.cropId, new Date(2021, 6, 15))
        process.exit()
    }
})

yargs.parse()
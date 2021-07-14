const mongoose = require('mongoose')
const sensorController = require('../controllers/sensor.controller')

/**
 * Establish MongoDB Connection.
 *
 * This connects the app to the MongoDB cluster via Mongoose ORM.
 *
 */
mongoose.connect(process.env.MONGODB_URL, {
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
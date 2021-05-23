const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const cropRouter = require('./routers/crop')
const mqttClient = require('./middleware/mqtt_client')

const app = express()
const port = process.env.PORT
const whitelist = ['http://localhost:3000'] // port for client-side

app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(undefined, true)
        } else {
            callback(new Error('The origin is not authorized to send requests.'))
        }
    }
}))

app.use(userRouter)
app.use(cropRouter)

mqttClient.connectToBroker()

app.listen(port, () => {
    console.log('Server is up on Port ' + port)
})
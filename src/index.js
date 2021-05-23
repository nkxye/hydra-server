const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const cropRouter = require('./routers/crop')
const mqttClient = require('./middleware/mqtt_client')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(cropRouter)

mqttClient.connectToBroker()

app.listen(port, () => {
    console.log('Server is up on Port ' + port)
})
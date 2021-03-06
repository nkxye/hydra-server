const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const cropRouter = require('./routers/crop')
const podRouter = require('./routers/pod')
const presetRouter = require('./routers/preset')
const journalRouter = require('./routers/journal')
const notifRouter = require('./routers/notfication')
const analyticRouter = require('./routers/analytics')
const rssRouter = require('./routers/rss')
const mqttClient = require('./middleware/mqtt_client')
const notifier = require('./middleware/notification')

const app = express()
const port = process.env.PORT
const whitelist = ['http://localhost:3000', 'http://localhost:5000']

app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Request from domain not allowed.'))
        }
    }
}))

app.use(userRouter)
app.use(cropRouter)
app.use(podRouter)
app.use(presetRouter)
app.use(journalRouter)
app.use(notifRouter)
app.use(analyticRouter)
app.use(rssRouter)

notifier.setVapid()
mqttClient.connectToBroker()

app.listen(port, () => {
    console.log('Server is up on Port ' + port)
})
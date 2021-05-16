const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const cropRouter = require('./routers/crop')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(cropRouter)

app.listen(port, () => {
    console.log('Server is up on Port ' + port)
})
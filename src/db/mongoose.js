const mongoose = require('mongoose')

/**
 * Establish MongoDB Connection.
 *
 * This connects the app to the MongoDB Atlas cluster via Mongoose ORM.
 *
 */
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('Successfully connected to the MongoDB Atlas cluster.')
}).catch((e) => {
    console.error(e);
});
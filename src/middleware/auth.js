const jwt = require('jsonwebtoken')
const User = require('../models/user')

/**
 * Auth Middleware.
 *
 * This async function verifies the Bearer token by checking the tokens stored in the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 * @param next  Callback argument to pass control to the next middleware function.
 */
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if (!user) {
            throw new Error()
        } else {
            req.token = token
            req.user = user
            next()
        }
    } catch (e) {
        res.status(401).send('Authentication failed.')
    }
}

module.exports = auth
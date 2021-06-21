const User = require('../models/user')

/**
 * Register Admin.
 *
 * Stores the newly created admin credentials to the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.registerAdmin = async (req, res) => {
    try {
        const adminExists = await User.findOne({'username': 'admin'})

        if (adminExists) {
            return res.status(400).send('An admin account already exists.')
        } else {
            const user = new User({
                email: req.body.email,
                password: req.body.password,
            })

            user.pods_owned = user.pods_owned.concat({
                pod_name: req.body.setupName
            })

            // TODO: init sensor entries upon creation of pod
            // TODO: get last will to let front end know that arduino is offline - get pod data

            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({user, token})
        }
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Elevate Role.
 *
 * This function elevates the role to admin to give access to critical CRUD functions.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.elevateRole = async (req, res) => {
    try {
        const user = await User.checkPassword(req.body.password)
        const token = await user.generateAuthToken()
        res.status(202).send({user, token})
    } catch (e) {
        res.status(406).send(e)
    }
}

/**
 * End Session.
 *
 * Ends the admin's current session by removing the current token.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.endSession = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.status(200).send('Admin session has ended.')
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Update Password and/or Recovery Email.
 *
 * Updates the password and/or recovery email of the user.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.updateCredentials = async (req, res) => {
    const fields = Object.keys(req.body)
    const revisableFields = ['email', 'password']
    const validUpdate = fields.every((field) => revisableFields.includes(field))

    if (!validUpdate) {
        return res.status(500).send({error: 'Invalid update!'})
    }

    try {
        fields.forEach((field) => req.user[field] = req.body[field])
        await req.user.save()
        res.status(202).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Get Admin Info.
 *
 * Sends the admin info without the password and tokens.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getAdminInfo = async (req, res) => {
    res.status(200).send(req.user)
}

// TODO: return list of unoccupied pods and list of presets
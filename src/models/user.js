const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        trim: true,
        default: 'admin'
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email address is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    pods_owned: [{
        pod_name: {
            type: String,
            required: false,
            trim: true,
            minLength: 5,
            maxLength: 15
        },
        occupied: {
            type: Boolean,
            required: true,
            default: false
        }
    }]
})

/**
 * Check Password.
 *
 * This model/static method checks if the password matches the bcrypt hash value stored in the database.
 *
 * @param  {Object} password    The password entered by the user.
 * @return {Object} admin       The User object of the admin.
 */
userSchema.statics.checkPassword = async (password) => {
    const username = 'admin'
    const admin = await User.findOne({username})
    const validPassword = await bcrypt.compare(password, admin.password)

    if (!validPassword) {
        throw new Error('Invalid password. Please try again.')
    } else {
        return admin
    }
}

/**
 * Generate JWT.
 *
 * This instance method generates an auth token that is valid for 15 minutes.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 * @return {Object} token       The generated JWT for the session.
 */
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '15 minutes'})

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

/**
 * Clusters Owned by the Admin.
 *
 * This instance method returns the array of clusters owned by the admin.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 * @return {Object} this.toObject().clusters_owned   Returns a JSON containing the cluster info.
 */
userSchema.methods.getPodsOwned = function () {
    return this.toObject().pods_owned
}

/**
 * JSON Format for the User Object.
 *
 * This instance method excludes the password and tokens by default when printing out the User object in JSON.
 * NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 * @return {Object} adminInfo   The User object of the admin.
 */
userSchema.methods.toJSON = function () {
    const adminInfo = this.toObject()

    delete adminInfo.password
    delete adminInfo.tokens
    delete adminInfo.pods_owned

    return adminInfo
}

/**
 * Hash Password using bcrypt.
 *
 * This function triggers before the User object gets saved to the database and hashes the password everytime one
 * gets created/modified. NOTE: Do not use arrow function as it does not allow "this" keyword binding.
 *
 */
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
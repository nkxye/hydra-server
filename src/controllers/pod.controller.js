const sensorController = require('../controllers/sensor.controller')

/**
 * Add New Setup
 *
 * Stores the newly added setup/pod to the database.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.setupNewPod = async (req, res) => {
    try {
        req.user.pods_owned = req.user.pods_owned.concat({
            pod_name: req.body.setupName
        })

        await req.user.save()
        await sensorController.initSensors(req.body.setupName)

        res.status(201).send()
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Get List of Vacant Pods.
 *
 * Sends a list of all the unoccupied pods to display on the "Setup Name" field of "Start New Crop".
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getVacantPods = async (req, res) => {
    const vacantPods = JSON.stringify(req.user.pods_owned.filter((pod) =>  !pod.occupied))
    const podNames = JSON.parse(vacantPods, (key, value) => (key !== 'occupied' && key !== '_id') ? value : key[-1]);

    res.status(200).send(podNames)
}
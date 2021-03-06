const Analytics = require('../models/analytics')
const SensorData = require('../models/sensor_data')
const { startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, startOfDay, endOfDay, format } = require('date-fns')

/**
 * Get Chart Data.
 *
 * Sends a JSON to populate the line chart in the crop dashboard.
 *
 * @param req   HTTP request argument to the middleware function
 * @param res   HTTP response argument to the middleware function.
 */
exports.getChartData = async (req, res) => {
    const analyticData = await Analytics.find({
        crop_id: req.params.cropId,
        date: {
            $gte: startOfWeek(new Date()),
            $lt: endOfWeek(new Date())
        }
    }).sort('date')

    let humidityDataset;
    humidityDataset = [];
    let temperatureDataset;
    temperatureDataset = [];
    let ecDataset;
    ecDataset = [];
    let phDataset;
    phDataset = [];
    let labels;
    labels = [];

    if (typeof analyticData !== 'undefined' && analyticData !== null) {
        for (const data of analyticData) {
            if (data.sensor === 'humidity') {
                humidityDataset.push(parseFloat(data.average))
            } else if (data.sensor === 'air_temperature') {
                temperatureDataset.push(parseFloat(data.average))
            } else if (data.sensor === 'conductivity') {
                ecDataset.push(parseFloat(data.average))
            } else if (data.sensor === 'ph_level') {
                phDataset.push(parseFloat(data.average))
            }

            if (!labels.includes(format(new Date(data.date), 'P'))) {
                labels.push(format(new Date(data.date), 'P'))
            }
        }
    }

    let chartDataset = {
        labels: labels,
        datasets: [
            {
                label: "Temperature",
                data: temperatureDataset,
                borderColor: "rgba(255,0,0,0.2)",
                pointBackgroundColor: "rgba(255,0,0,1)",
                fill: false,
            },
            {
                label: "Humidity",
                data: humidityDataset,
                borderColor: "rgba(0,0,235,0.2)",
                pointBackgroundColor: "rgba(0,0,235,1)",
                fill: false,
            },
            {
                label: "EC",
                data: ecDataset,
                borderColor: "rgba(248, 148, 6, 0.2)",
                pointBackgroundColor: "rgba(248, 148, 6, 1)",
                fill: false,
            },
            {
                label: "pH Level",
                data: phDataset,
                borderColor: "rgba(154, 18, 179, 0.2)",
                pointBackgroundColor: "rgba(154, 18, 179, 1)",
                fill: false,
            },
        ],
    }

    res.status(200).send(chartDataset)
}

exports.updateAnalyticsDaily = async (cropId) => {
    // TODO: cron job to update analytics

    const sensors = ['humidity', 'air_temperature', 'conductivity', 'ph_level']

    for (const sensor of sensors) {
        let data = await SensorData.find({
            crop: cropId,
            sensor: sensor,
            start: {
                "$gte": startOfYesterday(Date.now()),
                "$lte": endOfYesterday(Date.now())
            }
        })

        let measurementCount = 0, totalSum = 0

        for (const entry of data) {
            measurementCount += parseInt(entry.measurement_count)
            totalSum += parseFloat(entry.sum_values)
        }

        let average = totalSum / measurementCount

        let chartData = new Analytics({
            sensor: sensor,
            crop_id: cropId,
            average: average,
            date: startOfYesterday(new Date())
        })

        await chartData.save()
    }
}

exports.updateAnalyticsDailySeeder = async (cropId, date) => {
    // TODO: cron job to update analytics

    const sensors = ['humidity', 'air_temperature', 'conductivity', 'ph_level']

    for (const sensor of sensors) {
        let data = await SensorData.find({
            crop: cropId,
            sensor: sensor,
            start: {
                "$gte": startOfDay(date),
                "$lte": endOfDay(date)
            }
        })

        let measurementCount = 0, totalSum = 0

        for (const entry of data) {
            measurementCount += parseInt(entry.measurement_count)
            totalSum += parseFloat(entry.sum_values)
        }

        let average = totalSum / measurementCount

        let chartData = new Analytics({
            sensor: sensor,
            crop_id: cropId,
            average: average,
            date: startOfDay(date)
        })

        await chartData.save()
    }
}
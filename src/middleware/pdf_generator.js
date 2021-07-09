const PDF = require('pdfkit')
const fs = require('fs')

const createReport = (crop, entries, entryCount) => {
    let doc = new PDF;
    doc.pipe(fs.createWriteStream('./reports/'+ crop.pod_name + '_' + crop._id + '_report.pdf'))

    doc.moveDown(2)
    doc.image('./reports/img/circle.jpg', 270, 50, {fit: [80, 80], align: 'center'})
    doc.moveDown(4)
    doc.fontSize(16).font('Helvetica-Bold').fillColor('black').text(crop.pod_name.toUpperCase() + ': ' + crop.crop_name, { align: 'center'})
    doc.moveDown(2)

    doc.fontSize(14).font('Helvetica').text('"' + crop.crop_name + '" was planted on ' + crop.pod_name.toUpperCase() + ' last ' + dateFormatter(crop.createdAt)
        + '. Realtime measurements were recorded from the sensors until its harvest last '
        + dateFormatter(crop.updatedAt) + '. ' + entryCount + ' entries were added to the Crop Journal.')
    doc.moveDown(2)

    doc.fontSize(14).font('Helvetica-Bold').text('Last Recorded Threshold Values', {bold: true})
    doc.moveDown()
    doc.fontSize(13).font('Helvetica').text('Conductivity: ' + crop.threshold_values.conductivity.min + ' mS/cm - '
        + crop.threshold_values.conductivity.max + ' mS/cm')
    doc.text('Humidity: ' + crop.threshold_values.humidity.min + '% - ' + crop.threshold_values.humidity.max + '%')
    doc.text('pH Level: pH ' + crop.threshold_values.ph_level.min + ' - pH ' + crop.threshold_values.ph_level.max)
    doc.text('Air Temperature: ' + crop.threshold_values.air_temperature.min + '°C - ' + crop.threshold_values.air_temperature.max + '°C')
    doc.moveDown(2)

    doc.fontSize(14).font('Helvetica-Bold').text('Journal Entries')
    doc.fontSize(8).font('Helvetica').text('A = automated, U = user defined')
    doc.moveDown()

    entries.forEach((entry) => {
        let automated = (entry.automated) ? 'A' : 'U'
        doc.fontSize(13).text('-  [' + automated + '] ' + dateFormatter(entry.start_date) + ' - ' + dateFormatter(entry.end_date) + ' | ' + entry.title)
    })

    doc.end()
}

const dateFormatter = (date) => {
    const hour = ("0" + date.getHours()).slice(-2);
    const minute = ("0" + date.getMinutes()).slice(-2);
    let formattedDate = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + hour +
        ':' + date.getMinutes() + 'AM'

    if (date.getHours() >= 12) {
        formattedDate = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + hour +
            ':' + minute + 'PM'
    }

    return formattedDate
}

module.exports = createReport
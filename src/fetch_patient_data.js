const _ = require('lodash')
const FetchSheet = require('./fetch_sheet.js')

const numberPattern = /[0-9]+$/
const shortDatePattern = /([0-9]+)\/([0-9]+)/

// Post processes the data to normalize field names etc.
const postProcessData = (rawData) => {

  // Check validity of the row.
  const isValidRow = row => {
    if (!row.detectedPrefecture) { return false }
    if (!row.dateAnnounced) { return false }
    return true
  }

  const transformRow = row => {
    const normalizeNumber = n => {
      if (isNaN(parseInt(n))) { return -1 }
      return parseInt(n)
    }

    const normalizeDate = n => {
      if (!n) {
        return n
      }
      return normalizeFixedWidthNumbers(n.replace('ｰ', '-'))
    }

    const normalizeFixedWidthNumbers = v => {
      return v.replace(/０/g, '0')
       .replace(/１/g, '1')
       .replace(/２/g, '2')
       .replace(/３/g, '3')
       .replace(/４/g, '4')
       .replace(/５/g, '5')
       .replace(/６/g, '6')
       .replace(/７/g, '7')
       .replace(/８/g, '8')
       .replace(/９/g, '9')
    }

    // Converts the number into a string, if possible.
    const normalizeId = n => {
      // Check if it has any number in it.
      if (numberPattern.test(n)) {
        return n
      }
      return -1
    }

    // Converts Gender
    const normalizeGender = v => {
      if (v == 'm' || v == 'M') {
        return 'M'
      }
      if (v == 'f' || v == 'F') {
        return 'F'
      }
      return ''
    }

    // Parse short date
    const parseShortDate = v => {
      if (v) {
        let shortDateMatch = v.match(shortDatePattern)
        if (shortDateMatch) {
          let month = shortDateMatch[1].padStart(2, '0')
          let day = shortDateMatch[2].padStart(2, '0')
          return `2020-${month}-${day}`
        }
      }
      return v
    }

    let transformedRow = {
      'patientId': normalizeId(row.patientNumber),
      'dateAnnounced': normalizeDate(row.dateAnnounced),
      'ageBracket': normalizeNumber(row.ageBracket),
      'gender': normalizeGender(row.gender),
      'residence': row.residenceCityPrefecture,
      'detectedCityTown': row.detectedCity,
      'detectedPrefecture': row.detectedPrefecture,
      'patientStatus': row.status,
      'notes': row.notes,
      'knownCluster': row.knownCluster,
      'relatedPatients': row.relatedPatients,
      'mhlwPatientNumber': row.mhlwOrigPatientNumber,
      'prefecturePatientNumber': row.prefecturePatientNumber,
      'cityPrefectureNumber': row.cityPatientNumber,
      'prefectureSourceURL': row.prefectureUrlAuto,
      'charterFlightPassenger': row.charterFlightPassenger,
      'cruisePassengerDisembarked': row.cruisePassengerDisembarked,
      'detectedAtPort': row.detectedAtPort,
      'deceasedDate': parseShortDate(row.deceased),
      'deceasedReportedDate': parseShortDate(row.deathReportedDate),
      'sourceURL': row.sourceS,
      'prefectureURL': row.prefectureURLAuto,
      'cityURL': row.cityURLAuto,
      'deathURL': row.deathURLAuto
    }

    // filter empty cells.
    transformedRow = _.pickBy(transformedRow, (v, k) => {
      if (v === '' || v === false || typeof v === 'undefined') {
        return false
      }
      return true
    })

    // convert boolean fields
    let booleanFields = [ 
      'charterFlightPassenger', 
      'cruisePassengerDisembarked', 
    ]
    transformedRow = _.mapValues(transformedRow, (v, k) => {
      if (booleanFields.indexOf(k) != -1) {
        return (v == '1')
      }
      return v
    })

    // Add a field to indicate whether we count as patient or not.
    transformedRow.confirmedPatient = (transformedRow.patientId != -1)

    // If the patient is deceased, but we don't know the date they died, use the dateAnnounced for now.
    if (transformedRow.patientStatus == 'Deceased') {
      if (typeof transformedRow.deceasedDate === 'undefined' || !transformedRow.deceasedDate) {
        transformedRow.deceasedDate = transformedRow.dateAnnounced
      }
    }

    return transformedRow
  }

  const rows = _.filter(_.map(rawData, transformRow), isValidRow)
  return rows
}


async function fetchPatientData(sheetId, sheetName) {
  return FetchSheet.fetchRows(sheetId, sheetName)
    .then(data => {
      return postProcessData(data)
    })
}

exports.fetchPatientData = fetchPatientData;

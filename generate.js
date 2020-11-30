const fs = require('fs')
const moment = require('moment')
const _ = require('lodash')

const FetchPatientData = require('./src/fetch_patient_data.js')
const Summarize = require('./src/summarize.js')
const FetchSheet = require('./src/fetch_sheet.js')
const MergePatients = require('./src/merge_patients.js')
const Prefectures = require('./src/prefectures.js')

const generateLastUpdated = async (patients) => {
  // Check if patient list changed size, if it did, then update lastUpdated
  let lastUpdated = null
  const existingPatientsData = fs.readFileSync(`./docs/patient_data/latest.json`)
  if (existingPatientsData) {
    const existingPatients = JSON.parse(existingPatientsData)
    if (existingPatients && existingPatients.length && existingPatients.length != patients.length) {
      // Add 480 = UTC+8 for JST.
      lastUpdated = moment().utcOffset(480).format()
      console.log(`Patients data updated. New: ${patients.length} Old: ${existingPatients.length}`)
    }
  }

  // Patient data didn't get updated, pull lastUpdate from the latest summary.
  if (lastUpdated == null) {
    const existingSummaryData = fs.readFileSync(`./docs/summary/latest.json`)
    if (existingSummaryData) {
      const existingSummary = JSON.parse(existingSummaryData)
      if (existingSummary && existingSummary.updated && typeof existingSummary.updated === 'string') {
        //lastUpdated = existingSummary.updated
        lastUpdated = moment().utcOffset(480).format()
        console.log(`Pulling lastUpdated from summary/latest.json: ${lastUpdated}`)
      }
    }
  }

  // If it's still null, we don't know. So just use the latest timestamp.
  if (lastUpdated == null) {
    lastUpdated = moment().utcOffset(480).format()
  }
  return lastUpdated
}

const fetchAndSummarize = async (dateString, useNewMethod) => {
  const prefectureNames = Prefectures.prefectureNamesEn()
  const regions = Prefectures.regionPrefectures()

  const latestSheetId = '1pPXoVDf2LtZB-LPEYytvzd9ktkNXGFYF3tAFrKJrjPE'
  const daily = await FetchSheet.fetchRows(latestSheetId, 'Sum By Day')
  const prefectures = await FetchSheet.fetchRows(latestSheetId, 'Prefecture Data')
  const recoveries = await FetchSheet.fetchRows(latestSheetId, 'Recoveries')


  const mergeAndOutput = (allPatients) => {
    let patients = MergePatients.mergePatients(allPatients)
    console.log(`Total patients fetched: ${patients.length}`)

    generateLastUpdated(patients)
      .then(lastUpdated => {
        // Write patient data
        const patientOutputFilename = `./docs/patient_data/${dateString}.json`
        fs.writeFileSync(patientOutputFilename, JSON.stringify(patients, null, '  '))

        // Write daily and prefectural summary.
        const summary = Summarize.summarize(patients, daily, prefectures, recoveries, prefectureNames, regions, lastUpdated)
        const summaryOutputFilename = `./docs/summary/${dateString}.json`
        fs.writeFileSync(summaryOutputFilename, JSON.stringify(summary, null, '  '))

        // Write minified version of daily/prefectural summary
        const summaryMinifiedOutputFilename = `./docs/summary_min/${dateString}.json`
        fs.writeFileSync(summaryMinifiedOutputFilename, JSON.stringify(summary))

        console.log('Success.')
      })     
  }

  if (useNewMethod) {
    const patientListTabs = [
      { 
        sheetId: latestSheetId, 
        tabs: [
          'Patient Data', 
          'Ulaanbaatar',
        ]
      }
    ]
    FetchPatientData.fetchPatientDataFromSheets(patientListTabs)
      .then(allPatients => {
        mergeAndOutput(allPatients)
      })
      .catch(error => {
        console.log(error)
      })
  } else {
    // OLD method
    const patientListFetches = [
      FetchPatientData.fetchPatientData(latestSheetId, 'Patient Data'),
      FetchPatientData.fetchPatientData(latestSheetId, 'Ulaanbaatar'),
    ]
    Promise.all(patientListFetches)
      .then(patientLists => {
        let allPatients = _.flatten(patientLists)
        mergeAndOutput(allPatients)
      })
      .catch(error => {
        console.log(error)
      })

  }
}

const writePerPrefecturePatients = (prefectureName, allPatients, dateString) => {
    const lowercasePrefecture = _.camelCase(prefectureName)
    const prefecturePatientsFilename = `./docs/patients/${lowercasePrefecture}_${dateString}.json`
    const prefecturePatients = _.filter(patients, v => { return v.detectedPrefecture == prefectureName})
    fs.writeFileSync(prefecturePatientsFilename, JSON.stringify(prefecturePatients, null, '  '))
}

try {
  // Add 480 = UTC+8 for ULT.
  const dateString = moment().utcOffset(480).format('YYYY-MM-DD')
  fetchAndSummarize(dateString, true)
} catch (e) {
  console.error(e)
}

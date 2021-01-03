const moment = require('moment')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')


// Creates a symlink to the latest version of the data (which can be served)
const publish = () => {
  // Add 380 = UTC+8 for ULT.
  const dateString = moment().utcOffset(480).format('YYYY-MM-DD')
  
  for (let dir of ['patient_data', 'summary', 'summary_min']) {
    let files = fs.readdirSync(path.join('.', 'docs', dir))
    let sorted = _.reverse(_.sortBy(_.filter(files, v => { return v.startsWith('2021')})))
    if (sorted.length > 0) {
      let latest = sorted[0]
      let latestPath = path.join('.', 'docs', dir, 'latest.json')

      fs.unlink(latestPath, err => {
        // deliberately ignore err.
        console.log(`Symlink to ${latest} from ${latestPath}`)
        fs.symlinkSync(latest, latestPath)
      })
    }
  }
}

publish()
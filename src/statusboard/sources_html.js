import { normalizeFixedWidthNumbers } from './translation.js'

export const aichiLatestExtract = ($) => {
  let patientNews = $('.detail_free p').first()
  return {
    latest: patientNews.text()
  }
}

export const aichiNagoyaLatestExtract = ($) => {
  let patientNews = $('.mol_attachfileblock ul li').first()
  return {
    latest: patientNews.text()
  }
}

export const aichiOkazakiiLatestExtract = ($) => {
  let patientNews = $('.article').children('p').first()
  return {
    latest: patientNews.text()
  }
}

export const aichiToyohashiLatestExtract = ($) => {
  let patientNews = $('#ContentPane h5').first()
  return {
    latest: patientNews.text().match('([0-9０-９月日]+発表)')[1]
  }
}

export const akitaSummaryExtract = ($) => {
  let cells = $('table.c-table--full td')
  return {
    confirmed: $(cells[4]).text(),
    recovered: $(cells[6]).text()
  }
}


export const chibaSummaryExtract = ($) => {
  let result = {}

  const countPattern = new RegExp('感染者数：([0-9]+)名（患者：([0-9]+)名、無症状病原体保有者：([0-9]+)名、うち([0-9]+)名死亡）', 'gi')
  let countText = $('#tmp_contents ul li:first-child').text()
  if (countText) {
    let counts = [...countText.matchAll(countPattern)]
    if (counts) {
      result['confirmed'] = counts[0][1]
      result['deceased'] = counts[0][4]
    }
  }

  const lastUpdatePattern = new RegExp('令和[0-9]+年([0-9]+)月([0-9]+)日現在', 'gi')
  let lastUpdateText = $('#tmp_contents h2').text()
  console.log(lastUpdateText)
  if (lastUpdateText) {
    let lastUpdate = [...lastUpdateText.matchAll(lastUpdatePattern)]
    if (lastUpdate) {
      result['lastUpdate'] = `2020-${lastUpdate[0][1]}-${lastUpdate[0][2]}`
    }
  }
  return result
}

export const chibaLatestExtract = ($) => {
  let patientNews = $('.datatable tr').filter((i, v) => {
    return $(v).text().match('検査確定日：')
  })
  return {
    latest: patientNews.first().text()
  }
}

export const chigasakiLatestExtract = ($) => {
  const latestText = $('h3').first().text()
  return {
    latest: latestText
  }
}



export const fujisawaLatestExtract = ($) => {
  const latestText = $('h4').first().text()
  return {
    latest: latestText
  }
}


export const fukuiSummaryExtract = ($) => {
  let tables = $('table')
  let summaryTable = $(tables[2])
  let hospitalized = $(tables[3])
  let pageInfo = $('#page-information .date').text()
  let result = {
    deceased:  normalizeFixedWidthNumbers($(summaryTable.find('td')[1]).text()),
    recovered:  normalizeFixedWidthNumbers($(summaryTable.find('td')[10]).text()),
    hospitalized: normalizeFixedWidthNumbers($(hospitalized.find('td')[2]).text()) + 
                  normalizeFixedWidthNumbers($(hospitalized.find('td')[5]).text()),
    lastUpdated: pageInfo
  }
  return result
}


export const fukuokaExtract = ($) => {
  let lastUpdated = $('div.detail_free p').filter((i, v) => { return $(v).text().match('日時点）') }).first()
  let summaryTable = $('table')[1]
  console.log(summaryTable)
  let numberRow = $(summaryTable).find('tr')[1]
  let cells = $(numberRow).find('td')
  return {
    lastUpdated: lastUpdated.text(),
    tested: $(cells[0]).text(),
    confirmed: $(cells[1]).text(),
    deceased: $(cells[3]).text(),
    recovered: $(cells[4]).text()
  }
}

export const fukuokaLatestExtract = ($) => {
  let titles = $('h2').first()
  return {
    latest: titles.text()
  }
}

export const gifuSummaryExtract = ($, url) => {
  const summaryImage = $('img').filter((i, v) => {
    if ($(v).attr('src').match('PCR.jpeg')) {
      return true
    }
  })
  if (summaryImage.length < 1) {
    return {}
  }
  const path = summaryImage.attr('src')
  const host = new URL(url).hostname
  const imageURL = `http://${host}/${path}`
  return {
    image: imageURL
  }
}

export const ibarakiLatestExtract = ($) => {
  let patientNewsDate = $('.tmp_contents h4').first()
  return {
    latest: patientNewsDate.text()
  }
}

export const hiroshimaSummaryExtract = ($) => {
  const datePattern = new RegExp('([0-9]+)月([0-9]+)日現在')
  let summaryTable = $('table')[0]
  let summaryCells = $(summaryTable).find('td')
  let lastUpdated = $('h3').first().text().match(datePattern)[0]
  return {
    lastUpdated: lastUpdated,
    confirmed: $(summaryCells[4]).text(),
    recovered: $(summaryCells[6]).text(),
    deceased: $(summaryCells[7]).text()
  }

}

export const hiroshimaLatestExtract = ($) => {
  let tables = $('table').filter((i, v) => {
    let header = $($(v).prev())
    console.log(header.text())
    if (header.text().match('新型コロナウイルス感染症患者の概要については，以下のとおりです。')) {
      return true
    }
    return false
  })

  if (tables.length < 1) {
    return {}
  }
  let rows = $(tables[0]).find('tr')
  let latestRowCells = $(rows[2]).find('td')
  let latestInfo = $(latestRowCells[1]).text() + ' ' + $(latestRowCells[0]).text() 
  return {
    latest: latestInfo
  }
}



export const hokkaidoSummaryExtract = ($, url) => {
  const summaryHeader = $('.submenu-main h2')[1]
  let nextP = $(summaryHeader).next()
  let nextA = nextP.find('a')

  const path = nextA.attr('href')
  const host = new URL(url).hostname
  const imageURL = `http://${host}/${path}`
  return {
    image: imageURL
  }
}

export const hokkaidoLatestExtract = ($) => {
  let patientNewsDate = $('h3').first()
  return {
    latest: patientNewsDate.text()
  }
}

export const hyogoSummaryExtract = ($) => {
  const table = $('.ex_table')
  const lastUpdated = table.prev().text()
  const rows = table.find('tr')
  const cells = $(rows[3]).find('td')
  console.log(cells)
  return {
    lastUpdated: lastUpdated,
    tested: $(cells[0]).text(),
    confirmed: $(cells[1]).text(),
    deceased: $(cells[5]).text(),
    recovered: $(cells[6]).text(),
  }
}

export const hyogoLatestExtract = ($) => {
  let patientNewsDate = $('h3').first()
  return {
    latest: patientNewsDate.text()
  }
}

export const ibarakiSummaryExtract = ($, url) => {
  const summaryImage = $('img').filter((i, v) => {
    if ($(v).attr('src').match('youseisya')) {
      return true
    }
  })
  if (summaryImage.length < 1) {
    return {}
  }
  const path = summaryImage.attr('src')
  const host = new URL(url).hostname
  const imageURL = `http://${host}/${path}`
  return {
    image: imageURL
  }
}

export const ishikawaSummaryExtract = ($) => {
  const totalRow = $('table tbody tr').last()
  const cells = $(totalRow).find('td')
  return {
    confirmed: $(cells[1]).text(),
    recovered: $(cells[2]).text(),
    deceased: $(cells[3]).text()
  }
}

export const kagawaSummaryExtract = ($, url) => {
  const summaryImage = $('img').filter((i, v) => {
    console.log($(v).attr('alt'))
    if ($(v).attr('alt').match('患者の状況')) {
      return true
    }
    return false
  })

  console.log(summaryImage)

  const path = summaryImage.attr('src')
  const host = new URL(url).hostname
  const imageURL = `http://${host}/${path}`
  return {
    image: imageURL
  }
}

export const kanagawaLatestExtract = ($) => {
  let patientNews = $('h3').filter((i, v) => { return $(v).text().match('患者の概要')})
  let latestText = patientNews.first().text()
  if (latestText) {
    let date = patientNews.first().next('p').text().split('、')[0]
    latestText = date + ' ' + latestText
  }
  return {
    latest: latestText
  }
}

export const kawasakiLatestExtract = ($) => {
  const latestText = $('h2').first().text()
  return {
    latest: latestText
  }
}

export const kyotoLatestExtract = ($) => {
  let latestTableRow = $('table.datatable')[1]
  let cells = $(latestTableRow).find('td')
  let latestInfo = $(cells[1]).text() + ' ' + $(cells[0]).text() 
  return {
    latest: latestInfo
  }
}

export const kyotoCityLatestExtract = ($) => {
  let patientNews = $('.mol_contents h3')[1]
  return {
    latest: $(patientNews).text()
  }
}

export const osakaLatestExtract = ($) => {
  let patientNews = $('.box_list tr').filter((i, v) => {
    return $(v).text().match('新型コロナウイルス感染症患者の発生')
  })
  return {
    latest: patientNews.first().text()
  }
}

export const saitamaExtract = ($) => {
  const confirmedPattern = new RegExp('県内の陽性確認者数：([0-9]+)人')
  const recoveredPattern = new RegExp('退院・療養終了：([0-9]+)人')
  const deceasedPattern = new RegExp('死亡：([0-9]+)人')

  
  let totalConfirmed = 0
  let totalRecovered = 0
  let totalDeceased = 0
  $('.outline_type1 p').each((i, v) => {
    let confirmedResult = $(v).text().match(confirmedPattern)
    if (confirmedResult) { totalConfirmed = confirmedResult[1] }

    let recoveredResult = $(v).text().match(recoveredPattern)
    if (recoveredResult) { totalRecovered = recoveredResult[1] }

    let deceasedResult = $(v).text().match(deceasedPattern)
    if (deceasedResult) { totalDeceased = deceasedResult[1] }
  })

  return {
    confirmed: totalConfirmed,
    recovered: totalRecovered,
    deceased: totalDeceased,
    lastUpdated: $('tmp_update').text()
  }
}

export const saitamaLatestExtract = ($) => {
  let patientNews = $('.box_news li').filter((i, v) => {
    return $(v).text().match('発生について')
  })
  console.log(patientNews.first())
  return {
    latest: patientNews.first().text()
  }
}

export const sagamiharaLatestExtract = ($) => {
  const latestText = $('h2').first().text()
  return {
    latest: latestText
  }
}

export const yokohamaLatestExtract = ($) => {
  const header = $('.contents-area .wysiwyg_wp').first().text()
  const datePattern = new RegExp('[0-9]+月[0-9]+日[0-9]+時')
  return {
    latest: header.match(datePattern)[0]
  }
}

export const yokohamaSummaryExtract = ($) => {
  const tableCells = $('table.table01 td')
  return {
    lastUpdated: $('h2').first().text(),
    confirmed: $(tableCells[0]).text(),
    deceased: $(tableCells[6]).text(),
    recovered: $(tableCells[7]).text()
  }
}

export const yokosukaLatestExtract = ($) => {
  let cells = $('.datatable td')
  let updateString = $(cells[1]).text() + ' #' +  $(cells[0]).text()

  return {
    latest:updateString
  }
}
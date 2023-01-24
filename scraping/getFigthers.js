import { logSuccess } from './lib/log.js'
import { readDBFile } from './lib/db.js'
import { REQUEST_DELAY } from '../octogon-api.config.js'
import scrapeFighterInfo from './lib/scrapeFighterInfo.js'
import timeFormatter from './lib/timeFormatter.js'

const sleep = (miliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, miliseconds))
}

async function getFigthers() {
  const start = performance.now()
  const ranking_data = await readDBFile('rankings')

  for (const { fighters } of ranking_data) {
    for (const { id } of fighters) {
      await scrapeFighterInfo(id)
      console.log(`Waiting ${timeFormatter(REQUEST_DELAY)}\n`)
      await sleep(REQUEST_DELAY)
    }
  }

  const end = performance.now()
  const time = timeFormatter(end - start)
  logSuccess(`Task finished in ${time}`)
}

export default getFigthers

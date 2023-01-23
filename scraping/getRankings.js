import { cleanString, standarizeString } from './lib/string_modifiers.js'
import { logSuccess } from './lib/log.js'
import { writeDBFile } from './lib/db.js'
import scrape from './lib/scrape.js'

// http://www.ufcstats.com/statistics/fighters?char=a

const BASE_URL = 'https://www.ufc.com'
const RANKINGS_URL = 'https://www.ufc.com/rankings'
const RANKINGS_DB_NAME = 'rankings'

const SELECTORS = {
  table: '.views-table',
  category: '.rankings--athlete--champion h4',
  champion: '.rankings--athlete--champion .views-row a',
  fighterRows: '.views-row',
}
const getSlugFromUrl = (url) => {
  return url.split('/').at(-1)
}

async function getRankings() {
  const $ = await scrape(RANKINGS_URL)
  const $tables = $.querySelectorAll(SELECTORS.table)

  // Recorremos el nodeElement tables (que son todos los que coinciden con nuestra búsqueda)
  const data = $tables.map(($el) => {
    const categoryName = $el.querySelector(SELECTORS.category).textContent
    const categoryId = standarizeString(categoryName)
    const championNode = $el.querySelector(SELECTORS.champion)
      ? $el.querySelector(SELECTORS.champion)
      : ''
    const championName = championNode ? championNode.textContent : ''
    const championId = championNode ? getSlugFromUrl(championNode.getAttribute('href')) : ''

    const rankedsNodeElements = $el.querySelectorAll(SELECTORS.fighterRows)
    const fighters = rankedsNodeElements.map(($element) => {
      const relativeFighterUrl = $element.querySelector('a').getAttribute('href')
      const id = getSlugFromUrl(relativeFighterUrl)
      const url = BASE_URL + relativeFighterUrl
      const name = cleanString($element.textContent)
      return { id, name, url }
    })

    const champion = { id: championId, championName }

    return { id: categoryId, categoryName, champion, fighters }
  })

  await writeDBFile(RANKINGS_DB_NAME, data)
  logSuccess(`Rankings saved in ${RANKINGS_DB_NAME}.json`)
}

export default getRankings

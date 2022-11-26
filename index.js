import puppeteer from 'puppeteer'
import getPage from './modules/getPage'
import scrapeLinksFromPage from './modules/scrapeLinksFromPage'
import saveDataToFile from './modules/saveDataToFile'
import getLessonText from './modules/getLessonText'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { generateLessonFileNameFromLink } from './m odules/helperFunctions'

async function main() {
  const linksFileName = 'links.json'
  const homePageLink = 'https://typingtestnow.com/app/practice_lessons.html'
  const directoryName = 'lessons'

  const browser = await puppeteer.launch()
  let links
  if (!existsSync(linksFileName)) {
    console.log('Getting all links from', homePageLink)

    const containerSelector = 'body .row .col-md-7'
    const linksSelector = '.col-md-7 p a'
    const filterLinksBy = 'keyboarding_online'

    const page = await getPage(browser, homePageLink)
    await page.waitForSelector(containerSelector)
    links = await scrapeLinksFromPage(page, linksSelector, filterLinksBy)
    await saveDataToFile(JSON.stringify(links), linksFileName)
    page.close()
  } else {
    console.log('GETTING all links from', linksFileName)
    links = JSON.parse(readFileSync(linksFileName, 'utf8'))
  }

  if (!existsSync(directoryName)) mkdirSync(directoryName)

  for (const { href } of links) {
    let lessonFileName = generateLessonFileNameFromLink(href)

    console.log(`GETTING ${lessonFileName}`)
    const lessonText = await getLessonText(browser, href)
    console.log(`SAVING ${lessonFileName}`)
    await saveDataToFile(lessonText, `${directoryName}/${lessonFileName}`)
    console.log('')
  }

  browser.close()
}

;(async () => {
  await main()
})()

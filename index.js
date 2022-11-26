import puppeteer from 'puppeteer'
import { open } from 'node:fs/promises'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
;(async function () {
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
})()
async function getPage(browser, link) {
  const page = await browser.newPage()
  await page.goto(link)
  return page
}
async function scrapeLinksFromPage(page, selector, filterBy) {
  const links = await page.evaluate((selector) => {
    return [...document.querySelectorAll(selector)].map((el) => {
      return {
        href: el.getAttribute('href'),
      }
    })
  }, selector)
  return links.filter(({ href }) => href.includes(filterBy))
}
async function saveDataToFile(data, fileName) {
  let linksFile
  try {
    linksFile = await open(fileName, 'w')
    await linksFile.write(data)
  } finally {
    linksFile?.close()
  }
}
function generateLessonFileNameFromLink(link) {
  return 'lesson-' + link.split('/').slice(-1)[0].slice(0, -5) + '.txt'
}
async function getLessonText(browser, href) {
  const page = await getPage(browser, href)

  const containerSelector = '.speed-test-container .sample-text span'
  const lessonSelector = '.sample-text'

  await page.waitForSelector(containerSelector)
  const lessonText = await page.evaluate((selector) => {
    return [...document.querySelectorAll(`${selector} > span`)]
      .map((item) => item.textContent)
      .join('')
  }, lessonSelector)

  page.close()
  return lessonText
}

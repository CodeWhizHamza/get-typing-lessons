export default async function getLessonText(browser, href) {
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

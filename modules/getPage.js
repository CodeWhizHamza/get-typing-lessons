export default async function getPage(browser, link) {
  const page = await browser.newPage()
  await page.goto(link)
  return page
}

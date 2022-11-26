export default async function scrapeLinksFromPage(page, selector, filterBy) {
  const links = await page.evaluate((selector) => {
    return [...document.querySelectorAll(selector)].map((el) => {
      return {
        href: el.getAttribute('href'),
      }
    })
  }, selector)
  return links.filter(({ href }) => href.includes(filterBy))
}

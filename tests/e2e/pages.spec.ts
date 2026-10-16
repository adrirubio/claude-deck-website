import { expect, test } from '@playwright/test'

const PAGES = [['/', 'Home'], ['/how-it-works/', 'How it works'], ['/quick-tour/', 'Quick tour'], ['/technical-information/', 'Technical information']] as const

for (const [path, name] of PAGES) {
  test(`${name}: loads with no failed or foreign request, marks itself in the navigation, and fits a phone`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const bad: string[] = []
    page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4321')) bad.push(r.url()) })
    page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`) })
    await page.goto(path); await page.waitForTimeout(600)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveCount(4)
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    expect(bad).toEqual([])
  })
}

test('the home hero plays the outside scene on its own, and the main button leads to the quick tour', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero [data-scene="outside"]')).toHaveAttribute('data-play', 'auto')
  await expect(page.locator('.hero [data-scene="outside"]')).toHaveAttribute('data-state', 'animated')
  await page.getByRole('link', { name: 'Take the quick tour' }).first().click()
  await expect(page).toHaveURL(/\/quick-tour\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quick tour')
})

test('every screenshot opens at full size, and carries alt text and a caption', async ({ page }) => {
  for (const path of ['/how-it-works/', '/quick-tour/']) {
    await page.goto(path)
    const shots = page.locator('figure.shot')
    expect(await shots.count()).toBeGreaterThan(0)
    for (const s of await shots.all()) {
      await expect(s.locator('img')).toHaveAttribute('alt', /example/i)
      await expect(s.locator('figcaption')).toContainText('example data')
      const href = await s.locator('a').getAttribute('href')
      expect((await page.request.get(href!)).status()).toBe(200)
    }
  }
})

test('every link to the docs opens a page', async ({ page }) => {
  await page.goto('/technical-information/')
  const hrefs = [...new Set(await page.locator('main a[href^="/docs"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!)))]
  expect(hrefs.length).toBeGreaterThanOrEqual(6)
  for (const h of hrefs) {
    // The test server serves files; Cloudflare Pages serves /a/b from a/b.html.
    const url = h.endsWith('/') ? h : `${h}.html`
    expect((await page.request.get(url)).status(), h).toBe(200)
  }
})

for (const [path, name] of PAGES) {
  test(`${name}: nothing shifts while the page loads, even when the fonts arrive late`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.route(/\.woff2$/, async (r) => { await new Promise((ok) => setTimeout(ok, 400)); await r.continue() })
    await page.addInitScript(() => {
      (window as any).__cls = 0
      new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(path); await page.waitForTimeout(2500)
    expect(await page.evaluate(() => (window as any).__cls)).toBeLessThan(0.02)
  })
}

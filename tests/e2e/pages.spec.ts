import { expect, test } from '@playwright/test'

const PAGES = [['/', 'Home'], ['/how-it-works/', 'How it works'], ['/technical-information/', 'Technical information']] as const

for (const [path, name] of PAGES) {
  test(`${name}: loads with no failed or foreign request, marks itself in the navigation, and fits a phone`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const bad: string[] = []
    page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4321')) bad.push(r.url()) })
    page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`) })
    await page.goto(path); await page.waitForTimeout(600)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveCount(3)
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    expect(bad).toEqual([])
  })
}

test('the home page: the slogan, the outside scene playing on its own, and the main button leads to How it works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Scale product velocity with self-directing AI teams.')
  await expect(page.locator('.hero-plate [data-scene="outside"]')).toHaveAttribute('data-state', 'animated')
  // The inside of the factory is shown on How it works only.
  await expect(page.locator('[data-scene="inside"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'See how it works' }).first().click()
  await expect(page).toHaveURL(/\/how-it-works\/$/)
  await expect(page.locator('[data-scene="inside"]')).toHaveCount(1)
})

test('every screenshot opens at full size, and carries alt text and a caption', async ({ page }) => {
  for (const path of ['/how-it-works/']) {
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

for (const [path, name] of PAGES) {
  test(`${name}: headings never skip a level`, async ({ page }) => {
    await page.goto(path)
    const levels = await page.locator('main :is(h1,h2,h3,h4)').evaluateAll((hs) => hs.map((h) => +h.tagName[1]))
    expect(levels[0]).toBe(1)
    levels.slice(1).forEach((l, i) => expect(l - levels[i], `heading ${i + 2}`).toBeLessThanOrEqual(1))
  })
}

test('How it works shows each screenshot no more than twice', async ({ page }) => {
  await page.goto('/how-it-works/')
  const srcs = await page.locator('figure.shot img').evaluateAll((is) => is.map((i) => (i as HTMLImageElement).currentSrc.split('/').pop()!.split('.')[0]))
  const counts = srcs.reduce((m, s) => m.set(s, (m.get(s) ?? 0) + 1), new Map<string, number>())
  expect(Math.max(...counts.values())).toBeLessThanOrEqual(2)
})

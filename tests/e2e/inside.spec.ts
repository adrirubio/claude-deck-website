import { expect, test, type Page } from '@playwright/test'
const S = '[data-scene="inside"]'
const steps = ['Plan', 'Approve', 'Build', 'Review', 'Check', 'Merged']
const roles = ['agent owner', 'AI Leader', 'agent owner', 'AI reviewer', 'AI Leader and Supervisor', 'back to GitHub']
const captions = ['Each ready feature gets its own lane', 'Several features move through the AI team at once', 'Merged work goes back to GitHub']

// The scene loads when it comes into view, as it does for a reader scrolling down; then jump within it.
async function enterScene(page: Page) { await page.goto('/scenes/'); await page.waitForTimeout(800); await scrollScene(page, 0) }
async function scrollScene(page: Page, f: number) {
  // Measure the pin's placeholder when there is one: the pinned scene itself moves down once its story ends.
  const top = await page.evaluate((s) => { const el = document.querySelector(s)!, pin = el.parentElement!; return (pin.classList.contains('pin-spacer') ? pin : el).getBoundingClientRect().top + scrollY }, S)
  await page.evaluate(([t, f]: number[]) => scrollTo(0, t + innerHeight * 1.5 * f), [top, f]); await page.waitForTimeout(1200)
}
const itemXs = (page: Page) => page.$$eval(`${S} .lane-item`, (els) => els.map((e) => Math.round(e.getBoundingClientRect().x)))

test('the gallery shows the inside scene with every step, role and caption', async ({ page }) => {
  await page.goto('/scenes/')
  const svg = page.locator(`${S} svg`)
  await expect(svg).toBeAttached()
  for (const [i, s] of steps.entries()) await expect(svg.getByText(`${i + 1}  ${s}`, { exact: true })).toBeAttached()
  for (const r of new Set(roles)) await expect(svg.getByText(r, { exact: true }).first()).toBeAttached()
  for (const c of captions) await expect(svg.getByText(c)).toBeAttached()
})

test('each lane has its own feature colour, and its agent owners wear that cap', async ({ page }) => {
  await page.goto('/scenes/')
  for (const f of [0, 1, 2]) {
    await expect(page.locator(`${S} .lane-${f} .owner [data-role="agent"][data-feature="${f}"]`)).toHaveCount(2)
    await expect(page.locator(`${S} .lane-${f} .lane-item[data-feature="${f}"]`)).toHaveCount(1)
  }
  await expect(page.locator(`${S} [data-role="supervisor"]`)).toHaveCount(3)
})

test('the still frame shows the three features at different stations, in parallel', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto('/scenes/')
  await expect(page.locator(S)).toHaveAttribute('data-state', 'still')
  const xs = await itemXs(page)
  expect(new Set(xs).size).toBe(3)
  for (const c of captions) await expect(page.locator(`${S} svg`).getByText(c)).toBeVisible()
})

test('once the lanes run, features move from station to station on their own', async ({ page }) => {
  await enterScene(page)
  await expect(page.locator(S)).toHaveAttribute('data-state', 'animated')
  await scrollScene(page, 1.05)
  const a = await itemXs(page)
  await page.waitForTimeout(1500)
  expect(await itemXs(page)).not.toEqual(a)
  await page.waitForTimeout(3000)
  const lit = await page.$$eval(`${S} .station-ring`, (els) => els.filter((e) => +getComputedStyle(e).opacity > 0.05).length)
  expect(lit).toBeGreaterThan(0)
})

test('scrolling back before the lanes run hides the features again', async ({ page }) => {
  await enterScene(page)
  await scrollScene(page, 1.05); await page.waitForTimeout(1500)
  expect(Math.max(...await page.$$eval(`${S} .lane-item`, (els) => els.map((e) => +getComputedStyle(e).opacity)))).toBeGreaterThan(0)
  await scrollScene(page, 0.3)
  const op = await page.$$eval(`${S} .lane-item`, (els) => els.map((e) => +getComputedStyle(e).opacity))
  expect(Math.max(...op)).toBe(0)
})

test('without JavaScript the inside drawing sits inside its frame', async ({ browser }) => {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 900 } })
    await page.goto('/scenes/')
    const fit = await page.locator(`${S} svg`).evaluate((s: SVGSVGElement) => {
      const b = s.getBBox(), v = s.viewBox.baseVal
      return { left: b.x - v.x, top: b.y - v.y, right: v.x + v.width - (b.x + b.width), bottom: v.y + v.height - (b.y + b.height) }
    })
    for (const [side, gap] of Object.entries(fit)) expect(gap, `${width}px ${side}`).toBeGreaterThanOrEqual(0)
    await page.close()
  }
})

test('on a phone the steps are a readable numbered list, with no overflow', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('/scenes/')
  const list = page.locator(`${S} ol.scene-labels`)
  await expect(list).toBeVisible()
  await expect(list.locator('li')).toHaveCount(6)
  for (const s of steps) await expect(list.getByText(s, { exact: false }).first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

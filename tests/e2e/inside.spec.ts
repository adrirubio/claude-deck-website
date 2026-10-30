import { expect, test, type Page } from '@playwright/test'
const S = '[data-scene="inside"]'
const steps = ['Plan', 'Approve', 'Build', 'Review', 'Check', 'Merged']
const roles = ['agent owner', 'AI Leader', 'agent owner', 'AI reviewer', 'AI Leader, with your supervision', 'back to GitHub']
const captions = ['Inside the factory: your AI teams at work', 'Each feature gets its own team', 'Teams work at their own pace, on different features or projects', 'Deck runs every team', 'Merged work goes back to GitHub']

// The scene plays on its own once it comes into view: bring it into view, as a reader scrolling down would.
async function showScene(page: Page) { await page.goto('/scenes/'); await page.waitForTimeout(500); await page.locator(S).scrollIntoViewIfNeeded(); await page.waitForTimeout(300) }
const deckLines = (page: Page) => page.$$eval(`${S} .run-link line`, (ls) => ls.map((l) => Math.hypot(+l.getAttribute('x2')! - +l.getAttribute('x1')!, +l.getAttribute('y2')! - +l.getAttribute('y1')!)))
const itemXs = (page: Page) => page.$$eval(`${S} .team-item`, (els) => els.map((e) => Math.round(e.getBoundingClientRect().x)))

test('the gallery shows the inside scene with every step, role and caption', async ({ page }) => {
  await page.goto('/scenes/')
  const svg = page.locator(`${S} svg`)
  await expect(svg).toBeAttached()
  for (const [i, s] of steps.entries()) await expect(svg.getByText(`${i + 1}  ${s}`, { exact: true })).toBeAttached()
  for (const r of new Set(roles)) await expect(svg.getByText(r, { exact: true }).first()).toBeAttached()
  for (const c of captions) await expect(svg.getByText(c)).toBeAttached()
})

test('each team has its own feature colour, and its agent owners wear that cap', async ({ page }) => {
  await page.goto('/scenes/')
  for (const f of [0, 1, 2]) {
    await expect(page.locator(`${S} .team-${f} .owner [data-role="agent"][data-feature="${f}"]`)).toHaveCount(2)
    await expect(page.locator(`${S} .team-${f} .team-item[data-feature="${f}"]`)).toHaveCount(1)
  }
  // Supervision is yours, from outside the factory: no Supervisor stands at the stations.
  await expect(page.locator(`${S} [data-role="supervisor"]`)).toHaveCount(0)
})

test('the still frame shows the three features at different stations, in parallel', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto('/scenes/')
  await expect(page.locator(S)).toHaveAttribute('data-state', 'still')
  const xs = await itemXs(page)
  expect(new Set(xs).size).toBe(3)
  for (const c of captions) await expect(page.locator(`${S} svg`).getByText(c)).toBeVisible()
})

test('once the story has played, features move from station to station on their own', async ({ page }) => {
  await showScene(page)
  await expect(page.locator(S)).toHaveAttribute('data-state', 'animated')
  await page.waitForTimeout(9000)
  const a = await itemXs(page)
  await page.waitForTimeout(1500)
  expect(await itemXs(page)).not.toEqual(a)
  await page.waitForTimeout(3000)
  const lit = await page.$$eval(`${S} .station-ring`, (els) => els.filter((e) => +getComputedStyle(e).opacity > 0.05).length)
  expect(lit).toBeGreaterThan(0)
})

test('the scene waits for you, then plays from the start on its own, without pinning the page', async ({ page }) => {
  await page.goto('/scenes/'); await page.waitForTimeout(3000)
  await page.locator(S).scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  await expect(page.locator(`${S} .run-link line`)).toHaveCount(3)
  expect(Math.max(...await deckLines(page))).toBeLessThan(1)
  const y = await page.evaluate(() => scrollY)
  await page.waitForTimeout(9000)
  expect(Math.min(...await deckLines(page))).toBeGreaterThan(10)
  expect(await page.evaluate(() => scrollY)).toBe(y)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
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

test('the scene never says "lane": Deck uses the word for something else', async ({ page }) => {
  await page.goto('/scenes/')
  const words = await page.locator(S).evaluate((el) => el.textContent + ' ' + el.querySelector('svg')!.getAttribute('aria-label'))
  expect(words).not.toMatch(/\blanes?\b/i)
})

test('a feature sent back moves backwards along its belt', async ({ page }) => {
  await showScene(page)
  await page.waitForTimeout(6000)
  // The violet team's plan goes back from Approve to Plan early in its trip.
  const item = page.locator(`${S} .team-1 .team-item`)
  let last = -Infinity, back = false
  for (let i = 0; i < 90 && !back; i++) {
    const [x, op] = await item.evaluate((e) => [e.getBoundingClientRect().x, +getComputedStyle(e).opacity])
    if (op > 0.9 && x < last - 2) back = true
    last = op > 0.9 ? x : -Infinity
    await page.waitForTimeout(100)
  }
  expect(back).toBe(true)
})

test('the factory is a building, and Deck stands inside it with a line to every team', async ({ page }) => {
  await page.goto('/scenes/')
  await expect(page.locator(`${S} .factory-wall`).first()).toBeAttached()
  await expect(page.locator(`${S} .deck`)).toHaveCount(1)
  await expect(page.locator(`${S} .deck .team-bar`)).toHaveCount(3)
  await expect(page.locator(`${S} .run-link line`)).toHaveCount(3)
  await expect(page.locator(`${S} .front-wall`)).toHaveCount(1)
  expect(await page.locator(`${S} svg`).getAttribute('aria-label')).toContain('Deck, inside the factory, runs every team')
})


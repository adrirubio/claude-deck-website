import { expect, test, type Page } from '@playwright/test'
const labels = ['GitHub holds your feature lists', 'You, the Director, and your AI helper groom the features',
  'In Deck, you choose your AI team roster', 'Deck runs your AI teams', 'The factory: Deck, the Supervisor and your AI teams',
  'Ready features flow in', 'Finished work flows back']

test('the gallery shows the outside scene with every label and no foreign request', async ({ page }) => {
  const foreign: string[] = []
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4321')) foreign.push(r.url()) })
  await page.goto('/scenes/')
  const scene = page.locator('[data-scene="outside"] svg')
  await scene.scrollIntoViewIfNeeded()
  for (const l of labels) await expect(scene.getByText(l)).toBeAttached()
  expect(foreign).toEqual([])
})

test('reduced motion shows the final state with no timeline', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto('/scenes/')
  const scene = page.locator('[data-scene="outside"]')
  await expect(scene).toHaveAttribute('data-state', 'still')
  for (const l of labels) await expect(scene.locator('svg').getByText(l)).toBeVisible()
})

test('no overflow at 390 px', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('/scenes/')
  await expect(page.locator('[data-scene="outside"] svg')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('the scene is not linked from the home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a[href^="/scenes"]')).toHaveCount(0)
})

const linkSel = ['groom-link', 'roster-link', 'run-link', 'b5-link', 'b6-link'].map((c) => `[data-scene="outside"] .${c} line`).join(', ')
const lengths = (page: Page) => page.$$eval(linkSel, (ls) => ls.map((l) => Math.hypot(Number(l.getAttribute('x2')) - Number(l.getAttribute('x1')), Number(l.getAttribute('y2')) - Number(l.getAttribute('y1')))))
async function scrollScene(page: Page, f: number) {
  // Measure the pin's placeholder when there is one: the pinned scene itself moves down once its story ends.
  const top = await page.evaluate(() => { const el = document.querySelector('[data-scene="outside"]')!, pin = el.parentElement!; return (pin.classList.contains('pin-spacer') ? pin : el).getBoundingClientRect().top + scrollY })
  await page.evaluate(([t, f]: number[]) => scrollTo(0, t + innerHeight * 1.5 * f), [top, f]); await page.waitForTimeout(1200)
}

test('the dashed links draw in during their beats', async ({ page }) => {
  await page.goto('/scenes/'); await page.waitForTimeout(800)
  await scrollScene(page, 0)
  expect(Math.max(...await lengths(page))).toBeLessThan(1)
  await scrollScene(page, 1.05)
  expect(Math.min(...await lengths(page))).toBeGreaterThan(10)
})

test('at the end of the story the flows keep moving', async ({ page }) => {
  await page.goto('/scenes/'); await page.waitForTimeout(800)
  await scrollScene(page, 1.05); await page.waitForTimeout(2500)
  const op = await page.$$eval('[data-scene="outside"] .b5-item, [data-scene="outside"] .b6-item', (els) => els.map((e) => +getComputedStyle(e).opacity))
  expect(Math.max(...op)).toBeGreaterThan(0)
})

test('flow items hide again when you scroll back', async ({ page }) => {
  await page.goto('/scenes/'); await page.waitForTimeout(800)
  await scrollScene(page, 1.05); await page.waitForTimeout(1500)
  expect(Math.max(...await page.$$eval('[data-scene="outside"] .b5-item, [data-scene="outside"] .b6-item', (els) => els.map((e) => +getComputedStyle(e).opacity)))).toBeGreaterThan(0)
  await scrollScene(page, 0.2)
  // The scrub eases the story back, so wait for it to pass the flows' start rather than for a fixed time.
  await expect.poll(async () => Math.max(...await page.$$eval('[data-scene="outside"] .b5-item, [data-scene="outside"] .b6-item', (els) => els.map((e) => +getComputedStyle(e).opacity))), { timeout: 5000 }).toBe(0)
})

test('without JavaScript the whole drawing sits inside its frame', async ({ browser }) => {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 900 } })
    await page.goto('/scenes/')
    const fit = await page.locator('[data-scene="outside"] svg').evaluate((s: SVGSVGElement) => {
      const b = s.getBBox(), v = s.viewBox.baseVal
      return { left: b.x - v.x, top: b.y - v.y, right: v.x + v.width - (b.x + b.width), bottom: v.y + v.height - (b.y + b.height) }
    })
    for (const [side, gap] of Object.entries(fit)) expect(gap, `${width}px ${side}`).toBeGreaterThanOrEqual(0)
    await page.close()
  }
})

test('the frame does not change once the page has loaded (no layout shift)', async ({ page }) => {
  await page.goto('/scenes/')
  const before = await page.locator('[data-scene="outside"] svg').getAttribute('viewBox')
  await page.waitForTimeout(1500)
  expect(await page.locator('[data-scene="outside"] svg').getAttribute('viewBox')).toBe(before)
})

test('on a phone the labels are a readable list', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('/scenes/')
  const list = page.locator('[data-scene="outside"] .scene-labels')
  await expect(list).toBeVisible()
  for (const l of labels) await expect(list.getByText(l)).toBeVisible()
  const size = await list.locator('li').first().evaluate((li) => parseFloat(getComputedStyle(li).fontSize))
  expect(size).toBeGreaterThanOrEqual(15)
})

test('you and your AI helper stand in the left corner, and the roster is chosen on Deck', async ({ page }) => {
  await page.goto('/scenes/')
  const box = async (sel: string) => (await page.locator(`[data-scene="outside"] ${sel}`).first().boundingBox())!
  const you = await box('[data-role="person"]'), github = await box('.github'), deck = await box('.deck')
  expect(you.x).toBeLessThan(github.x)
  expect(you.x).toBeLessThan(deck.x)
  const helper = await box('.helper [data-role="agent"]')
  expect(Math.abs(helper.x - you.x)).toBeLessThan(120)
  await expect(page.locator('[data-scene="outside"] .roster [data-role="agent"]')).toHaveCount(3)
  await expect(page.locator('[data-scene="outside"] .groom-link line')).toHaveCount(2)
})

test('the factory holds Deck, the Supervisor and the AI teams; you, your helper and GitHub stay outside', async ({ page }) => {
  await page.goto('/scenes/')
  const box = async (sel: string) => (await page.locator(`[data-scene="outside"] ${sel}`).first().boundingBox())!
  const inside = (b: { x: number; y: number; width: number; height: number }, f: { x: number; y: number; width: number; height: number }) =>
    b.x >= f.x && b.x + b.width <= f.x + f.width && b.y >= f.y && b.y + b.height <= f.y + f.height
  const floor = await box('.b4-floor')
  expect(inside(await box('.deck'), floor)).toBe(true)
  await expect(page.locator('[data-scene="outside"] [data-role="supervisor"]')).toHaveCount(1)
  expect(inside(await box('[data-role="supervisor"]'), floor)).toBe(true)
  for (const sel of ['[data-role="person"]', '.helper', '.github']) expect(inside(await box(sel), floor), sel).toBe(false)
  await expect(page.locator('[data-scene="outside"] svg').getByText('The factory: Deck, the Supervisor and your AI teams')).toBeAttached()
})

test.describe('the hero version plays on its own', () => {
  const hero = '[data-scene="outside"][data-play="auto"]'
  const heroLinks = (page: Page, cls: string) => page.$$eval(`${hero} .${cls} line`, (ls) => ls.map((l) => Math.hypot(Number(l.getAttribute('x2')) - Number(l.getAttribute('x1')), Number(l.getAttribute('y2')) - Number(l.getAttribute('y1')))))

  test('the story builds without scrolling, then the flows keep moving', async ({ page }) => {
    await page.goto('/scenes/hero/')
    await expect(page.locator(hero)).toHaveAttribute('data-state', 'animated')
    await page.waitForTimeout(1000)
    expect(Math.max(...await heroLinks(page, 'run-link'))).toBeLessThan(1)
    await page.waitForTimeout(9000)
    for (const cls of ['groom-link', 'roster-link', 'run-link', 'b5-link', 'b6-link']) expect(Math.min(...await heroLinks(page, cls))).toBeGreaterThan(10)
    expect(await page.evaluate(() => scrollY)).toBe(0)
    const op = await page.$$eval(`${hero} .b5-item, ${hero} .b6-item`, (els) => els.map((e) => +getComputedStyle(e).opacity))
    expect(Math.max(...op)).toBeGreaterThan(0)
  })

  test('it does not pin the page', async ({ page }) => {
    await page.goto('/scenes/hero/'); await page.waitForTimeout(800)
    await expect(page.locator(hero)).toBeVisible()
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
  })

  test('reduced motion shows the final state', async ({ browser }) => {
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    await page.goto('/scenes/hero/')
    await expect(page.locator(hero)).toHaveAttribute('data-state', 'still')
    for (const l of labels) await expect(page.locator(`${hero} svg`).getByText(l)).toBeVisible()
  })
})

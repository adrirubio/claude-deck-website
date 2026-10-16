import { expect, test } from '@playwright/test'
import { lineLengths, opacities } from './helpers'
const S = '[data-scene="factory"]'
const labels = [
  ['The factory', 'everything you start, stop, upgrade or repair'],
  ['Supervisor', 'checks in on the team'],
  ['Deck', 'runs the team and keeps it within its rules'],
  ['Your AI team', 'works through your features'],
  ['You and your AI helper', 'you own the features and the decisions, outside the factory'],
  ['GitHub', 'holds the features and the finished work, outside the factory'],
]
const flows = ['Ready features come in', 'Finished work goes back']

test('the gallery shows the factory figure with every part and what it is', async ({ page }) => {
  await page.goto('/scenes/')
  const svg = page.locator(`${S} svg`)
  await expect(svg).toBeAttached()
  for (const [title, sub] of labels) {
    await expect(svg.getByText(title, { exact: true })).toBeAttached()
    await expect(svg.getByText(sub, { exact: true })).toBeAttached()
  }
  for (const f of flows) await expect(svg.getByText(f, { exact: true })).toBeAttached()
})

test('the parts: a boundary, the Supervisor, Deck and an AI team inside; you, your helper and GitHub outside', async ({ page }) => {
  await page.goto('/scenes/')
  await expect(page.locator(`${S} .boundary line`)).toHaveCount(4)
  await expect(page.locator(`${S} [data-role="supervisor"]`)).toHaveCount(1)
  await expect(page.locator(`${S} .deck`)).toHaveCount(1)
  await expect(page.locator(`${S} .team [data-role="agent"]`)).toHaveCount(4)
  await expect(page.locator(`${S} [data-role="person"]`)).toHaveCount(1)
  await expect(page.locator(`${S} .helper [data-role="agent"]`)).toHaveCount(1)
  await expect(page.locator(`${S} .github`)).toHaveCount(1)
})

test('it builds on its own from the start once you reach it, without pinning the page', async ({ page }) => {
  await page.goto('/scenes/'); await page.waitForTimeout(2000)
  await page.locator(S).scrollIntoViewIfNeeded()
  await expect(page.locator(S)).toHaveAttribute('data-state', 'animated')
  // Moments after you reach it, the boundary has not drawn yet: the build starts when you arrive.
  await page.waitForTimeout(300)
  await expect(page.locator(`${S} .boundary line`)).toHaveCount(4)
  expect(Math.max(...await lineLengths(page, `${S} .boundary line`))).toBeLessThan(1)
  await page.waitForTimeout(6500)
  expect(Math.min(...await lineLengths(page, `${S} .boundary line`))).toBeGreaterThan(10)
  expect(await page.locator(S).evaluate((el) => el.parentElement!.classList.contains('pin-spacer'))).toBe(false)
})

test('once built, the work flows and the Supervisor checks in', async ({ page }) => {
  await page.goto('/scenes/')
  await page.locator(S).scrollIntoViewIfNeeded()
  await page.waitForTimeout(6500)
  const item = page.locator(`${S} .team-item`)
  const a = await item.evaluate((e) => e.getBoundingClientRect().x)
  const pulse: number[] = []
  for (let i = 0; i < 12; i++) { pulse.push((await opacities(page, `${S} .check-in`))[0]); await page.waitForTimeout(150) }
  expect(await item.evaluate((e) => e.getBoundingClientRect().x)).not.toBe(a)
  expect(Math.max(...pulse) - Math.min(...pulse)).toBeGreaterThan(0.2)
})

test('the still frame shows a feature on each flow', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto('/scenes/')
  await expect(page.locator(S)).toHaveAttribute('data-state', 'still')
  for (const sel of ['.in-item', '.out-item', '.team-item']) {
    await expect(page.locator(`${S} ${sel}`)).toHaveCount(1)
    expect((await opacities(page, `${S} ${sel}`))[0]).toBe(1)
  }
})

test('without JavaScript the factory drawing sits inside its frame', async ({ browser }) => {
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

test('on a phone the parts are a readable list, with no overflow', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('/scenes/')
  const list = page.locator(`${S} ol.scene-labels`)
  await expect(list).toBeVisible()
  await expect(list.locator('li')).toHaveCount(labels.length + flows.length)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('the figure says neither "lane" nor "backlog"', async ({ page }) => {
  await page.goto('/scenes/')
  const words = await page.locator(S).evaluate((el) => el.textContent + ' ' + el.querySelector('svg')!.getAttribute('aria-label'))
  expect(words).not.toMatch(/\b(lanes?|backlogs?)\b/i)
})

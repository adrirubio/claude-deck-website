import { expect, test } from '@playwright/test'
import { enterScene, lineLengths, opacities, scrollScene } from './helpers'
const S = '[data-scene="roles"]'
const roles = [
  ['You, the Director', 'writes the features, marks them ready, chooses the roster'],
  ['Supervisor', 'an AI agent or a person; watches every team, checks the work before it merges'],
  ['AI Leaders', 'one per team; approve the plans, check the work'],
  ['Agent owners', 'plan and build one feature each'],
  ['AI reviewers', 'check the work'],
  ['Deck', 'runs the teams'],
  ['GitHub', 'holds the features and the merged work'],
]
const top = async (page: import('@playwright/test').Page, sel: string) => (await page.locator(`${S} ${sel}`).first().boundingBox())!.y

test('the gallery shows the roles scene with every role and what it does', async ({ page }) => {
  await page.goto('/scenes/')
  const svg = page.locator(`${S} svg`)
  await expect(svg).toBeAttached()
  for (const [title, sub] of roles) {
    await expect(svg.getByText(title, { exact: true })).toBeAttached()
    await expect(svg.getByText(sub, { exact: true })).toBeAttached()
  }
})

test('one person, one Supervisor, and an AI team of a Leader, two agent owners and a reviewer per feature', async ({ page }) => {
  await page.goto('/scenes/')
  await expect(page.locator(`${S} [data-role="person"]`)).toHaveCount(1)
  await expect(page.locator(`${S} [data-role="supervisor"]`)).toHaveCount(1)
  for (const f of [0, 1, 2]) {
    await expect(page.locator(`${S} .team-${f} .leader [data-role="agent"]`)).toHaveCount(1)
    await expect(page.locator(`${S} .team-${f} .owner [data-role="agent"][data-feature="${f}"]`)).toHaveCount(2)
    await expect(page.locator(`${S} .team-${f} .reviewer [data-role="agent"]`)).toHaveCount(1)
  }
})

test('the hierarchy reads from the top: you, then the Supervisor, then the Leaders, then their teams', async ({ page }) => {
  await page.goto('/scenes/')
  const you = await top(page, '[data-role="person"]'), sup = await top(page, '[data-role="supervisor"]')
  const leader = await top(page, '.leader'), owner = await top(page, '.owner')
  expect(you).toBeLessThan(sup)
  expect(sup).toBeLessThan(leader)
  expect(leader).toBeLessThan(owner)
  // Lines of responsibility: you to the Supervisor, the Supervisor to 3 Leaders, each Leader to its 3 members.
  await expect(page.locator(`${S} .reports line`)).toHaveCount(13)
  await expect(page.locator(`${S} .deck-link line`)).toHaveCount(3)
})

test('the lines of responsibility draw in, level by level', async ({ page }) => {
  await enterScene(page, S)
  await expect(page.locator(`${S} .reports line`)).toHaveCount(13)
  expect(Math.max(...await lineLengths(page, `${S} .reports line`))).toBeLessThan(1)
  // Not even a dot shows before a line's beat: a line of zero length still draws its round end cap.
  expect(Math.max(...await opacities(page, `${S} .reports line, ${S} .deck-link line`))).toBe(0)
  await scrollScene(page, S, 1.05)
  expect(Math.min(...await lineLengths(page, `${S} .reports line`))).toBeGreaterThan(10)
})

test('the still frame shows the features at different points in the hierarchy', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto('/scenes/')
  await expect(page.locator(S)).toHaveAttribute('data-state', 'still')
  const ys = await page.$$eval(`${S} .card`, (els) => els.map((e) => Math.round(e.getBoundingClientRect().y)))
  expect(ys).toHaveLength(3)
  expect(new Set(ys).size).toBe(3)
})

test('features travel down to an agent owner and back up for the checks, on their own', async ({ page }) => {
  await enterScene(page, S)
  await scrollScene(page, S, 1.05)
  const card = page.locator(`${S} .team-0 .card`)
  const ys: number[] = []
  for (let i = 0; i < 90; i++) {
    const [y, op] = await card.evaluate((e) => [e.getBoundingClientRect().y, +getComputedStyle(e).opacity])
    if (op > 0.9) ys.push(y)
    await page.waitForTimeout(100)
  }
  const low = Math.max(...ys), lowAt = ys.indexOf(low)
  expect(low - ys[0]).toBeGreaterThan(100)
  expect(Math.min(...ys.slice(lowAt))).toBeLessThan(low - 100)
})

test('scrolling back before the features move hides them again', async ({ page }) => {
  await enterScene(page, S)
  await scrollScene(page, S, 1.05); await page.waitForTimeout(1500)
  expect(Math.max(...await opacities(page, `${S} .card`))).toBeGreaterThan(0)
  await scrollScene(page, S, 0.3)
  // The scrub eases the story back, so wait for it to pass the cards' start rather than for a fixed time.
  await expect.poll(async () => Math.max(...await opacities(page, `${S} .card`)), { timeout: 5000 }).toBe(0)
})

test('without JavaScript the roles drawing sits inside its frame', async ({ browser }) => {
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

test('on a phone the roles are a readable list, with no overflow', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('/scenes/')
  const list = page.locator(`${S} ol.scene-labels`)
  await expect(list).toBeVisible()
  await expect(list.locator('li')).toHaveCount(roles.length)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('the scene says neither "lane" nor "backlog"', async ({ page }) => {
  await page.goto('/scenes/')
  const words = await page.locator(S).evaluate((el) => el.textContent + ' ' + el.querySelector('svg')!.getAttribute('aria-label'))
  expect(words).not.toMatch(/\b(lanes?|backlogs?)\b/i)
})

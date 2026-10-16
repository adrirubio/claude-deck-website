import { expect, test } from '@playwright/test'
const labels = ['GitHub holds your feature lists', 'Your AI helper prepares them', 'You, the Director',
  'Deck sets up and runs your AI teams', 'The factory: several AI teams at work', 'Finished work flows back']

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
  for (const l of labels) await expect(scene.getByText(l)).toBeVisible()
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

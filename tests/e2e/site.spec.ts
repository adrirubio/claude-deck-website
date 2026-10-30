import { expect, test } from '@playwright/test'

test('the home page loads with no request to another origin', async ({ page }) => {
  const foreign: string[] = []
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4321')) foreign.push(r.url()) })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Scale product velocity')
  expect(foreign).toEqual([])
})

test('a docs page loads its own styles and scripts', async ({ page }) => {
  const missing: string[] = []
  page.on('response', (r) => { if (r.status() >= 400) missing.push(`${r.status()} ${r.url()}`) })
  await page.goto('/docs/')
  await expect(page.locator('body')).not.toBeEmpty()
  expect(missing).toEqual([])
})

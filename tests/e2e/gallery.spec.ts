import { expect, test } from '@playwright/test'

// Every animation plays on its own: no page pins a scene or ties its story to scrolling.
for (const path of ['/', '/how-it-works/', '/scenes/']) {
  test(`${path}: no scene pins the page`, async ({ page }) => {
    await page.goto(path); await page.waitForTimeout(500)
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(500)
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
  })
}

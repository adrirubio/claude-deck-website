import { expect, test } from '@playwright/test'
import { opacities, scrollScene } from './helpers'

// Scenes load in any order, and each pinned scene adds space above the ones below it. If their triggers
// were measured out of order, a lower scene would read as already played when you reach its start.
for (const [scene, last] of [['inside', '.cap-out']]) {
  test(`the ${scene} scene is at the start of its story when you reach it`, async ({ page }) => {
    // Force the worst order: the scenes at the top of the page load last, after the ones below have set up.
    await page.route(/\/_astro\/(OutsideScene|InsideScene)\.[^/]*\.js$/, async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); await r.continue() })
    await page.goto('/scenes/'); await page.waitForTimeout(2500)
    const S = `[data-scene="${scene}"]`
    await scrollScene(page, S, 0)
    await expect(page.locator(S)).toHaveAttribute('data-state', 'animated')
    expect((await opacities(page, `${S} ${last}`))[0]).toBe(0)
  })
}

import { chromium } from '@playwright/test'
const [url, out] = process.argv.slice(2)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: 'recordings', size: { width: 1440, height: 900 } } })
const page = await context.newPage()
await page.goto(url)
await page.waitForTimeout(800)
for (let y = 0; y <= 2600; y += 20) { await page.mouse.wheel(0, 20); await page.waitForTimeout(30) }
await page.waitForTimeout(1200)
const video = page.video()
await context.close()
await video.saveAs(out)
await browser.close()
console.log('saved', out)

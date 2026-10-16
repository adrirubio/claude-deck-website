import type { Page } from '@playwright/test'

/** Scroll to a fraction of a pinned scene's story. Measures the pin's placeholder: the pinned scene itself moves down once its story ends. */
export async function scrollScene(page: Page, sel: string, f: number) {
  const top = await page.evaluate((s) => { const el = document.querySelector(s)!, pin = el.parentElement!; return (pin.classList.contains('pin-spacer') ? pin : el).getBoundingClientRect().top + scrollY }, sel)
  await page.evaluate(([t, f]: number[]) => scrollTo(0, t + innerHeight * 1.5 * f), [top, f]); await page.waitForTimeout(1200)
}

/** The scene loads when it comes into view, as it does for a reader scrolling down; then tests jump within it. */
export async function enterScene(page: Page, sel: string) {
  await page.goto('/scenes/'); await page.waitForTimeout(800); await scrollScene(page, sel, 0)
}

export const opacities = (page: Page, sel: string) => page.$$eval(sel, (els) => els.map((e) => +getComputedStyle(e).opacity))
export const lineLengths = (page: Page, sel: string) => page.$$eval(sel, (ls) => ls.map((l) => Math.hypot(+l.getAttribute('x2')! - +l.getAttribute('x1')!, +l.getAttribute('y2')! - +l.getAttribute('y1')!)))

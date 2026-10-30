import { readFileSync, existsSync } from 'node:fs'
import { expect, test } from 'vitest'

// Every quoted line of approved copy (page text, captions, alt text, the page title) must appear on its built page.
const PAGES = { home: 'index.html', 'how-it-works': 'how-it-works/index.html', 'technical-information': 'technical-information/index.html' }
const norm = (s) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase()
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ')

/** The lines a reader sees, from the copy file's quoted blocks, without Markdown and placement markers. */
export function copyLines(md) {
  return md.split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2))
    .map((l) => l.replace(/^#+\s*/, '').replace(/^\[(Main button|Secondary link|Link)\]\s*/, '').replace(/^- /, '').replace(/^\d+\.\s+/, '').replace(/\*\*/g, ''))
    .flatMap((l) => (l.includes(' · ') ? l.split(' · ') : [l])).map((l) => l.trim()).filter(Boolean)
}
/** Visible text, alt text and labels, and the title of a built page. */
export function haystack(html) {
  const alts = [...html.matchAll(/\b(?:alt|aria-label)="([^"]*)"/g)].map((m) => m[1]).join(' ')
  // Inline tags join their words; every other tag separates them.
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<\/?(a|strong|em|b|i|span|code)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' ')
  return norm(decode(text + ' ' + alts))
}

for (const [name, file] of Object.entries(PAGES)) {
  test(`the ${name} page carries every line of its approved copy`, () => {
    const path = `dist/${file}`
    expect(existsSync(path), `${path} is built`).toBe(true)
    const page = haystack(readFileSync(path, 'utf8'))
    const missing = copyLines(readFileSync(`content/copy/${name}.md`, 'utf8')).filter((l) => !page.includes(norm(l)))
    expect(missing).toEqual([])
  })
}

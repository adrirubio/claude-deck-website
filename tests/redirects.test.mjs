import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

// The Quick tour is part of How it works now; old links to it still arrive (Cloudflare Pages reads public/_redirects).
test('the old Quick tour address redirects to How it works', () => {
  const rules = readFileSync('public/_redirects', 'utf8').split('\n').map((l) => l.trim().split(/\s+/))
  expect(rules).toContainEqual(['/quick-tour/', '/how-it-works/', '301'])
  expect(rules).toContainEqual(['/quick-tour', '/how-it-works/', '301'])
})

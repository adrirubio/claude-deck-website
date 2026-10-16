import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

test('the preview workflow deploys only preview branches, and only after the checks', () => {
  const y = readFileSync('.github/workflows/preview.yml', 'utf8')
  expect(y).toMatch(/branches:\s*\[\s*'preview\/\*\*'\s*\]/)
  expect(y).not.toMatch(/\bmaster\b/)
  const order = ['npm ci', 'npm run build', 'npm test', 'npm run check', 'playwright install', 'npm run e2e', 'pages deploy dist']
  const at = order.map((s) => y.indexOf(s))
  expect(at.every((i) => i >= 0)).toBe(true)
  expect([...at].sort((a, b) => a - b)).toEqual(at)
  expect(y).toMatch(/--branch=preview-website-v2/)
})

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execSync } from 'node:child_process'
import { expect, test } from 'vitest'

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')
const reference = () => execSync('git ls-tree -r --name-only origin/master docs').toString().trim().split('\n')

test('every file of the old docs is in dist/docs with the same bytes', () => {
  // The baseline is the docs tree on master, before the move.
  const ref = reference()
  expect(ref.length).toBeGreaterThan(10)
  for (const path of ref) {
    const blob = execSync(`git show "origin/master:${path}"`, { maxBuffer: 64 * 1024 * 1024 })
    const want = createHash('sha256').update(blob).digest('hex')
    expect(hash(join('dist', path)), path).toBe(want)
  }
})

test('dist/docs has no file the old docs did not have', () => {
  const ref = new Set(reference())
  for (const p of files('dist/docs')) expect(ref.has(relative('dist', p).split('\\').join('/')), p).toBe(true)
})

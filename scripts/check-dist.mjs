import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

function walk(dir) {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p] })
}
const isDocs = (rel) => rel === 'docs' || rel.startsWith('docs/')
const external = (v) => /^([a-z]+:)?\/\//i.test(v)
const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')

export function checkDist(root) {
  const out = []
  const add = (file, rule, detail) => out.push({ file, rule, detail })
  const robots = join(root, 'robots.txt')
  if (!existsSync(robots) || !/^Disallow:\s*\/\s*$/m.test(readFileSync(robots, 'utf8'))) add('robots.txt', 'robots', 'robots.txt must disallow /')
  for (const path of walk(root)) {
    const rel = relative(root, path).split('\\').join('/')
    const ext = extname(path)
    if (!['.html', '.css', '.js', '.mjs'].includes(ext)) continue
    const text = readFileSync(path, 'utf8')
    if (ext === '.html') {
      for (const m of text.matchAll(/\s(href|src)=["']([^"']+)["']/gi)) {
        const v = m[2]
        if (v.startsWith('#') || /^(mailto|tel|data):/i.test(v) || external(v)) continue
        const clean = v.split(/[?#]/)[0]
        let target = clean.startsWith('/') ? join(root, clean) : join(dirname(path), clean)
        if (clean.endsWith('/')) target = join(target, 'index.html')
        if (!existsSync(target)) add(rel, 'local-link', v)
      }
    }
    if (isDocs(rel)) continue
    if (ext === '.html') {
      if (!/<meta\s+name=["']robots["']\s+content=["']noindex, nofollow["']/i.test(text)) add(rel, 'noindex', 'missing robots noindex')
      for (const m of text.matchAll(/<(script|img|iframe|source|video|audio)[^>]*\ssrc=["']([^"']+)["']/gi)) if (external(m[2])) add(rel, 'external-request', m[2])
      for (const m of text.matchAll(/<link[^>]*rel=["'](?:stylesheet|preload|icon|modulepreload)["'][^>]*href=["']([^"']+)["']/gi)) if (external(m[1])) add(rel, 'external-request', m[1])
      if (rel === 'index.html' && /backlog/i.test(visibleText(text))) add(rel, 'no-backlog-home', 'the word backlog is on the home page')
    }
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)/gi)) if (external(m[1])) add(rel, 'external-request', m[1])
    if (/claude/i.test(text)) add(rel, 'no-claude', 'the word Claude')
  }
  return out
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = checkDist(process.argv[2] || 'dist')
  for (const f of findings) console.log(`${f.rule}\t${f.file}\t${f.detail}`)
  process.exit(findings.length ? 1 : 0)
}

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

function walk(dir) {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p] })
}
const SCANNED = ['.html', '.css', '.js', '.mjs', '.svg', '.json', '.webmanifest', '.xml', '.txt']
const LOADING = [
  /<(?:script|img|iframe|source|video|audio|embed|track)\b[^>]*\ssrc=["']([^"']+)["']/gi,
  /<(?:image|use|feImage)\b[^>]*\s(?:xlink:)?href=["']([^"']+)["']/gi,
  /<object\b[^>]*\sdata=["']([^"']+)["']/gi,
  /<video\b[^>]*\sposter=["']([^"']+)["']/gi,
]
const REFERENCE_RELS = ['canonical', 'alternate', 'author', 'license', 'me', 'help', 'next', 'prev', 'search']
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
    if (!SCANNED.includes(ext)) continue
    const text = readFileSync(path, 'utf8')
    if (ext === '.html') {
      for (const m of text.matchAll(/\s(href|src)=["']([^"']+)["']/gi)) {
        const v = m[2]
        if (v.startsWith('#') || /^(mailto|tel|data|javascript):/i.test(v) || external(v)) continue
        const clean = v.split(/[?#]/)[0]
        let target = clean.startsWith('/') ? join(root, clean) : join(dirname(path), clean)
        if (clean.endsWith('/')) target = join(target, 'index.html')
        // Cloudflare Pages serves /a/b from a/b.html.
        if (!existsSync(target) && !(extname(clean) === '' && existsSync(target + '.html'))) add(rel, 'local-link', v)
      }
    }
    if (isDocs(rel)) continue
    if (ext === '.html' && !/<meta\s+name=["']robots["']\s+content=["']noindex, nofollow["']/i.test(text)) add(rel, 'noindex', 'missing robots noindex')
    if (ext === '.html' || ext === '.svg') {
      // Elements that load something by themselves.
      for (const re of LOADING) for (const m of text.matchAll(re)) if (external(m[1])) add(rel, 'external-request', m[1])
      for (const m of text.matchAll(/<(?:img|source)\b[^>]*\ssrcset=["']([^"']+)["']/gi))
        for (const candidate of m[1].split(',')) { const u = candidate.trim().split(/\s+/)[0]; if (u && external(u)) add(rel, 'external-request', u) }
      // Every <link> with a remote href loads or connects, except plain references.
      for (const m of text.matchAll(/<link\b[^>]*>/gi)) {
        const tag = m[0], href = /\shref=["']([^"']+)["']/i.exec(tag)?.[1], relv = (/\srel=["']([^"']+)["']/i.exec(tag)?.[1] || '').toLowerCase().split(/\s+/)
        if (href && external(href) && !relv.every((r) => REFERENCE_RELS.includes(r))) add(rel, 'external-request', href)
      }
    }
    if (ext === '.html' && rel === 'index.html' && /backlog/i.test(visibleText(text))) add(rel, 'no-backlog-home', 'the word backlog is on the home page')
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)/gi)) if (external(m[1])) add(rel, 'external-request', m[1])
    for (const m of text.matchAll(/@import\s+["']([^"']+)["']/gi)) if (external(m[1])) add(rel, 'external-request', m[1])
    // "Claude" may appear only as the Claude Code harness name and in the link to Deck's source repository.
    const named = text.replace(/Claude Code/g, '').replace(/https:\/\/github\.com\/adrirubio\/claude-deck(?=["'])/g, '')
    if (/claude/i.test(named)) add(rel, 'no-claude', 'the word Claude')
  }
  return out
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = checkDist(process.argv[2] || 'dist')
  for (const f of findings) console.log(`${f.rule}\t${f.file}\t${f.detail}`)
  process.exit(findings.length ? 1 : 0)
}

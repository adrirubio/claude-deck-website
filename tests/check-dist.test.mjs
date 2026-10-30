import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, expect, test } from 'vitest'
import { checkDist } from '../scripts/check-dist.mjs'

const root = 'tests/.tmp-dist'
const page = (body, head = '<meta name="robots" content="noindex, nofollow">') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`
function write(path, text) { mkdirSync(join(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), text) }
beforeEach(() => { rmSync(root, { recursive: true, force: true }); write('robots.txt', 'User-agent: *\nDisallow: /\n') })
const rules = () => checkDist(root).map((f) => f.rule).sort()

test('a clean build has no findings', () => {
  write('index.html', page('<a href="/how/">How</a><img src="/a.png">'))
  write('how/index.html', page('Hello')); write('a.png', 'x')
  expect(checkDist(root)).toEqual([])
})
test('a page without noindex is found', () => { write('index.html', page('x', '')); expect(rules()).toEqual(['noindex']) })
test('a robots.txt that allows crawling is found', () => { write('index.html', page('x')); write('robots.txt', 'User-agent: *\n'); expect(rules()).toEqual(['robots']) })
test('a broken local link is found', () => { write('index.html', page('<a href="/missing/">x</a>')); expect(rules()).toEqual(['local-link']) })
test('an external script, stylesheet or CSS url is found, an outbound link is not', () => {
  write('index.html', page('<script src="https://cdn.example/x.js"></script><a href="https://github.com/x">ok</a>',
    '<meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="https://fonts.example/a.css"><style>b{background:url(https://x.example/i.png)}</style>'))
  expect(rules()).toEqual(['external-request', 'external-request', 'external-request'])
})
test('the word Claude is found outside the docs only', () => {
  write('index.html', page('Claude Deck')); write('docs/index.html', page('Claude Deck docs'))
  expect(checkDist(root).map((f) => [f.rule, f.file])).toEqual([['no-claude', 'index.html']])
})
test('backlog on the home page is found, on other pages it is allowed', () => {
  write('index.html', page('Your backlog')); write('how/index.html', page('Your backlog'))
  expect(checkDist(root).map((f) => [f.rule, f.file])).toEqual([['no-backlog-home', 'index.html']])
})
test('requests the old rules missed are found', () => {
  write('index.html', page(
    '<img srcset="https://cdn.example/a.png 2x"><svg><image href="https://x.example/i.png"/><image xlink:href="//y.example/j.png"/></svg>' +
    '<embed src="https://x.example/e.swf"><object data="https://x.example/o.pdf"></object><video poster="https://x.example/p.jpg"></video>',
    '<meta name="robots" content="noindex, nofollow"><link href="https://fonts.example/a.css" rel="stylesheet"><link rel="preconnect" href="https://fonts.example"><link rel="preload stylesheet" href="https://x.example/b.css">'))
  write('style.css', '@import "https://fonts.example/c.css";')
  expect(rules()).toEqual(Array(10).fill('external-request'))
})
test('svg, json, webmanifest and txt files are scanned too', () => {
  write('index.html', page('x'))
  write('logo.svg', '<svg><image href="https://x.example/i.png"/><title>Claude</title></svg>')
  write('site.webmanifest', '{"name":"Claude Deck"}')
  expect(rules()).toEqual(['external-request', 'no-claude', 'no-claude'])
})
test('a link without .html resolves to the .html page, as Cloudflare Pages serves it', () => {
  write('index.html', page('<a href="/docs/guide/installation">Install</a><a href="/docs/missing">x</a>'))
  write('docs/guide/installation.html', page('Install'))
  expect(checkDist(root).map((f) => [f.rule, f.detail])).toEqual([['local-link', '/docs/missing']])
})
test('Claude is allowed only as the Claude Code harness name and in the link to Deck\'s source', () => {
  write('index.html', page('<p>Claude Code, Codex and more</p><a href="https://github.com/adrirubio/claude-deck">GitHub</a>'))
  expect(rules()).toEqual([])
  write('index.html', page('<p>Claude Deck</p>'))
  expect(rules()).toEqual(['no-claude'])
  write('index.html', page('<a href="https://github.com/adrirubio/claude-deck-other">x</a>'))
  expect(rules()).toEqual(['no-claude'])
})

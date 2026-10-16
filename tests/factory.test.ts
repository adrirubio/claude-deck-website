import { describe, expect, it } from 'vitest'
import { BOUNDARY, DECK, GITHUB, GROOM, HELPER, IN, OUT, SUP, TEAM, YOU, insideFactory } from '../src/scenes/factory/layout'

describe('the factory figure', () => {
  it('holds the Supervisor, Deck and the AI team', () => {
    expect(insideFactory(SUP)).toBe(true)
    for (const c of [DECK, { x: DECK.x + DECK.w, y: DECK.y + DECK.d }]) expect(insideFactory(c)).toBe(true)
    for (const m of TEAM.members) expect(insideFactory(m)).toBe(true)
    expect(insideFactory(TEAM.leader)).toBe(true)
  })
  it('leaves you, your AI helper and GitHub outside', () => {
    expect(insideFactory(YOU)).toBe(false)
    expect(insideFactory(HELPER)).toBe(false)
    for (const c of [GITHUB, { x: GITHUB.x + GITHUB.w, y: GITHUB.y }, { x: GITHUB.x, y: GITHUB.y + GITHUB.d }]) expect(insideFactory(c)).toBe(false)
  })
  it('your grooming line runs around the factory, never through it', () => {
    for (const [a, b] of GROOM.slice(1).map((p, i) => [GROOM[i], p])) {
      for (let t = 0; t <= 1; t += 0.05) expect(insideFactory({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })).toBe(false)
    }
  })
  it('ready features cross the boundary into the factory, and finished work crosses back out', () => {
    expect(insideFactory({ x: IN.x1, y: IN.y1 })).toBe(false)
    expect(insideFactory({ x: IN.x2, y: IN.y2 })).toBe(true)
    expect(insideFactory({ x: OUT.x1, y: OUT.y1 })).toBe(true)
    expect(insideFactory({ x: OUT.x2, y: OUT.y2 })).toBe(false)
  })
  it('the boundary is a closed shape', () => {
    expect(BOUNDARY.w).toBeGreaterThan(0)
    expect(BOUNDARY.d).toBeGreaterThan(0)
  })
})

import { describe, expect, it } from 'vitest'
import { DECK, FRONT_Y, TEAMS } from '../src/scenes/inside/teams'

describe('the teams inside the factory', () => {
  it('every feature starts at Plan, ends at Merged, and moves one station at a time', () => {
    for (const t of TEAMS) {
      expect(t.route[0]).toBe(0)
      expect(t.route.at(-1)).toBe(5)
      t.route.slice(1).forEach((s, i) => expect(Math.abs(s - t.route[i])).toBe(1))
    }
  })
  it('some work is sent back: from Review to Build, and from Approve to Plan', () => {
    const steps = TEAMS.flatMap((t) => t.route.slice(1).map((s, i) => `${t.route[i]}>${s}`))
    expect(steps).toContain('3>2')
    expect(steps).toContain('1>0')
  })
  it('Deck stands outside the factory, beyond its front wall', () => {
    expect(DECK.y).toBeGreaterThan(FRONT_Y + 8)
  })
  it('each team works at its own pace', () => {
    expect(new Set(TEAMS.map((t) => t.pace)).size).toBe(TEAMS.length)
  })
})

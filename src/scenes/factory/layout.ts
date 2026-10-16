/**
 * Where the parts of the factory figure stand, in world units. Places are often given as u (across the
 * screen) and v (down the screen): world x = v + u, y = v - u.
 * The factory, as Deck's operating model defines it: the Supervisor, Deck and the team. You, your AI
 * helper and GitHub stay outside.
 */
type P = { x: number; y: number }
export const at = (u: number, v: number): P => ({ x: v + u, y: v - u })

export const BOUNDARY = { x: 40, y: 40, w: 320, d: 320 }
export const insideFactory = (p: P) => p.x > BOUNDARY.x && p.x < BOUNDARY.x + BOUNDARY.w && p.y > BOUNDARY.y && p.y < BOUNDARY.y + BOUNDARY.d

// Outside, above: you and your AI helper. Outside, below: GitHub.
export const YOU = at(-20, -40)
export const HELPER = at(-75, -15)
export const GITHUB = { x: 395, y: 405, w: 90, d: 70, h: 30 }
// Your grooming line goes around the factory, past its left corner, to GitHub.
export const GROOM: P[] = [YOU, at(-200, 200), { x: GITHUB.x, y: GITHUB.y + 35 }]

// Inside: the AI team on its belt, Deck, and the Supervisor.
export const TEAM = {
  belt: { x: 90, y: 150, w: 200 },
  members: [{ x: 120, y: 185, role: 'owner' }, { x: 170, y: 185, role: 'owner' }, { x: 220, y: 185, role: 'reviewer' }] as const,
  leader: { x: 260, y: 110 },
}
export const DECK = { x: 70, y: 250, w: 110, d: 64, h: 24 }
export const SUP = at(110, 200)

// Ready features cross the boundary on the way in; finished work crosses it on the way back.
const line = (a: P, b: P) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
export const IN = line(at(25, 420), at(25, 300))
export const OUT = line(at(-25, 300), at(-25, 420))

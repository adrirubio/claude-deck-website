import type { Feature } from '../iso/palette'

/**
 * One AI team per feature, each on its own belt. `route` is the stations the feature visits, by index
 * (0 Plan … 5 Merged); some work is sent back a step. `pace` scales the team's timings: each team
 * works at its own speed.
 */
export type Team = { y: number; f: Feature; pace: number; route: number[] }
export const TEAMS: Team[] = [
  // Review sends the work back to Build once.
  { y: 0, f: 0, pace: 1, route: [0, 1, 2, 3, 2, 3, 4, 5] },
  // The AI Leader sends the plan back once.
  { y: 76, f: 1, pace: 1.25, route: [0, 1, 0, 1, 2, 3, 4, 5] },
  { y: 152, f: 2, pace: 0.8, route: [0, 1, 2, 3, 4, 5] },
]

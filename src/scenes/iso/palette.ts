export const HUMAN = '#E3962B'
export const AI = '#1E8C76'
export const AI_TOP = '#5FC1A9'
export const STEEL = '#9DAEB6'
export const GRAPHITE = '#1C2A31'
export const GROUND = '#D9E0E3'
export const PAPER = '#F4F6F7'
/** One colour and AI cap shape per feature. */
export const FEATURES = [
  { color: '#2E7DD7', cap: 'cube' },
  { color: '#8E5BD8', cap: 'pyramid' },
  { color: '#D0577B', cap: 'cylinder' },
] as const
export type Feature = 0 | 1 | 2

export type Origin = { x: number; y: number; k: number }
const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6)
const r3 = (v: number) => Math.round(v * 1000) / 1000

/** 30° isometric projection: x runs right and down, y runs left and down, z runs up. */
export function project(o: Origin, x: number, y: number, z: number): [number, number] {
  return [r3(o.x + (x - y) * C * o.k), r3(o.y + (x + y) * S * o.k - z * o.k)]
}

/** The screen offset of a move of (dx, dy) on the ground. */
export function groundOffset(o: Origin, dx: number, dy: number): [number, number] {
  return [r3((dx - dy) * C * o.k), r3((dx + dy) * S * o.k)]
}

export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)))
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('')
}

/** Back to front: draw items with a smaller x + y first. */
export function sortByDepth<T extends { x: number; y: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.x + a.y - (b.x + b.y))
}

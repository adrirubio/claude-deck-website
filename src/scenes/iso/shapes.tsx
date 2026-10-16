import type { ReactNode } from 'react'
import { project, shade, type Origin } from './project'
import { AI, AI_TOP, FEATURES, HUMAN, PAPER, type Feature } from './palette'

type At = { o: Origin; x: number; y: number }
const pts = (o: Origin, list: [number, number, number][]) => list.map(([x, y, z]) => project(o, x, y, z).join(',')).join(' ')

/** A box with its two visible sides shaded and its top in the base colour. */
export function Box({ o, x, y, z = 0, w, d, h, color, className }: At & { z?: number; w: number; d: number; h: number; color: string; className?: string }) {
  return (
    <g className={className}>
      <polygon points={pts(o, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={shade(color, 0.78)} />
      <polygon points={pts(o, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={shade(color, 0.9)} />
      <polygon points={pts(o, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={color} />
    </g>
  )
}

/** A person: a rounded body and a head, in amber by default. */
export function Person({ o, x, y, z = 0, color = HUMAN, className }: At & { z?: number; color?: string; className?: string }) {
  const k = o.k
  const [bx, by] = project(o, x, y, z), [, ty] = project(o, x, y, z + 34), [hx, hy] = project(o, x, y, z + 46)
  return (
    <g className={className} data-role="person">
      <ellipse cx={bx} cy={by} rx={9 * k} ry={4.5 * k} fill={shade(color, 0.7)} />
      <rect x={bx - 9 * k} y={ty} width={18 * k} height={by - ty} fill={shade(color, 0.85)} />
      <ellipse cx={bx} cy={ty} rx={9 * k} ry={4.5 * k} fill={color} />
      <circle cx={hx} cy={hy} r={7.5 * k} fill={color} />
    </g>
  )
}

/** An AI agent: a verdigris body with a cap in its feature's colour and shape. */
export function Agent({ o, x, y, z = 0, feature, className }: At & { z?: number; feature?: Feature; className?: string }) {
  const k = o.k
  let cap: ReactNode
  if (feature === undefined) cap = <Box o={o} x={x - 6} y={y - 6} z={z + 30} w={12} d={12} h={10} color={AI_TOP} />
  else {
    const f = FEATURES[feature]
    if (f.cap === 'cube') cap = <Box o={o} x={x - 6} y={y - 6} z={z + 30} w={12} d={12} h={10} color={f.color} />
    else if (f.cap === 'pyramid') {
      const t: [number, number, number] = [x, y, z + 44]
      cap = (
        <g>
          <polygon points={pts(o, [[x - 7, y + 7, z + 30], [x + 7, y + 7, z + 30], t])} fill={shade(f.color, 0.8)} />
          <polygon points={pts(o, [[x + 7, y - 7, z + 30], [x + 7, y + 7, z + 30], t])} fill={shade(f.color, 0.92)} />
          <polygon points={pts(o, [[x - 7, y - 7, z + 30], [x + 7, y - 7, z + 30], t])} fill={f.color} />
        </g>
      )
    } else {
      const [bx, by] = project(o, x, y, z + 30), [, ty] = project(o, x, y, z + 40)
      cap = (
        <g>
          <rect x={bx - 7 * k} y={ty} width={14 * k} height={by - ty} fill={shade(f.color, 0.85)} />
          <ellipse cx={bx} cy={by} rx={7 * k} ry={3.5 * k} fill={shade(f.color, 0.85)} />
          <ellipse cx={bx} cy={ty} rx={7 * k} ry={3.5 * k} fill={f.color} />
        </g>
      )
    }
  }
  return (
    <g className={className} data-role="agent" data-feature={feature ?? ''}>
      <Box o={o} x={x - 8} y={y - 8} z={z} w={16} d={16} h={30} color={AI} />
      {cap}
    </g>
  )
}

/** A work item: a small box with a stripe in its feature's colour. */
export function WorkItem({ o, x, y, z = 6, feature, className }: At & { z?: number; feature?: Feature; className?: string }) {
  const stripe = feature === undefined ? HUMAN : FEATURES[feature].color
  return (
    <g className={className} data-role="item">
      <Box o={o} x={x} y={y} z={z} w={22} d={16} h={16} color={PAPER} />
      <Box o={o} x={x + 4} y={y + 4} z={z + 16} w={14} d={8} h={1.5} color={stripe} />
    </g>
  )
}

/** A dashed line on the ground. */
export function GroundLine({ o, x1, y1, x2, y2, color, className }: { o: Origin; x1: number; y1: number; x2: number; y2: number; color: string; className?: string }) {
  const [ax, ay] = project(o, x1, y1, 1), [bx, by] = project(o, x2, y2, 1)
  return <line className={className} x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={3.5} strokeDasharray="2 8" strokeLinecap="round" />
}

/** A label joined to a point in the scene by a short line. */
export function Callout({ o, x, y, z, text, sub, dx, dy, small, n, anchor, className }: At & { z: number; text: string; sub?: string; dx: number; dy: number; small?: boolean; n?: number; anchor?: 'start' | 'end'; className?: string }) {
  const [ax, ay] = project(o, x, y, z)
  const bx = ax + dx, by = ay + dy
  return (
    <g className={className} data-role="callout">
      <line x1={ax} y1={ay} x2={bx} y2={by - 5} stroke="#56666E" strokeWidth={1.2} />
      <circle cx={ax} cy={ay} r={2.5} fill="#56666E" />
      <text x={bx} y={by + 12} textAnchor={anchor ?? (dx < 0 ? 'end' : 'start')} className={small ? 'iso-label-s' : 'iso-label'}>{text}</text>
      {sub && <text x={bx} y={by + 31} textAnchor={anchor ?? (dx < 0 ? 'end' : 'start')} className="iso-label-s">{sub}</text>}
      {n !== undefined && (
        <g className="iso-number" aria-hidden="true">
          <circle cx={ax} cy={ay} r={17} fill="#1C2A31" />
          <text x={ax} y={ay + 7} textAnchor="middle">{n}</text>
        </g>
      )}
    </g>
  )
}

/** Fills for the Supervisor, who may be a person (amber) or an AI agent (verdigris). Render once per drawing. */
export function SplitDefs() {
  const grad = (id: string, f: number) => (
    <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0.5" stopColor={shade(HUMAN, f)} /><stop offset="0.5" stopColor={shade(AI, f)} />
    </linearGradient>
  )
  return <defs>{grad('iso-split', 1)}{grad('iso-split-d', 0.85)}</defs>
}

/** The Supervisor: a person's shape, half amber and half verdigris. Needs <SplitDefs /> in the drawing. */
export function Supervisor({ o, x, y, z = 0, className }: At & { z?: number; className?: string }) {
  const k = o.k
  const [bx, by] = project(o, x, y, z), [, ty] = project(o, x, y, z + 34), [hx, hy] = project(o, x, y, z + 46)
  return (
    <g className={className} data-role="supervisor">
      <ellipse cx={bx} cy={by} rx={9 * k} ry={4.5 * k} fill="url(#iso-split-d)" />
      <rect x={bx - 9 * k} y={ty} width={18 * k} height={by - ty} fill="url(#iso-split-d)" />
      <ellipse cx={bx} cy={ty} rx={9 * k} ry={4.5 * k} fill="url(#iso-split)" />
      <circle cx={hx} cy={hy} r={7.5 * k} fill="url(#iso-split)" />
    </g>
  )
}

/** A numbered step name with its role underneath, centred on a point; on phones only the number shows. */
export function StepLabel({ o, x, y, z = 0, n, title, sub, className }: At & { z?: number; n: number; title: string; sub: string; className?: string }) {
  const [tx, ty] = project(o, x, y, z)
  return (
    <g className={className} data-role="callout">
      <text x={tx} y={ty} textAnchor="middle" className="iso-label">{`${n}  ${title}`}</text>
      <text x={tx} y={ty + 19} textAnchor="middle" className="iso-label-s">{sub}</text>
      <g className="iso-number" aria-hidden="true">
        <circle cx={tx} cy={ty + 2} r={17} fill="#1C2A31" />
        <text x={tx} y={ty + 9} textAnchor="middle">{n}</text>
      </g>
    </g>
  )
}

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Agent, Box, Callout, GroundLine, Person, SplitDefs, Supervisor, WorkItem } from '../iso/shapes'
import { groundOffset, project, type Origin } from '../iso/project'
import { AI, AI_TOP, FEATURES, GRAPHITE, GROUND, HUMAN, PAPER, STEEL } from '../iso/palette'
import { makeLoops } from '../iso/loops'
import { grow, refreshPriority } from '../iso/motion'
import { at, BOUNDARY as B, DECK, GITHUB, GROOM, HELPER, IN, OUT, SUP, TEAM, YOU } from './layout'
import '../scenes.css'

const o: Origin = { x: 420, y: 120, k: 1 }
// The frame fitted to the drawing and its labels (measured with getBBox at 1440 px, plus a margin), fixed so the page never shifts.
const VIEWBOX = '-172 -21 1149 705'
// The figure builds on its own, in this many seconds, when it comes into view.
const BUILD_SECONDS = 5
const LABELS = [
  ['The factory', 'everything you start, stop, upgrade or repair'],
  ['Supervisor', 'checks in on the team'],
  ['Deck', 'runs the team and keeps it within its rules'],
  ['Your AI team', 'works through your features'],
  ['You and your AI helper', 'you own the features and the decisions, outside the factory'],
  ['GitHub', 'holds the features and the finished work, outside the factory'],
] as const
const FLOWS = ['Ready features come in', 'Finished work goes back'] as const
const mid = (p: { x1: number; y1: number; x2: number; y2: number }, t = 0.5) => groundOffset(o, (p.x2 - p.x1) * t, (p.y2 - p.y1) * t)

export default function FactoryScene() {
  const root = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'still' | 'animated'>('still')

  useEffect(() => {
    if (!root.current) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    setState('animated')
    const q = gsap.utils.selector(root.current)
    let loops: ReturnType<typeof makeLoops> | undefined
    const ctx = gsap.context(() => {
      const pop = { opacity: 0, scale: 0.6, transformOrigin: '50% 100%', ease: 'back.out(2)' }
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.06 }, paused: true })
      const lp = (loops = makeLoops(root.current!, tl))
      // Outside: you and your helper, then GitHub and your grooming line around the factory.
      tl.from(q('.ground'), { opacity: 0 }, 0)
        .from(q('.you, .helper'), { ...pop, stagger: 0.03 }, 0.04)
        .from(q('.github'), { opacity: 0, y: 20 }, 0.1)
        .add(grow(q('.groom-link line')), 0.14)
        .from(q('.l5, .l6'), { opacity: 0 }, 0.18)
      // The boundary draws in, edge by edge.
        .from(q('.inside-floor'), { opacity: 0 }, 0.22)
      q('.boundary line').forEach((l, i) => tl.add(grow([l]), 0.24 + i * 0.05))
      // Inside: Deck, the Supervisor and the AI team.
      tl.from(q('.l1'), { opacity: 0 }, 0.44)
        .from(q('.deck'), { opacity: 0, y: 20 }, 0.48)
        .from(q('.sup'), pop, 0.52)
        .from(q('.team-belt'), { opacity: 0 }, 0.55)
        .from(q('.team [data-role="agent"]'), { ...pop, stagger: 0.02 }, 0.56)
        .from(q('.l2, .l3, .l4'), { opacity: 0, stagger: 0.02 }, 0.64)
        .add(grow(q('.check-in-link line')), 0.7)
      // The flows across the boundary.
        .add(grow(q('.flow-link line')), 0.74)
        .from(q('.l-flow'), { opacity: 0 }, 0.8)
        .to({}, { duration: 0.02 }, 0.98)
      tl.timeScale(1 / BUILD_SECONDS)
      ScrollTrigger.create({ trigger: root.current, start: 'top 80%', once: true, refreshPriority: refreshPriority(root.current!), onEnter: () => tl.play() })

      // Then only the work moves, and the Supervisor's check-in pulses.
      const travel = (sel: string, dx: number, dy: number, seconds: number, delay = 0) => {
        const el = q(sel)[0]
        gsap.set(el, { opacity: 0 })
        lp.add(gsap.fromTo(el, { x: 0, y: 0, opacity: 0 }, {
          keyframes: [{ opacity: 1, duration: 0.4 }, { x: dx, y: dy, duration: seconds, ease: 'none' }, { opacity: 0, duration: 0.4 }],
          repeat: -1, repeatDelay: 0.6, delay, paused: true,
        }), 0.86, el)
      }
      travel('.in-item', ...mid(IN, 1), 2.4)
      travel('.out-item', ...mid(OUT, 1), 2.4, 1.6)
      travel('.team-item', ...groundOffset(o, TEAM.belt.w - 22, 0), 4)
      const ring = q('.check-in')[0]
      gsap.set(ring, { opacity: 0 })
      lp.add(gsap.fromTo(ring, { opacity: 0.15 }, { opacity: 1, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true }), 0.86, ring)
    }, root)
    // Scenes load in any order; a pinned scene adds space above the ones below it, so every trigger is measured again, top to bottom.
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    return () => { loops?.kill(); ctx.revert() }
  }, [])

  const edge = (x1: number, y1: number, x2: number, y2: number) => <GroundLine o={o} x1={x1} y1={y1} x2={x2} y2={y2} color={GRAPHITE} />
  const [rx, ry] = project(o, SUP.x, SUP.y, 0)
  const [ix, iy] = mid(IN), [ox, oy] = mid(OUT), [tx, ty] = groundOffset(o, TEAM.members[2].x - 11 - TEAM.belt.x, 0)
  return (
    <div ref={root} className="scene" data-scene="factory" data-state={state}>
      <svg viewBox={VIEWBOX} role="img" aria-label="What the factory is. A boundary marks the factory: everything you start, stop, upgrade or repair. Inside it are the Supervisor, who checks in on the team; Deck, which runs the team and keeps it within its rules; and your AI team, working through your features. Outside it are you and your AI helper, who own the features and the decisions, and GitHub, which holds the features and the finished work. Ready features cross into the factory, and finished work goes back out to GitHub.">
        <SplitDefs />
        <g className="ground"><Box o={o} x={-140} y={-80} z={-12} w={680} d={600} h={12} color={GROUND} /></g>

        {/* Outside, above: you and your AI helper */}
        <g className="groom-link">{GROOM.slice(1).map((p, i) => <g key={i}><GroundLine o={o} x1={GROOM[i].x} y1={GROOM[i].y} x2={p.x} y2={p.y} color={HUMAN} /></g>)}</g>
        <g className="helper"><Agent o={o} x={HELPER.x} y={HELPER.y} /></g>
        <g className="you"><Person o={o} x={YOU.x} y={YOU.y} /></g>

        {/* The factory: its floor and boundary */}
        <g className="inside-floor"><Box o={o} x={B.x} y={B.y} w={B.w} d={B.d} h={2} color="#E9EEF0" /></g>
        <g className="boundary">
          {edge(B.x, B.y, B.x + B.w, B.y)}{edge(B.x + B.w, B.y, B.x + B.w, B.y + B.d)}
          {edge(B.x + B.w, B.y + B.d, B.x, B.y + B.d)}{edge(B.x, B.y + B.d, B.x, B.y)}
        </g>

        {/* Inside: the AI team, the Supervisor and Deck */}
        <g className="check-in-link"><GroundLine o={o} x1={SUP.x - 10} y1={SUP.y + 6} x2={TEAM.leader.x + 14} y2={TEAM.leader.y} color={AI} /></g>
        <g className="team">
          <Agent o={o} x={TEAM.leader.x} y={TEAM.leader.y} />
          <g className="team-belt">
            <Box o={o} x={TEAM.belt.x} y={TEAM.belt.y} z={2} w={TEAM.belt.w} d={16} h={5} color={STEEL} />
            <Box o={o} x={TEAM.belt.x} y={TEAM.belt.y + 6} z={7.2} w={TEAM.belt.w} d={4} h={0.4} color={FEATURES[0].color} />
          </g>
          <g className="team-item" transform={`translate(${tx} ${ty})`}><WorkItem o={o} x={TEAM.belt.x} y={TEAM.belt.y} z={7} feature={0} /></g>
          {TEAM.members.map((m) => <Agent key={m.x} o={o} x={m.x} y={m.y} feature={m.role === 'owner' ? 0 : undefined} />)}
        </g>
        <ellipse className="check-in" cx={rx} cy={ry} rx={22} ry={11} fill="none" stroke={AI} strokeWidth={3} />
        <g className="sup"><Supervisor o={o} x={SUP.x} y={SUP.y} /></g>
        <g className="deck">
          <Box o={o} x={DECK.x} y={DECK.y} w={DECK.w} d={DECK.d} h={DECK.h} color={STEEL} />
          <Box o={o} x={DECK.x + 14} y={DECK.y + 6} z={DECK.h} w={80} d={9} h={28} color={GRAPHITE} />
          <Box o={o} x={DECK.x + 18} y={DECK.y + 8} z={DECK.h + 4} w={72} d={2} h={20} color={AI_TOP} />
        </g>

        {/* The flows across the boundary, and GitHub below */}
        <g className="flow-link">
          <g><GroundLine o={o} {...IN} color={AI} /></g>
          <g><GroundLine o={o} {...OUT} color={HUMAN} /></g>
        </g>
        <g className="in-item" transform={`translate(${ix} ${iy})`}><WorkItem o={o} x={IN.x1 - 11} y={IN.y1 - 8} z={1} feature={0} /></g>
        <g className="out-item" transform={`translate(${ox} ${oy})`}><WorkItem o={o} x={OUT.x1 - 11} y={OUT.y1 - 8} z={1} /></g>
        <g className="github">
          <Box o={o} x={GITHUB.x} y={GITHUB.y} w={GITHUB.w} d={GITHUB.d} h={GITHUB.h} color="#33434B" />
          {[10, 30, 50].map((dy, i) => <Box key={dy} o={o} x={GITHUB.x + 10} y={GITHUB.y + dy} z={GITHUB.h} w={70} d={12} h={3} color={i === 0 ? PAPER : '#C9D3D8'} />)}
        </g>

        {/* Labels: each part, and whether it is in the factory */}
        <g className="l1"><Callout o={o} x={B.x + 60} y={B.y} z={0} text={LABELS[0][0]} sub={LABELS[0][1]} n={1} dx={60} dy={-70} /></g>
        <g className="l2"><Callout o={o} x={SUP.x} y={SUP.y} z={40} text={LABELS[1][0]} sub={LABELS[1][1]} n={2} dx={50} dy={-10} /></g>
        <g className="l3"><Callout o={o} x={DECK.x} y={DECK.y + DECK.d} z={0} text={LABELS[2][0]} sub={LABELS[2][1]} n={3} dx={-40} dy={40} /></g>
        <g className="l4"><Callout o={o} x={TEAM.belt.x} y={TEAM.belt.y} z={8} text={LABELS[3][0]} sub={LABELS[3][1]} n={4} dx={-60} dy={-50} /></g>
        <g className="l5"><Callout o={o} x={YOU.x} y={YOU.y} z={46} text={LABELS[4][0]} sub={LABELS[4][1]} n={5} dx={50} dy={-30} /></g>
        <g className="l6"><Callout o={o} x={GITHUB.x + GITHUB.w} y={GITHUB.y} z={GITHUB.h} text={LABELS[5][0]} sub={LABELS[5][1]} n={6} dx={40} dy={0} /></g>
        <g className="l-flow"><Callout o={o} {...at(25, 360)} z={1} text={FLOWS[0]} n={7} dx={30} dy={0} small /></g>
        <g className="l-flow"><Callout o={o} {...at(-25, 360)} z={1} text={FLOWS[1]} n={8} dx={-30} dy={0} small /></g>
      </svg>
      <ol className="scene-labels">
        {LABELS.map(([t, d]) => <li key={t}>{t}: {d}</li>)}
        {FLOWS.map((f) => <li key={f}>{f}</li>)}
      </ol>
    </div>
  )
}

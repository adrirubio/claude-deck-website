import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Agent, Box, Callout, GroundLine, SplitDefs, StepLabel, Supervisor, WorkItem } from '../iso/shapes'
import { groundOffset, project, type Origin } from '../iso/project'
import { AI, FEATURES, GROUND, HUMAN, STEEL, type Feature } from '../iso/palette'
import { makeLoops } from '../iso/loops'
import '../scenes.css'

const o: Origin = { x: 340, y: 90, k: 1 }
// The frame fitted to the drawing and its labels (measured with getBBox at 1440 px, plus a margin), fixed so the page never shifts.
const VIEWBOX = '-35 -35 1335 722'
// Belts run along x, one lane per feature; the stations stand in front of each belt.
const L = 720
const LANES: { y: number; f: Feature }[] = [{ y: 0, f: 0 }, { y: 76, f: 1 }, { y: 152, f: 2 }]
const ST = [80, 200, 320, 440, 560, 680]
const STEPS = [
  { title: 'Plan', sub: 'agent owner' }, { title: 'Approve', sub: 'AI Leader' }, { title: 'Build', sub: 'agent owner' },
  { title: 'Review', sub: 'AI reviewer' }, { title: 'Check', sub: 'AI Leader and Supervisor' }, { title: 'Merged', sub: 'back to GitHub' },
]
const CAPTIONS = ['Each ready feature gets its own lane', 'Several features move through the AI team at once', 'Merged work goes back to GitHub']
// Where each feature rests in the still frame: in parallel, at different stations.
const STILL_AT = [3, 2, 0]
// A feature enters here, inside the doorway.
const START = -40
const at = (s: number) => groundOffset(o, ST[s] - 11 - START, 0)
// One trip through the lane, in seconds; the lanes start a third of a trip apart.
const MOVE = 0.6, HOLD = 0.9, TRIP = 0.4 + ST.length * (MOVE + HOLD) + 0.4

export default function InsideScene() {
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
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.1 },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=150%', scrub: 0.6, pin: true },
      })
      const lp = (loops = makeLoops(root.current!, tl))
      // Beat 1: the factory floor, its walls and three empty belts.
      tl.from(q('.floor'), { opacity: 0, y: 12 }, 0)
        .from(q('.wall'), { opacity: 0, y: 14, ease: 'power3.out', stagger: 0.01 }, 0.04)
        .from(q('.belt'), { opacity: 0, stagger: 0.03 }, 0.08)
        .from(q('.in-link'), { opacity: 0 }, 0.12)
        .from(q('.cap-gate'), { opacity: 0 }, 0.14)
      // Beat 2: the stations, one column at a time, each with its step name and role.
      STEPS.forEach((_, s) => {
        tl.from(q(`.col-${s}`), { ...pop, stagger: 0.015 }, 0.2 + s * 0.06)
          .from(q(`.step-${s}`), { opacity: 0, y: 8 }, 0.23 + s * 0.06)
      })
      // Beats 3 and 4: the features run through their lanes; merged work leaves for GitHub.
      tl.from(q('.cap-lanes'), { opacity: 0 }, 0.64)
        .from(q('.out-link'), { opacity: 0 }, 0.72)
        .from(q('.cap-out'), { opacity: 0 }, 0.8)
        .to({}, { duration: 0.02 }, 0.98)

      // Each feature visits every station in turn; the station it stands at lights up.
      LANES.forEach((_, i) => {
        const item = q(`.lane-${i} .lane-item`)[0], rings = q(`.lane-${i} .station-ring`)
        gsap.set([item, ...rings], { opacity: 0 })
        const t = gsap.timeline({ repeat: -1, paused: true, delay: (i * TRIP) / 3 })
        t.set(item, { x: 0, y: 0, opacity: 0 }).to(item, { opacity: 1, duration: 0.4, ease: 'none' })
        ST.forEach((_, s) => {
          const [dx, dy] = at(s)
          t.to(item, { x: dx, y: dy, duration: MOVE, ease: 'power1.inOut' })
            .to(rings[s], { opacity: 1, duration: 0.2, ease: 'none' })
          if (s > 0) t.to(rings[s - 1], { opacity: 0, duration: 0.3, ease: 'none' }, '<')
          t.to({}, { duration: HOLD - 0.2 })
        })
        t.to([item, rings[ST.length - 1]], { opacity: 0, duration: 0.4, ease: 'none' })
        lp.add(t, 0.58, [item, ...rings])
      })
    }, root)
    return () => { loops?.kill(); ctx.revert() }
  }, [])

  const wallX = (x: number) => [[-24, -4], [30, 72], [106, 148], [182, 200]].map(([y1, y2]) => (
    <g key={`${x}-${y1}`} className="wall"><Box o={o} x={x} y={y1} z={4} w={8} d={y2 - y1} h={14} color={STEEL} /></g>
  ))
  return (
    <div ref={root} className="scene" data-scene="inside" data-state={state}>
      <svg viewBox={VIEWBOX} role="img" aria-label="Inside the factory. Three features, each in its own coloured lane, move through the AI team at the same time. Every lane passes six stations in order: the agent owner plans, the AI Leader approves, the agent owner builds, an AI reviewer checks, the AI Leader and the Supervisor check, and the work is merged and goes back to GitHub.">
        <SplitDefs />
        <g className="floor">
          <Box o={o} x={-170} y={-40} z={-12} w={L + 340} d={280} h={12} color={GROUND} />
          <Box o={o} x={-34} y={-24} w={L + 52} d={224} h={4} color="#E9EEF0" />
        </g>
        {wallX(-34)}
        <g className="in-link"><GroundLine o={o} x1={-160} y1={89} x2={-50} y2={89} color={AI} /></g>

        {LANES.map((lane, i) => {
          const [sx, sy] = at(STILL_AT[i])
          return (
            <g key={i} className={`lane-${i}`}>
              <g className="belt">
                <Box o={o} x={0} y={lane.y} w={L} d={26} h={6} color={STEEL} />
                <Box o={o} x={0} y={lane.y + 10} z={6.2} w={L} d={6} h={0.4} color={FEATURES[lane.f].color} />
              </g>
              {ST.map((x, s) => {
                const [cx, cy] = project(o, x, lane.y + 44, 0)
                return <ellipse key={s} className="station-ring" cx={cx} cy={cy} rx={24} ry={12} fill="none" stroke={FEATURES[lane.f].color} strokeWidth={3} opacity={s === STILL_AT[i] ? 1 : 0} />
              })}
              <g className="lane-item" data-feature={lane.f} transform={`translate(${sx} ${sy})`}>
                <WorkItem o={o} x={START} y={lane.y + 5} z={6} feature={lane.f} />
              </g>
              {ST.map((x, s) => {
                const y = lane.y + 44
                if (s === 0 || s === 2) return <g key={s} className={`col-${s} owner`}><Agent o={o} x={x} y={y} feature={lane.f} /></g>
                if (s === 4) return <g key={s} className={`col-${s}`}><Agent o={o} x={x - 13} y={y} /><Supervisor o={o} x={x + 13} y={y} /></g>
                if (s === 5) return <g key={s} className={`col-${s}`}><Box o={o} x={x - 12} y={y - 10} w={24} d={20} h={18} color={STEEL} /></g>
                return <g key={s} className={`col-${s}`}><Agent o={o} x={x} y={y} /></g>
              })}
            </g>
          )
        })}
        {wallX(L + 10)}
        <g className="out-link"><GroundLine o={o} x1={L + 30} y1={89} x2={L + 150} y2={89} color={HUMAN} /></g>

        {/* Labels: the steps along the back, the captions beside what they describe */}
        {STEPS.map((st, s) => <g key={s} className={`step-${s}`}><StepLabel o={o} x={ST[s]} y={14} z={86} n={s + 1} title={st.title} sub={st.sub} /></g>)}
        <g className="cap-gate"><Callout o={o} x={-34} y={13} z={18} text={CAPTIONS[0]} dx={-30} dy={-70} /></g>
        <g className="cap-lanes"><Callout o={o} x={380} y={215} z={0} text={CAPTIONS[1]} dx={-60} dy={90} /></g>
        <g className="cap-out"><Callout o={o} x={L + 120} y={89} z={1} text={CAPTIONS[2]} dx={20} dy={50} /></g>
      </svg>
      <ol className="scene-labels">{STEPS.map((st) => <li key={st.title}>{st.title}: {st.sub}</li>)}</ol>
      <ul className="scene-labels">{CAPTIONS.map((c) => <li key={c}>{c}</li>)}</ul>
    </div>
  )
}

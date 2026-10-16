import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Agent, Box, Callout, GroundLine, Person, WorkItem } from '../iso/shapes'
import { groundOffset, project, type Origin } from '../iso/project'
import { AI, AI_TOP, FEATURES, GRAPHITE, GROUND, HUMAN, PAPER, STEEL } from '../iso/palette'
import { makeLoops } from '../iso/loops'
import { grow, refreshPriority } from '../iso/motion'
import '../scenes.css'

const o: Origin = { x: 330, y: 120, k: 1.18 }
// The factory, in world units.
const F = { x: 330, y: 0, w: 240, d: 410 }
const TEAMS = [{ y: F.y + 30, feature: 0 as const, name: 'AI team, project A' }, { y: F.y + 180, feature: 2 as const, name: 'AI team, project B' }]
// The frame fitted to the drawing and its labels (measured with getBBox at 1440 px, plus a margin), fixed so the page never shifts.
const VIEWBOX = '-265 18 1631 767'
// You and your AI assistants, in the left corner of the ground: one helps you groom the features, one helps you supervise the factory.
const YOU = { x: 10, y: 330 }
const HELPER = { x: 58, y: 292 }
const SUPERVISING = { x: -26, y: 380 }
// The factory holds Deck and the AI teams: the Deck console stands inside, in front of the teams.
const DECK = { x: 352, y: 296, w: 116, d: 64, h: 26 }
// Drawn at 60% scale on the console's front edge.
const ROSTER = [{ x: DECK.x + 30, f: 0 as const }, { x: DECK.x + 58, f: 1 as const }, { x: DECK.x + 86, f: 2 as const }]
const ROSTER_SCALE = 0.6
// Paths, as [x1, y1, x2, y2] on the ground.
type Path = { x1: number; y1: number; x2: number; y2: number }
const GROOM_YOU: Path = { x1: YOU.x + 6, y1: YOU.y - 22, x2: 40, y2: 132 }
const GROOM_HELPER: Path = { x1: HELPER.x + 4, y1: HELPER.y - 24, x2: 110, y2: 132 }
const ROSTER_LINE: Path = { x1: YOU.x + 24, y1: YOU.y + 6, x2: DECK.x, y2: DECK.y + 34 }
const SUPERVISE_LINE: Path = { x1: SUPERVISING.x + 10, y1: SUPERVISING.y + 4, x2: DECK.x, y2: DECK.y + 56 }
// From Deck to each team, along the floor.
const RUN_LINES: Path[] = [{ x1: DECK.x + 5, y1: DECK.y, x2: DECK.x + 5, y2: 60 }, { x1: DECK.x + 115, y1: DECK.y, x2: DECK.x + 115, y2: 208 }]
const IN: Path = { x1: 150, y1: 46, x2: 330, y2: 46 }
const OUT: Path = { x1: 330, y1: 106, x2: 150, y2: 106 }

// Each part: a title, and what it is.
const PARTS = [
  ['GitHub', 'holds the features and finished work, outside the factory'],
  ['You (as the factory Director) and your AI assistants', 'own the features, prepare team rosters, perform factory supervision'],
  ['Deck', 'the factory infrastructure, team communication, production dashboard'],
  ['AI Teams', 'your selection of team roles, each with your selection of AI harnesses and AI models'],
] as const
const FLOWS = ['Ready features flow in', 'Finished work flows back'] as const

// The hero plays the story once on its own, in this many seconds; elsewhere scroll drives it.
const AUTO_SECONDS = 8

export default function OutsideScene({ play = 'scroll' }: { play?: 'scroll' | 'auto' }) {
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
      const tl = gsap.timeline(play === 'auto'
        ? { defaults: { ease: 'power2.out', duration: 0.1 }, paused: true }
        : { defaults: { ease: 'power2.out', duration: 0.1 },
            scrollTrigger: { trigger: root.current, start: 'top top', end: '+=150%', scrub: 0.6, pin: true, refreshPriority: refreshPriority(root.current!) } })
      const lp = (loops = makeLoops(root.current!, tl))
      // Beat 1: the ground and GitHub with its feature lists.
      tl.from(q('.b1-ground'), { opacity: 0, y: 12 }, 0)
        .from(q('.github'), { opacity: 0, y: 40, ease: 'back.out(1.4)' }, 0.04)
        .from(q('.b1-list'), { opacity: 0, y: -10, stagger: 0.03 }, 0.08)
        .from(q('.c1'), { opacity: 0 }, 0.12)
      // Beat 2: you and your AI helper groom the features in GitHub.
        .from(q('.b2-you'), { opacity: 0, y: 20 }, 0.15)
        .from(q('.helper, .supervising'), { ...pop, stagger: 0.02 }, 0.18)
        .add(grow(q('.groom-link line')), 0.21)
        .from(q('.c2'), { opacity: 0 }, 0.27)
      // Beat 3: the factory, with the Supervisor and Deck inside it.
        .from(q('.b4-floor'), { opacity: 0 }, 0.3)
        .from(q('.b4-wall'), { opacity: 0, y: 14, ease: 'power3.out', stagger: 0.02 }, 0.31)
        .from(q('.deck'), { opacity: 0, y: 24 }, 0.34)
      // Beat 4: in Deck, you choose the AI team roster.
        .add(grow(q('.roster-link line, .supervise-link line')), 0.41)
        .from(q('.roster [data-role="agent"]'), { ...pop, stagger: 0.03 }, 0.44)
        .from(q('.b3-screen'), { opacity: 0.2 }, 0.48)
        .from(q('.c3'), { opacity: 0 }, 0.49)
      // Beat 5: Deck runs your AI teams.
        .from(q('.b4-agent'), { ...pop, stagger: 0.02 }, 0.52)
        .add(grow(q('.run-link line')), 0.56)
        .from(q('.c4'), { opacity: 0 }, 0.58)
      // Beats 6 and 7: features flow in, finished work flows back.
        .add(grow(q('.b5-link line')), 0.62)
        .from(q('.c5'), { opacity: 0 }, 0.7)
        .add(grow(q('.b6-link line')), 0.8)
        .from(q('.c6'), { opacity: 0 }, 0.88)
        .to({}, { duration: 0.02 }, 0.98)
      // Items travel along their paths on their own once their beat is reached.
      const move = (sel: string, p: Path, from: number) => {
        const [dx, dy] = groundOffset(o, p.x2 - p.x1, p.y2 - p.y1)
        q(sel).forEach((el, i) => {
          gsap.set(el, { opacity: 0 })
          lp.add(gsap.fromTo(el, { x: 0, y: 0, opacity: 0 }, {
            keyframes: [{ opacity: 1, duration: 0.5 }, { x: dx, y: dy, duration: 3.2, ease: 'none' }, { opacity: 0, duration: 0.5 }],
            repeat: -1, delay: i * 1.4, paused: true,
          }), from, el)
        })
      }
      move('.groom-you-item', GROOM_YOU, 0.27)
      move('.groom-helper-item', GROOM_HELPER, 0.27)
      move('.b5-item', IN, 0.62)
      move('.b6-item', OUT, 0.8)
      if (play === 'auto') {
        tl.timeScale(1 / AUTO_SECONDS)
        ScrollTrigger.create({ trigger: root.current, start: 'top 80%', once: true, refreshPriority: refreshPriority(root.current!), onEnter: () => tl.play() })
      }
    }, root)
    // Scenes load in any order; a pinned scene adds space above the ones below it, so every trigger is measured again, top to bottom.
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    return () => { loops?.kill(); ctx.revert() }
  }, [play])

  const line = (p: Path, color: string) => <GroundLine o={o} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} color={color} />
  return (
    <div ref={root} className="scene" data-scene="outside" data-play={play} data-state={state}>
      <svg viewBox={VIEWBOX} role="img" aria-label="The factory from outside. GitHub holds the features and finished work, outside the factory. You, as the factory Director, and your AI assistants own the features, prepare the team rosters in Deck and supervise the factory. Inside the factory, Deck is the factory infrastructure, the team communication and the production dashboard, and runs your AI teams: your selection of team roles, each with your selection of AI harnesses and AI models. Ready features flow into the factory, and finished work flows back to GitHub.">
        <g className="b1-ground"><Box o={o} x={-40} y={-40} z={-12} w={650} d={500} h={12} color={GROUND} /></g>

        {/* GitHub, a system that holds the feature lists */}
        <g className="github">
          <Box o={o} x={0} y={0} w={150} d={130} h={46} color="#33434B" />
          {[16, 56, 96].map((y, i) => <g key={y} className="b1-list"><Box o={o} x={18} y={y} z={46} w={112} d={22} h={4} color={i === 0 ? PAPER : '#C9D3D8'} /></g>)}
        </g>

        {/* You and your AI helper groom the features */}
        <g className="groom-link">{line(GROOM_YOU, HUMAN)}</g>
        <g className="groom-link">{line(GROOM_HELPER, AI)}</g>
        {[0, 1].map((i) => <g key={'gy' + i} className="groom-you-item"><WorkItem o={o} x={GROOM_YOU.x1 - 11} y={GROOM_YOU.y1 - 8} z={1} /></g>)}
        {[0, 1].map((i) => <g key={'gh' + i} className="groom-helper-item"><WorkItem o={o} x={GROOM_HELPER.x1 - 11} y={GROOM_HELPER.y1 - 8} z={1} feature={i === 0 ? 1 : 0} /></g>)}
        <g className="b2-you"><Person o={o} x={YOU.x} y={YOU.y} /></g>
        <g className="helper"><Agent o={o} x={HELPER.x} y={HELPER.y} /></g>
        <g className="supervising"><Agent o={o} x={SUPERVISING.x} y={SUPERVISING.y} /></g>

        {/* The factory: Deck, the Supervisor and several AI teams */}
        <g className="b4-floor"><Box o={o} x={F.x} y={F.y} w={F.w} d={F.d} h={4} color="#E9EEF0" /></g>
        <g className="roster-link">{line(ROSTER_LINE, HUMAN)}</g>
        <g className="supervise-link">{line(SUPERVISE_LINE, AI)}</g>
        <g className="run-link">{RUN_LINES.map((p, i) => <g key={i}>{line(p, GRAPHITE)}</g>)}</g>
        <g className="b4-wall"><Box o={o} x={F.x} y={F.y} z={4} w={F.w} d={8} h={12} color={STEEL} /></g>
        <g className="b4-wall"><Box o={o} x={F.x} y={F.y} z={4} w={8} d={F.d} h={12} color={STEEL} /></g>
        {TEAMS.map((t) => (
          <g key={t.name}>
            <g className="b4-floor">
              <Box o={o} x={F.x + 30} y={t.y} z={4} w={170} d={16} h={5} color={STEEL} />
              <Box o={o} x={F.x + 30} y={t.y + 6} z={9.2} w={170} d={4} h={0.4} color={FEATURES[t.feature].color} />
            </g>
            {[70, 120, 170].map((ax) => <g key={ax} className="b4-agent"><Agent o={o} x={F.x + ax - 10} y={t.y + 40} feature={t.feature} /></g>)}
          </g>
        ))}
        {/* Deck, the console where you choose the AI team roster, and the Supervisor */}
        <g className="deck">
          <Box o={o} x={DECK.x} y={DECK.y} w={DECK.w} d={DECK.d} h={DECK.h} color={STEEL} />
          <Box o={o} x={DECK.x + 16} y={DECK.y + 6} z={DECK.h} w={84} d={10} h={26} color={GRAPHITE} />
          <g className="b3-screen"><Box o={o} x={DECK.x + 20} y={DECK.y + 8} z={DECK.h + 4} w={76} d={2} h={18} color={AI_TOP} /></g>
          <g className="roster">{ROSTER.map((r) => {
            const [cx, cy] = project(o, r.x, DECK.y + 58, DECK.h)
            return <g key={r.x} transform={`translate(${cx} ${cy}) scale(${ROSTER_SCALE}) translate(${-cx} ${-cy})`}><Agent o={o} x={r.x} y={DECK.y + 58} z={DECK.h} feature={r.f} /></g>
          })}</g>
        </g>

        <g className="b4-wall"><Box o={o} x={F.x} y={F.y + F.d - 8} z={4} w={F.w} d={8} h={12} color="#B7C4CA" /></g>
        <g className="b4-wall"><Box o={o} x={F.x + F.w - 8} y={F.y} z={4} w={8} d={F.d} h={12} color="#B7C4CA" /></g>

        {/* The flows */}
        <g className="b5-link">{line({ ...IN, y1: 40, y2: 40 }, AI)}</g>
        <g className="b6-link">{line({ ...OUT, y1: 100, y2: 100 }, HUMAN)}</g>
        {[0, 1, 2].map((i) => <g key={'in' + i} className="b5-item"><WorkItem o={o} x={IN.x1} y={IN.y1 - 6} z={1} feature={i === 1 ? 2 : 0} /></g>)}
        {[0, 1, 2].map((i) => <g key={'out' + i} className="b6-item"><WorkItem o={o} x={OUT.x1} y={OUT.y1 - 6} z={1} /></g>)}

        {/* Labels, beside their objects */}
        <g className="c1"><Callout o={o} x={0} y={60} z={46} text={PARTS[0][0]} sub={PARTS[0][1]} n={1} dx={-60} dy={-60} /></g>
        <g className="c2"><Callout o={o} x={YOU.x} y={YOU.y} z={40} text={PARTS[1][0]} sub={PARTS[1][1]} n={2} dx={-250} dy={-130} anchor="start" /></g>
        <g className="c3"><Callout o={o} x={DECK.x} y={DECK.y + DECK.d} z={DECK.h} text={PARTS[2][0]} sub={PARTS[2][1]} n={3} dx={-118} dy={186} anchor="start" /></g>
        <g className="c4"><Callout o={o} x={F.x + F.w} y={F.y + 120} z={16} text={PARTS[3][0]} sub={PARTS[3][1]} n={4} dx={30} dy={-10} /></g>
        {TEAMS.map((t) => <g key={'l' + t.name} className="c4"><Callout o={o} x={F.x + 200} y={t.y + 8} z={9} text={t.name} dx={16} dy={18} small /></g>)}
        <g className="c5"><Callout o={o} x={250} y={40} z={2} text={FLOWS[0]} n={5} dx={10} dy={-56} small /></g>
        <g className="c6"><Callout o={o} x={250} y={100} z={2} text={FLOWS[1]} n={6} dx={70} dy={46} small /></g>
      </svg>
      <ol className="scene-labels">
        {PARTS.map(([t, d]) => <li key={t}>{t}: {d}</li>)}
        {FLOWS.map((f) => <li key={f}>{f}</li>)}
      </ol>
    </div>
  )
}

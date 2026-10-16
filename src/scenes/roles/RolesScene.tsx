import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Agent, Box, Callout, Person, SplitDefs, Supervisor, WorkItem } from '../iso/shapes'
import { project, type Origin } from '../iso/project'
import { AI_TOP, FEATURES, GRAPHITE, GROUND, HUMAN, PAPER, STEEL, type Feature } from '../iso/palette'
import { makeLoops } from '../iso/loops'
import { grow, refreshPriority } from '../iso/motion'
import '../scenes.css'

const o: Origin = { x: 600, y: 120, k: 1 }
// The frame fitted to the drawing and its labels (measured with getBBox at 1440 px, plus a margin), fixed so the page never shifts.
const VIEWBOX = '-224 -90 1401 767'
// Places are given as u (across the screen) and v (down the screen): world x = v + u, y = v - u.
const at = (u: number, v: number) => ({ x: v + u, y: v - u })
// Each level stands on a platform; the higher the level, the higher and further back it stands.
const YOU = { u: 0, v: 0, z: 48 }
const SUP = { u: 0, v: 92, z: 32 }
const LEADERS: { u: number; f: Feature }[] = [{ u: -112, f: 0 }, { u: 0, f: 1 }, { u: 112, f: 2 }]
const LEADER_V = 192, LEADER_Z = 16, MEMBER_V = 292
// Under each Leader: two agent owners and an AI reviewer.
const MEMBERS = [{ du: -36, role: 'owner' }, { du: 0, role: 'owner' }, { du: 36, role: 'reviewer' }] as const
// Deck sits below the teams it runs.
const DECK = { u: 0, v: 400 }
const GITHUB = { u: -300, v: 30 }
const ROLES = [
  ['You, the Director', 'writes the features, marks them ready, chooses the roster'],
  ['Supervisor', 'an AI agent or a person; watches every team, checks the work before it merges'],
  ['AI Leaders', 'one per team; approve the plans, check the work'],
  ['Agent owners', 'plan and build one feature each'],
  ['AI reviewers', 'check the work'],
  ['Deck', 'runs the teams'],
  ['GitHub', 'holds the features and the merged work'],
] as const
// Where each team's feature waits in the still frame: at an owner, at its Leader, and back at the Supervisor.
const STILL_AT = [3, 2, 6]
// At pace 1, in seconds: the move between two people and the stay with each; the owners take longer, they build.
const MOVE = 0.7, HOLD = 0.6, BUILD = 1.4
const PACE = [1, 1.2, 0.9]

const head = (p: { u: number; v: number; z: number }) => { const w = at(p.u, p.v); return project(o, w.x, w.y, p.z + 46) }
const feet = (p: { u: number; v: number; z: number }) => { const w = at(p.u, p.v); return project(o, w.x, w.y, p.z) }
const leader = (i: number) => ({ u: LEADERS[i].u, v: LEADER_V, z: LEADER_Z })
const member = (i: number, m: number) => ({ u: LEADERS[i].u + MEMBERS[m].du, v: MEMBER_V, z: 0 })
// Where a feature card floats: beside the person holding it.
const cardAt = (p: { u: number; v: number; z: number }) => { const [x, y] = head(p); return [x + 30, y + 8] as [number, number] }
// Each team's feature: down from you to an agent owner, then back up for the checks, and out to GitHub.
const route = (i: number) => [cardAt(YOU), cardAt(SUP), cardAt(leader(i)), cardAt(member(i, i === 1 ? 1 : 0)), cardAt(member(i, 2)), cardAt(leader(i)), cardAt(SUP), (() => { const w = at(GITHUB.u, GITHUB.v); const [x, y] = project(o, w.x + 30, w.y + 30, 50); return [x, y - 20] as [number, number] })()]

/** A dashed line between two screen points. */
const Link = ({ a, b, color = GRAPHITE }: { a: [number, number]; b: [number, number]; color?: string }) => (
  <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={2.5} strokeDasharray="2 7" strokeLinecap="round" />
)
const Platform = ({ p, h, stripe }: { p: { u: number; v: number }; h: number; stripe?: string }) => {
  const w = at(p.u, p.v)
  return (
    <g>
      <Box o={o} x={w.x - 26} y={w.y - 26} w={52} d={52} h={h} color={STEEL} />
      {stripe && <Box o={o} x={w.x - 26} y={w.y + 20} z={h} w={52} d={6} h={0.6} color={stripe} />}
    </g>
  )
}

export default function RolesScene() {
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
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=150%', scrub: 0.6, pin: true, refreshPriority: refreshPriority(root.current!) },
      })
      const lp = (loops = makeLoops(root.current!, tl))
      // Beat 1: you, on the top platform, and GitHub, where you write the features.
      tl.from(q('.ground'), { opacity: 0 }, 0)
        .from(q('.level-0'), { opacity: 0, y: 24 }, 0.02)
        .from(q('.r1'), { opacity: 0 }, 0.08)
        .from(q('.github'), { opacity: 0, y: 20 }, 0.06)
        .add(grow(q('.github-link line')), 0.1)
        .from(q('.r7'), { opacity: 0 }, 0.12)
      // Beat 2: the Supervisor, who answers to you.
        .from(q('.level-1'), { opacity: 0, y: 24 }, 0.16)
        .add(grow(q('.reports-1 line')), 0.2)
        .from(q('.r2'), { opacity: 0 }, 0.24)
      // Beat 3: an AI Leader per team, under the Supervisor; Deck runs the teams.
        .from(q('.level-2'), { ...pop, stagger: 0.03 }, 0.3)
        .add(grow(q('.reports-2 line')), 0.36)
        .from(q('.r3'), { opacity: 0 }, 0.4)
        .from(q('.deck'), { opacity: 0, y: 20 }, 0.4)
        .add(grow(q('.deck-link line')), 0.44)
        .from(q('.r6'), { opacity: 0 }, 0.47)
      // Beat 4: each Leader's agent owners and AI reviewer.
        .from(q('.level-3'), { ...pop, stagger: 0.012 }, 0.5)
        .add(grow(q('.reports-3 line')), 0.56)
        .from(q('.r4, .r5'), { opacity: 0 }, 0.6)
        .to({}, { duration: 0.02 }, 0.98)

      // Beat 5: each team's feature goes down to an agent owner, then back up for the checks, at the team's pace.
      LEADERS.forEach((_, i) => {
        const card = q(`.team-${i} .card`)[0], pts = route(i)
        gsap.set(card, { opacity: 0 })
        const t = gsap.timeline({ repeat: -1, paused: true, delay: i * 2.2 })
        t.set(card, { x: 0, y: 0, opacity: 0 }).to(card, { opacity: 1, duration: 0.4, ease: 'none' })
        pts.slice(1).forEach(([x, y], k) => {
          t.to(card, { x: x - pts[0][0], y: y - pts[0][1], duration: MOVE * PACE[i], ease: 'power1.inOut' })
            .to({}, { duration: (k === 2 ? BUILD : HOLD) * PACE[i] })
        })
        t.to(card, { opacity: 0, duration: 0.4, ease: 'none' }, '-=0.4')
        lp.add(t, 0.64, card)
      })
    }, root)
    // Scenes load in any order; a pinned scene adds space above the ones below it, so every trigger is measured again, top to bottom.
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    return () => { loops?.kill(); ctx.revert() }
  }, [])

  const gh = at(GITHUB.u, GITHUB.v), dk = at(DECK.u, DECK.v)
  const deckBase = project(o, dk.x + 20, dk.y + 20, 0)
  return (
    <div ref={root} className="scene" data-scene="roles" data-state={state}>
      <svg viewBox={VIEWBOX} role="img" aria-label="Who does what. At the top, you, the Director, write the features in GitHub, mark them ready and choose the roster. Below you, the Supervisor, an AI agent or a person, watches every team and checks the work before it merges. Below the Supervisor, an AI Leader for each team approves the plans and checks the work. Under each Leader, two agent owners plan and build one feature each, and an AI reviewer checks the work. Deck, a system, runs the teams; GitHub holds the features and the merged work. Each feature goes down to an agent owner and comes back up for the checks.">
        <SplitDefs />
        <g className="ground"><Box o={o} x={-250} y={-130} z={-12} w={740} d={600} h={12} color={GROUND} /></g>
        {/* Deck's lines run along the floor, under the platforms, to each team */}
        <g className="deck-link">{LEADERS.map((_, i) => <Link key={i} a={deckBase} b={feet({ u: LEADERS[i].u, v: MEMBER_V + 22, z: 0 })} />)}</g>

        {/* GitHub, beside you */}
        <g className="github">
          <Box o={o} x={gh.x} y={gh.y} w={70} d={60} h={30} color="#33434B" />
          {[8, 26, 44].map((dy, i) => <Box key={dy} o={o} x={gh.x + 8} y={gh.y + dy} z={30} w={54} d={10} h={3} color={i === 0 ? PAPER : '#C9D3D8'} />)}
        </g>
        <g className="github-link"><Link a={feet(YOU)} b={project(o, gh.x + 70, gh.y + 30, 30)} color={HUMAN} /></g>

        {/* The levels, from the back (the top) to the front */}
        <g className="level-0"><Platform p={YOU} h={YOU.z} /><Person o={o} {...at(YOU.u, YOU.v)} z={YOU.z} /></g>
        <g className="reports reports-1"><Link a={feet(YOU)} b={head(SUP)} /></g>
        <g className="level-1"><Platform p={SUP} h={SUP.z} /><Supervisor o={o} {...at(SUP.u, SUP.v)} z={SUP.z} /></g>
        <g className="reports reports-2">{LEADERS.map((_, i) => <Link key={i} a={feet(SUP)} b={head(leader(i))} />)}</g>
        {LEADERS.map((l, i) => (
          <g key={i} className={`team-${i}`}>
            <g className="level-2 leader"><Platform p={leader(i)} h={LEADER_Z} stripe={FEATURES[l.f].color} /><Agent o={o} {...at(l.u, LEADER_V)} z={LEADER_Z} /></g>
            <g className="reports reports-3">{MEMBERS.map((_, m) => <Link key={m} a={feet(leader(i))} b={head(member(i, m))} />)}</g>
            {MEMBERS.map((m, k) => (
              <g key={k} className={`level-3 ${m.role}`}><Agent o={o} {...at(l.u + m.du, MEMBER_V)} feature={m.role === 'owner' ? l.f : undefined} /></g>
            ))}
          </g>
        ))}

        {/* Deck, the system that runs the teams */}
        <g className="deck">
          <Box o={o} x={dk.x} y={dk.y} w={100} d={64} h={24} color={STEEL} />
          <Box o={o} x={dk.x + 14} y={dk.y + 6} z={24} w={72} d={9} h={28} color={GRAPHITE} />
          <Box o={o} x={dk.x + 18} y={dk.y + 8} z={28} w={64} d={2} h={20} color={AI_TOP} />
        </g>

        {/* The features, one per team */}
        {LEADERS.map((l, i) => {
          const pts = route(i), [sx, sy] = [pts[STILL_AT[i]][0] - pts[0][0], pts[STILL_AT[i]][1] - pts[0][1]]
          const w = at(YOU.u, YOU.v), [cx, cy] = project(o, w.x, w.y, 0), [px, py] = pts[0]
          return (
            <g key={i} className={`team-${i}`}>
              <g className="card" transform={`translate(${sx} ${sy})`}>
                <g transform={`translate(${px - cx} ${py - cy})`}><WorkItem o={o} x={w.x - 11} y={w.y - 8} z={0} feature={l.f} /></g>
              </g>
            </g>
          )
        })}

        {/* Labels: each role and what it does */}
        <g className="r1"><Callout o={o} {...at(YOU.u, YOU.v)} z={YOU.z + 46} text={ROLES[0][0]} sub={ROLES[0][1]} n={1} dx={44} dy={-40} /></g>
        <g className="r2"><Callout o={o} {...at(SUP.u, SUP.v)} z={SUP.z + 40} text={ROLES[1][0]} sub={ROLES[1][1]} n={2} dx={60} dy={-30} /></g>
        <g className="r3"><Callout o={o} {...at(LEADERS[0].u, LEADER_V)} z={LEADER_Z + 40} text={ROLES[2][0]} sub={ROLES[2][1]} n={3} dx={-60} dy={-40} /></g>
        <g className="r4"><Callout o={o} {...at(LEADERS[0].u + MEMBERS[0].du, MEMBER_V)} z={0} text={ROLES[3][0]} sub={ROLES[3][1]} n={4} dx={-30} dy={46} /></g>
        <g className="r5"><Callout o={o} {...at(LEADERS[2].u + MEMBERS[2].du, MEMBER_V)} z={0} text={ROLES[4][0]} sub={ROLES[4][1]} n={5} dx={30} dy={46} /></g>
        <g className="r6"><Callout o={o} x={dk.x + 100} y={dk.y + 64} z={0} text={ROLES[5][0]} sub={ROLES[5][1]} n={6} dx={30} dy={20} /></g>
        <g className="r7"><Callout o={o} x={gh.x} y={gh.y} z={30} text={ROLES[6][0]} sub={ROLES[6][1]} n={7} dx={-30} dy={-60} /></g>
      </svg>
      <ol className="scene-labels">{ROLES.map(([t, d]) => <li key={t}>{t}: {d}</li>)}</ol>
    </div>
  )
}

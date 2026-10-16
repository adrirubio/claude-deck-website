import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Agent, Box, Callout, GroundLine, Person, WorkItem } from '../iso/shapes'
import { groundOffset, type Origin } from '../iso/project'
import { AI, AI_TOP, FEATURES, GRAPHITE, GROUND, HUMAN, PAPER, STEEL } from '../iso/palette'
import { fitViewBox } from '../iso/fit'
import '../scenes.css'

const o: Origin = { x: 330, y: 120, k: 1.18 }
// The factory, in world units.
const F = { x: 330, y: 0, w: 230, d: 330 }
const TEAMS = [{ y: F.y + 30, feature: 0 as const, name: 'AI team, project A' }, { y: F.y + 180, feature: 2 as const, name: 'AI team, project B' }]
const IN = { x1: 150, y1: 46, x2: 330, y2: 46 }
const OUT = { x1: 330, y1: 106, x2: 150, y2: 106 }

export default function OutsideScene() {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<'still' | 'animated'>('still')

  useEffect(() => {
    if (!svg.current || !root.current) return
    fitViewBox(svg.current)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)
    setState('animated')
    const q = gsap.utils.selector(root.current)
    const loops: gsap.core.Tween[] = []
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.1 },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=150%', scrub: 0.6, pin: true },
      })
      // Beat 1: the ground and GitHub with its feature lists.
      tl.from(q('.b1-ground'), { opacity: 0, y: 12 }, 0)
        .from(q('.b1-github'), { opacity: 0, y: 40, ease: 'back.out(1.4)' }, 0.04)
        .from(q('.b1-list'), { opacity: 0, y: -10, stagger: 0.03 }, 0.08)
        .from(q('.c1'), { opacity: 0 }, 0.12)
      // Beat 2: the AI helper prepares a list.
        .from(q('.b2-helper'), { opacity: 0, scale: 0.6, transformOrigin: '50% 100%', ease: 'back.out(2)' }, 0.15)
        .from(q('.b2-link'), { drawSVG: '0%', ease: 'none' }, 0.2)
        .from(q('.c2'), { opacity: 0 }, 0.26)
      // Beat 3: you, the Director.
        .from(q('.b3-person'), { opacity: 0, y: 20 }, 0.3)
        .from(q('.b3-link'), { drawSVG: '0%', ease: 'none', stagger: 0.03 }, 0.35)
        .from(q('.c3'), { opacity: 0 }, 0.41)
      // Beat 4: Deck lights up; the factory and its AI teams appear.
        .from(q('.b4-screen'), { opacity: 0.2 }, 0.45)
        .from(q('.b4-floor'), { opacity: 0 }, 0.47)
        .from(q('.b4-wall'), { opacity: 0, y: 14, ease: 'power3.out', stagger: 0.02 }, 0.49)
        .from(q('.b4-agent'), { opacity: 0, scale: 0.6, transformOrigin: '50% 100%', ease: 'back.out(2)', stagger: 0.02 }, 0.52)
        .from(q('.b4-link'), { drawSVG: '0%', ease: 'none' }, 0.56)
        .from(q('.c4'), { opacity: 0 }, 0.58)
      // Beats 5 and 6: features flow in, finished work flows back.
        .from(q('.b5-link'), { drawSVG: '0%', ease: 'none' }, 0.62)
        .from(q('.c5'), { opacity: 0 }, 0.7)
        .from(q('.b6-link'), { drawSVG: '0%', ease: 'none' }, 0.8)
        .from(q('.c6'), { opacity: 0 }, 0.88)
        .to({}, { duration: 0.02 }, 0.98)
      // The flows loop on their own once beat 5 is reached.
      const move = (sel: string, p: typeof IN) => {
        const [dx, dy] = groundOffset(o, p.x2 - p.x1, p.y2 - p.y1)
        q(sel).forEach((el, i) => {
          gsap.set(el, { opacity: 0 })
          loops.push(gsap.fromTo(el, { x: 0, y: 0, opacity: 0 }, {
            keyframes: [{ opacity: 1, duration: 0.5 }, { x: dx, y: dy, duration: 3.2, ease: 'none' }, { opacity: 0, duration: 0.5 }],
            repeat: -1, delay: i * 1.4, paused: true,
          }))
        })
      }
      move('.b5-item', IN)
      move('.b6-item', OUT)
      tl.eventCallback('onUpdate', () => {
        const on = tl.progress() > 0.62
        loops.forEach((t) => (on ? t.play() : t.pause()))
      })
    }, root)
    return () => { loops.forEach((t) => t.kill()); ctx.revert() }
  }, [])

  return (
    <div ref={root} className="scene" data-scene="outside" data-state={state}>
      <svg ref={svg} viewBox="-30 40 760 560" role="img" aria-label="The factory from outside. You and your AI helper prepare your features in GitHub. You set up and run your AI teams in Deck. Ready features flow into the factory, where several AI teams work, and finished work flows back to GitHub.">
        <g className="b1-ground"><Box o={o} x={-40} y={-40} z={-12} w={640} d={420} h={12} color={GROUND} /></g>

        {/* GitHub, a system that holds the feature lists */}
        <g className="b1-github">
          <Box o={o} x={0} y={0} w={150} d={130} h={46} color="#33434B" />
          {[16, 56, 96].map((y, i) => <g key={y} className="b1-list"><Box o={o} x={18} y={y} z={46} w={112} d={22} h={4} color={i === 0 ? PAPER : '#C9D3D8'} /></g>)}
        </g>
        <g className="b2-link"><GroundLine o={o} x1={70} y1={170} x2={70} y2={130} color={AI} /></g>
        <g className="b2-helper"><Agent o={o} x={40} y={190} /></g>

        {/* Deck, the console where you set up and run the AI teams */}
        <Box o={o} x={170} y={270} w={90} d={60} h={26} color={STEEL} />
        <Box o={o} x={182} y={278} z={26} w={66} d={10} h={26} color={GRAPHITE} />
        <g className="b4-screen"><Box o={o} x={186} y={280} z={30} w={58} d={2} h={18} color={AI_TOP} /></g>

        {/* You, the Director */}
        <g className="b3-link"><GroundLine o={o} x1={200} y1={230} x2={200} y2={270} color={HUMAN} /></g>
        <g className="b3-link"><GroundLine o={o} x1={190} y1={200} x2={150} y2={130} color={HUMAN} /></g>
        <g className="b3-person"><Person o={o} x={200} y={210} /></g>

        {/* The factory, with several AI teams */}
        <g className="b4-floor"><Box o={o} x={F.x} y={F.y} w={F.w} d={F.d} h={4} color="#E9EEF0" /></g>
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
        <g className="b4-wall"><Box o={o} x={F.x} y={F.y + F.d - 8} z={4} w={F.w} d={8} h={12} color="#B7C4CA" /></g>
        <g className="b4-wall"><Box o={o} x={F.x + F.w - 8} y={F.y} z={4} w={8} d={F.d} h={12} color="#B7C4CA" /></g>
        <g className="b4-link"><GroundLine o={o} x1={260} y1={300} x2={330} y2={300} color={GRAPHITE} /></g>

        {/* The flows */}
        <g className="b5-link"><GroundLine o={o} x1={IN.x1} y1={40} x2={IN.x2} y2={40} color={AI} /></g>
        <g className="b6-link"><GroundLine o={o} x1={OUT.x1} y1={100} x2={OUT.x2} y2={100} color={HUMAN} /></g>
        {[0, 1, 2].map((i) => <g key={'in' + i} className="b5-item"><WorkItem o={o} x={IN.x1} y={IN.y1 - 6} z={1} feature={i === 1 ? 2 : 0} /></g>)}
        {[0, 1, 2].map((i) => <g key={'out' + i} className="b6-item"><WorkItem o={o} x={OUT.x1} y={OUT.y1 - 6} z={1} /></g>)}

        {/* Labels, beside their objects */}
        <g className="c1"><Callout o={o} x={0} y={60} z={46} text="GitHub holds your feature lists" dx={-60} dy={-40} /></g>
        <g className="c2"><Callout o={o} x={32} y={190} z={40} text="Your AI helper prepares them" dx={-70} dy={10} /></g>
        <g className="c3"><Callout o={o} x={192} y={212} z={40} text="You, the Director" dx={-150} dy={-30} /></g>
        <g className="c4"><Callout o={o} x={170} y={300} z={14} text="Deck sets up and runs your AI teams" dx={-50} dy={40} /></g>
        <g className="c4"><Callout o={o} x={F.x + F.w} y={F.y} z={16} text="The factory: several AI teams at work" dx={20} dy={-50} /></g>
        {TEAMS.map((t) => <g key={'l' + t.name} className="c4"><Callout o={o} x={F.x + 200} y={t.y + 8} z={9} text={t.name} dx={16} dy={18} small /></g>)}
        <g className="c5"><Callout o={o} x={250} y={40} z={2} text="Ready features flow in" dx={10} dy={-56} small /></g>
        <g className="c6"><Callout o={o} x={250} y={100} z={2} text="Finished work flows back" dx={70} dy={46} small /></g>
      </svg>
    </div>
  )
}

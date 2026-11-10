// Synth City signal works at blue hour (v7).
// Three feature parcels move along one straight production line through
// Plan, Build, Review and Verify. Each parcel is escorted by one agent at a
// time; team-mates work singly in other halls. Finished parcels alone ride
// the goods hoist and freight rail back to GitHub. The Director supervises
// from a control room, wired to every hall by straight conduit runs.
//
// mountStreet(svg, opts) draws the scene into an <svg>:
//   opts.prefix    unique id prefix, so several scenes can share a page
//   opts.still     a still moment: an array of per-team loop seconds, or one
//                  number of seconds into the shared story clock
//   opts.viewBox   a fixed crop; without it, phones get the control end
//   opts.viewBoxFor(isPhone)  crop chosen by the caller, wins over viewBox
//   opts.button    the Pause/Play button, for the animated scene
//   opts.onStep(n) called with 0-4 (Plan, Build, Review, Verify, Merged)
//                  as the followed (blue) parcel reaches each stage
//   opts.animate   false for a still that never plays
export function mountStreet(svg, opts = {}) {
  const NS = 'http://www.w3.org/2000/svg'
  const PFX = opts.prefix || 'st'
  const el = (tag, attrs = {}, parent = svg) => {
    const e = document.createElementNS(NS, tag)
    for (const k in attrs) e.setAttribute(k, attrs[k])
    parent.appendChild(e)
    return e
  }
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const clamp01 = v => Math.max(0, Math.min(1, v))
  const ease = u => u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2
  const lerp = (a, b, u) => a + (b - a) * u

  // Transit enamel, plus the role colours. Flat fills only, apart from the sky.
  const INK = '#101A26', SLATE = '#3D5A80', DUSK = '#5B7896', HORIZON = '#E9B98A'
  const VERM = '#E4572E', SODIUM = '#F5C77A', PAPER = '#F7F5F0'
  const TEAL = '#14B8A6', TEAL_DK = '#0F766E'
  const AMBER = '#F59E0B', AMBER_LT = '#FCD34D', AMBER_DK = '#B45309'
  const C = Object.assign({
    sky: ['#16243A', '#2C4766', '#5B7896', '#E9B98A'], skyline: ['#1F3350', '#26405F'],
    warm: SODIUM, cool: '#BFD6E8', darkWin: '#1A2A3F', pavement: '#4B5F78', road: '#141F2C',
    lane: HORIZON, walls: ['#34506F', SLATE], cornice: '#4E6C92', frame: INK,
    hallLight: '#F6DDB4', conduit: '#8FA6BC', conduitDark: '#31465F',
    glass: 'rgba(191,214,232,.10)', glassStroke: 'rgba(191,214,232,.40)',
    pillar: '#4A6283', rail: '#56708F', steel: '#7D8C96', steelLt: '#B8C4CC', steelDk: '#55636D',
  }, opts.palette || {})
  const FEATURES = [
    { name: 'blue', c: '#60A5FA' },
    { name: 'lime', c: '#A3E635' },
    { name: 'rose', c: '#FB7185' },
  ]
  const STREET_Y = 440, RAIL_Y = 158, TRUNK_Y = 216, HOIST_X = 992, GH_X = 95
  const BENCH_Y = 408, WAGON_Y = 190, START_X = 132
  const HALL_NAMES = ['Plan', 'Build', 'Review', 'Verify']
  const HALL_X = [192, 388, 584, 780], HALL_W = 178

  // ---------- Static scene ----------
  const defs = el('defs')
  defs.innerHTML = `
    <linearGradient id="${PFX}sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.sky[0]}"/><stop offset=".5" stop-color="${C.sky[1]}"/>
      <stop offset=".8" stop-color="${C.sky[2]}"/><stop offset="1" stop-color="${C.sky[3]}"/></linearGradient>`
  el('rect', { width: 1200, height: 500, fill: `url(#${PFX}sky)` })

  // Two layers of distant skyline.
  for (const [colour, op, minH, maxH, winP] of [[C.skyline[0], 0.5, 90, 230, 0.08], [C.skyline[1], 0.85, 60, 170, 0.14]]) {
    let x = -10
    while (x < 1210) {
      const w = 26 + rnd() * 50, h = minH + rnd() * (maxH - minH)
      el('rect', { x, y: STREET_Y - h, width: w, height: h, fill: colour, opacity: op })
      for (let wy = STREET_Y - h + 8; wy < STREET_Y - 10; wy += 10)
        for (let wx = x + 5; wx < x + w - 5; wx += 8)
          if (rnd() < winP) el('rect', { x: wx, y: wy, width: 2.5, height: 4, fill: rnd() < 0.6 ? C.warm : C.cool, opacity: 0.55 })
      x += w + 3 + rnd() * 10
    }
  }

  // Pavement, two agent lanes, and road.
  el('rect', { x: 0, y: STREET_Y - 2, width: 1200, height: 16, fill: C.pavement })
  el('rect', { x: 0, y: STREET_Y + 14, width: 1200, height: 46, fill: C.road })
  el('line', { x1: 0, y1: 432, x2: 1200, y2: 432, stroke: C.cool, 'stroke-width': 1, opacity: 0.25 })
  el('line', { x1: 0, y1: 450, x2: 1200, y2: 450, stroke: C.cool, 'stroke-width': 1, opacity: 0.18 })
  for (let x = 10; x < 1200; x += 70) el('rect', { x, y: STREET_Y + 36, width: 34, height: 3, fill: C.lane, opacity: 0.35 })

  // Freight rail: goods only. Hanging carriers run back to GitHub.
  for (let x = 180; x < 1010; x += 160) el('rect', { x: x - 2, y: RAIL_Y, width: 4, height: 232 - RAIL_Y, fill: C.pillar })
  el('rect', { x: 40, y: RAIL_Y - 3, width: 975, height: 5, fill: C.rail })
  el('line', { x1: 40, y1: RAIL_Y - 1, x2: 1015, y2: RAIL_Y - 1, stroke: VERM, 'stroke-width': 2.5 })

  // GitHub: the steel depot at the far left, with a receiving chute.
  const ghWins = [], ctlWins = []
  el('rect', { x: 10, y: 186, width: 170, height: STREET_Y - 186, fill: C.steel })
  el('rect', { x: 10, y: 186, width: 170, height: 10, fill: C.steelLt })
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++)
    if (c !== 2) ghWins.push(el('rect', { x: 24 + c * 31, y: 214 + r * 30, width: 18, height: 16, fill: rnd() < 0.5 ? '#E0F2FE' : C.steelDk, opacity: 0.8 }))
  el('rect', { x: 80, y: 212, width: 30, height: 98, fill: '#2E3B45' })
  el('rect', { x: 80, y: 212, width: 30, height: 8, fill: VERM })
  el('rect', { x: 78, y: 370, width: 34, height: STREET_Y - 372, fill: '#E0F2FE', opacity: 0.9 })
  const gh = el('g', { transform: 'translate(60 322) scale(1.3)' })
  el('path', { fill: '#1C1F24', d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z' }, gh)
  el('text', { x: 84, y: 340, class: 'facade' }).textContent = 'GitHub'

  // The four work halls, open at the front so the benches read at a glance.
  const halls = HALL_NAMES.map((name, i) => {
    const x0 = HALL_X[i], wx = x0 + 12, door = x0 + 153, bx = x0 + HALL_W / 2
    el('rect', { x: x0, y: 240, width: HALL_W, height: STREET_Y - 240, fill: i % 2 ? C.walls[1] : C.walls[0] })
    el('rect', { x: x0 - 4, y: 236, width: HALL_W + 8, height: 8, fill: C.cornice })
    const upper = []
    for (let c = 0; c < 5; c++) upper.push(el('rect', { x: x0 + 14 + c * 33, y: 254, width: 19, height: 24, fill: rnd() < 0.55 ? C.warm : C.darkWin, opacity: 0.75 }))
    el('rect', { x: wx + 7, y: 288, width: 104, height: 22, rx: 3, fill: INK })
    el('rect', { x: wx + 7, y: 307, width: 104, height: 3, fill: VERM })
    el('text', { x: wx + 59, y: 304, class: 'sign', fill: PAPER }).textContent = name.toUpperCase()
    const clip = el('clipPath', { id: `${PFX}win${i}` }, defs)
    el('rect', { x: wx, y: 318, width: 118, height: 104 }, clip)
    el('rect', { x: wx, y: 318, width: 118, height: 104, fill: C.hallLight })
    const interior = el('g', { 'clip-path': `url(#${PFX}win${i})` })
    const props = el('g', {}, interior)
    const crew = el('g', {}, interior)
    el('rect', { x: wx, y: 318, width: 118, height: 104, fill: 'none', stroke: C.frame, 'stroke-width': 3 })
    el('path', { d: `M${wx + 8} 322 l16 0 l-26 54 l-12 0 z`, fill: '#FFFFFF', opacity: 0.16 })
    // Bench, level with the production line outside.
    el('rect', { x: wx + 4, y: 368, width: 50, height: 4, fill: '#94A3B8', opacity: 0.55 }, props)
    el('rect', { x: wx + 6, y: 326, width: 16, height: 12, fill: '#E0F2FE', opacity: 0.5 }, props)
    el('rect', { x: wx + 26, y: 326, width: 10, height: 12, fill: '#E0F2FE', opacity: 0.35 }, props)
    el('rect', { x: wx + 58, y: BENCH_Y, width: 56, height: 6, fill: '#475569' }, props)
    el('line', { x1: wx + 64, y1: BENCH_Y + 6, x2: wx + 64, y2: 422, stroke: '#475569', 'stroke-width': 3 }, props)
    el('line', { x1: wx + 108, y1: BENCH_Y + 6, x2: wx + 108, y2: 422, stroke: '#475569', 'stroke-width': 3 }, props)
    el('rect', { x: x0 + 140, y: 340, width: 26, height: STREET_Y - 342, fill: '#FCE7C8', stroke: C.frame, 'stroke-width': 3 })
    return { name, x0, wx, door, bx, benchX: wx + 86, props, crew, upper, active: null }
  })

  // Hall props, coloured by whichever team is on the bench.
  const P = halls.map(() => ({}))
  {
    const s = halls[0], w = s.wx, g = s.props
    el('line', { x1: w + 76, y1: 366, x2: w + 70, y2: 406, stroke: '#64748B', 'stroke-width': 2 }, g)
    el('line', { x1: w + 104, y1: 366, x2: w + 110, y2: 406, stroke: '#64748B', 'stroke-width': 2 }, g)
    el('rect', { x: w + 64, y: 330, width: 50, height: 36, fill: '#E0F2FE', stroke: '#94A3B8' }, g)
    P[0].draw = el('polyline', { points: `${w + 70},358 ${w + 78},358 ${w + 78},346 ${w + 88},346 ${w + 88},352 ${w + 98},352 ${w + 98},340 ${w + 108},340`, fill: 'none', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-dasharray': 70, 'stroke-dashoffset': 70 }, g)
  }
  {
    const s = halls[1], w = s.wx, g = s.props
    P[1].blocks = [[8, 396], [21, 396], [34, 396], [14, 384], [27, 384], [20, 372]].map(([dx, y]) =>
      el('rect', { x: w + dx, y, width: 11, height: 11, rx: 2, opacity: 0 }, g))
  }
  {
    const s = halls[2], w = s.wx, g = s.props
    el('line', { x1: w + 110, y1: 406, x2: w + 110, y2: 352, stroke: '#475569', 'stroke-width': 2.5 }, g)
    el('path', { d: `M${w + 110} 352 L${w + 96} 350 l-6 8 l14 0 z`, fill: '#475569' }, g)
    P[2].lens = el('g', {}, g)
    el('circle', { cx: 0, cy: 0, r: 7, fill: 'rgba(191,214,232,.45)', stroke: '#334155', 'stroke-width': 2 }, P[2].lens)
    el('line', { x1: 5, y1: 5, x2: 11, y2: 11, stroke: '#334155', 'stroke-width': 3, 'stroke-linecap': 'round' }, P[2].lens)
    P[2].tick = el('path', { d: `M${w + 14} 340 l4 4 l9 -9`, fill: 'none', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0 }, g)
  }
  {
    const s = halls[3], w = s.wx, g = s.props
    el('line', { x1: w + 86, y1: 318, x2: w + 86, y2: 336, stroke: '#475569', 'stroke-width': 3 }, g)
    P[3].stamp = el('g', {}, g)
    el('rect', { x: -6, y: -14, width: 12, height: 12, rx: 2, fill: '#1E293B' }, P[3].stamp)
    el('rect', { x: -9, y: -2, width: 18, height: 5, rx: 1, fill: '#475569' }, P[3].stamp)
  }

  // The production line: one straight plinth from GitHub to the hoist.
  el('rect', { x: 112, y: BENCH_Y, width: HOIST_X - 112, height: 7, fill: '#56708F' })
  for (let x = 124; x < HOIST_X - 8; x += 24) el('rect', { x, y: BENCH_Y + 2, width: 3, height: 3, fill: C.cool, opacity: 0.5 })
  el('rect', { x: 112, y: BENCH_Y + 7, width: HOIST_X - 112, height: 3, fill: INK, opacity: 0.35 })

  // Goods hoist: parcels ride it, agents never do.
  el('rect', { x: 968, y: RAIL_Y, width: 48, height: STREET_Y - RAIL_Y, fill: C.glass, stroke: C.glassStroke })
  el('rect', { x: 968, y: RAIL_Y, width: 48, height: 8, fill: C.rail })
  const cage = el('rect', { x: 971, y: BENCH_Y - 4, width: 42, height: 4, fill: VERM })

  // Control tower: the Director's room, lit like the halls.
  el('rect', { x: 1024, y: 88, width: 168, height: STREET_Y - 88, fill: '#1B2A3E' })
  el('rect', { x: 1020, y: 84, width: 176, height: 8, fill: C.cornice })
  el('rect', { x: 1036, y: 148, width: 144, height: 134, fill: C.hallLight, stroke: INK, 'stroke-width': 3 })
  el('line', { x1: 1108, y1: 148, x2: 1108, y2: 282, stroke: INK, 'stroke-width': 2, opacity: 0.35 })
  el('rect', { x: 1062, y: 290, width: 92, height: 20, rx: 3, fill: INK })
  el('rect', { x: 1062, y: 307, width: 92, height: 3, fill: VERM })
  el('text', { x: 1108, y: 305, class: 'sign', fill: PAPER }).textContent = 'CONTROL'
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++)
    ctlWins.push(el('rect', { x: 1040 + c * 36, y: 322 + r * 38, width: 20, height: 24, fill: rnd() < 0.5 ? C.warm : '#101A26', opacity: 0.75 }))

  // Wiring: one horizontal trunk, vertical drops, right angles only.
  const wire = el('g', { fill: 'none', stroke: C.conduit, 'stroke-width': 2.5 })
  el('polyline', { points: `${GH_X},${TRUNK_Y} 1036,${TRUNK_Y}` }, wire)
  el('polyline', { points: `1052,262 1036,262 1036,${TRUNK_Y}` }, wire)
  const roofLamps = halls.map(s => {
    el('polyline', { points: `${s.bx},${TRUNK_Y} ${s.bx},240` }, wire)
    el('rect', { x: s.bx - 4, y: TRUNK_Y - 4, width: 8, height: 8, fill: INK, stroke: 'none' })
    el('rect', { x: s.bx - 6, y: 230, width: 12, height: 10, fill: INK, stroke: 'none' })
    return el('rect', { x: s.bx - 3.5, y: 232.5, width: 7, height: 5, fill: C.conduitDark, stroke: 'none' })
  })
  el('rect', { x: GH_X - 4, y: TRUNK_Y - 4, width: 8, height: 8, fill: INK, stroke: 'none' })
  el('rect', { x: HOIST_X - 4, y: TRUNK_Y - 4, width: 8, height: 8, fill: INK, stroke: 'none' })
  const ghLamp = el('rect', { x: GH_X - 5, y: 188, width: 10, height: 6, fill: C.conduitDark, stroke: 'none' })

  // The Director at the console, the only person in the scene.
  function person(parent, cx, headY, s, body, dark, head, ring) {
    const g = el('g', { transform: `translate(${cx} ${headY}) scale(${s})` }, parent)
    el('rect', { x: -8, y: 7, width: 16, height: 28, rx: 6, fill: body, stroke: INK, 'stroke-width': 1 }, g)
    el('circle', { cx: 0, cy: 0, r: 7.5, fill: head, stroke: INK, 'stroke-width': 1.5 }, g)
    if (ring) el('circle', { cx: 0, cy: 0, r: 9.8, fill: 'none', stroke: TEAL, 'stroke-width': 1.4 }, g)
    const arm = el('line', { x1: 0, y1: 15, x2: 9, y2: 27, stroke: dark, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g)
    return { g, arm, armTo(deg) { arm.setAttribute('transform', `rotate(${deg} 0 15)`) } }
  }
  const room = el('g')
  el('rect', { x: 1046, y: 158, width: 124, height: 30, fill: INK }, room)
  const screenBars = [0, 1, 2, 3].map(i => el('rect', { x: 1056 + i * 29, y: 174, width: 18, height: 8, fill: C.cool }, room))
  const director = person(room, 1108, 224, 1.15, AMBER, AMBER_DK, '#F5C77A', false)
  // The AI assistants are agents too: the same hovering diamond with the AI core, in the
  // people's amber because they work for the Director. Only the Director is a person.
  function assistantAgent(parent, cx, cy, s) {
    const g = el('g', { transform: `translate(${cx} ${cy}) scale(${s})` }, parent)
    el('ellipse', { cx: 0, cy: 17, rx: 9, ry: 2.4, fill: INK, opacity: 0.22 }, g)
    const body = el('g', {}, g)
    el('polygon', { points: '0,-14 10.5,0 0,14 -10.5,0', fill: '#FBBF24', stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, body)
    el('polygon', { points: '0,-7 5,0 0,7 -5,0', fill: TEAL, stroke: TEAL_DK, 'stroke-width': 0.9, 'stroke-linejoin': 'round' }, body)
    el('polygon', { points: '5.6,-2.4 9,0 5.6,2.4', fill: PAPER }, body)
    return { g, armTo(deg) { body.setAttribute('transform', `translate(0 ${(deg * 0.25).toFixed(1)}) rotate(${(deg * 0.8).toFixed(1)})`) } }
  }
  const assistants = [[1066, -1], [1150, 1]].map(([x, face]) => {
    const a = assistantAgent(room, x, 238, 1.25)
    if (face < 0) a.g.setAttribute('transform', `translate(${x} 238) scale(-1.25 1.25)`)
    return a
  })
  const youPill = el('g', { 'aria-hidden': 'true' }, room)
  el('rect', { x: 1089, y: 196, width: 38, height: 17, rx: 8.5, fill: AMBER }, youPill)
  el('path', { d: 'M1104 213 l4 5 l4 -5 z', fill: AMBER }, youPill)
  el('text', { x: 1108, y: 208.5, class: 'you' }, youPill).textContent = 'You'
  // Console desk: channel lamps mirror the four halls.
  el('rect', { x: 1044, y: 258, width: 128, height: 8, fill: SLATE }, room)
  el('rect', { x: 1044, y: 266, width: 128, height: 16, fill: INK }, room)
  const panelLamps = [0, 1, 2, 3].map(i => el('rect', { x: 1054 + i * 29, y: 270, width: 16, height: 8, fill: C.conduitDark }, room))
  ;[1068, 1100, 1132].forEach(x => el('rect', { x, y: 253, width: 8, height: 6, fill: PAPER }, room))
  el('rect', { x: 1068, y: 250, width: 14, height: 4, fill: VERM }, room)

  const wagonLayer = el('g'), pulseLayer = el('g'), agentLayer = el('g'), parcelLayer = el('g')

  // ---------- Agents ----------
  // A hovering enamel lozenge: team-coloured shell around the teal AI core. No limbs,
  // no face. Small ink pips distinguish individuals within a team.
  let agentCount = 0
  function makeAgent(colour, pips, scale) {
    const g = el('g', {}, agentLayer)
    el('ellipse', { cx: 0, cy: 18, rx: 10, ry: 2.6, fill: INK, opacity: 0.20 }, g)
    const body = el('g', {}, g)
    el('polygon', { points: '0,-14 10.5,0 0,14 -10.5,0', fill: colour, stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, body)
    const core = el('polygon', { points: '0,-7 5,0 0,7 -5,0', fill: TEAL, stroke: TEAL_DK, 'stroke-width': 0.9, 'stroke-linejoin': 'round' }, body)
    el('polygon', { points: '5.6,-2.4 9,0 5.6,2.4', fill: PAPER }, body)
    for (let i = 0; i < pips; i++) el('rect', { x: -1.5 + (i - (pips - 1) / 2) * 4.4, y: 8.6, width: 3, height: 3, fill: INK }, body)
    const chips = el('g', { opacity: 0 }, body)
    el('rect', { x: 14, y: -2, width: 4.5, height: 4.5, fill: PAPER, stroke: INK, 'stroke-width': 0.8 }, chips)
    el('rect', { x: -18.5, y: -2, width: 4.5, height: 4.5, fill: colour, stroke: INK, 'stroke-width': 0.8 }, chips)
    const phase = (agentCount++) * 1.7
    return {
      g, body, core, chips,
      place(x, y, face = 1) { g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(scale * face).toFixed(2)} ${scale})`) },
      pose(t, working, tilt = 0) {
        const bob = Math.sin(t * 2.2 + phase) * (working ? 1.0 : 1.7)
        body.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${(tilt + (working ? Math.sin(t * 3 + phase) * 5 : 0)).toFixed(1)})`)
        const s = working ? 1 + Math.sin(t * 4.5 + phase) * 0.14 : 1
        core.setAttribute('transform', `scale(${s.toFixed(2)})`)
        chips.setAttribute('opacity', working ? 1 : 0)
        if (working) chips.setAttribute('transform', `rotate(${((t * 130 + phase * 40) % 360).toFixed(0)})`)
      },
    }
  }

  // ---------- Parcels and wagons ----------
  function makeParcel(team) {
    const g = el('g', {}, parcelLayer)
    const sheet = el('g', {}, g)
    el('rect', { x: -12, y: -20, width: 24, height: 20, fill: PAPER, stroke: team.c, 'stroke-width': 1.8, 'stroke-dasharray': '3 2' }, sheet)
    el('polyline', { points: '-8,-6 -4,-6 -4,-13 1,-13 1,-9 5,-9 5,-15 8,-15', fill: 'none', stroke: team.c, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, sheet)
    const crate = el('g', { opacity: 0 }, g)
    el('rect', { x: -13, y: -22, width: 26, height: 22, fill: team.c, stroke: INK, 'stroke-width': 1.5 }, crate)
    el('line', { x1: -13, y1: -16, x2: 13, y2: -16, stroke: INK, 'stroke-width': 1.2 }, crate)
    el('rect', { x: -2, y: -22, width: 4, height: 22, fill: INK, opacity: 0.18 }, crate)
    const tick = el('path', { d: 'M-8 -9 l3.5 3.5 L3 -13', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0 }, crate)
    const seal = el('g', { opacity: 0 }, crate)
    el('circle', { cx: 7, cy: -8, r: 5.4, fill: 'none', stroke: VERM, 'stroke-width': 2 }, seal)
    el('path', { d: 'M4.6 -8 l1.7 1.7 l3 -3.4', fill: 'none', stroke: VERM, 'stroke-width': 1.5, 'stroke-linecap': 'round' }, seal)
    return {
      g,
      set(level, showTick, showSeal) {
        sheet.setAttribute('opacity', level === 0 ? 1 : 0)
        crate.setAttribute('opacity', level >= 1 ? 1 : 0)
        tick.setAttribute('opacity', showTick ? 1 : 0)
        seal.setAttribute('opacity', showSeal ? 1 : 0)
      },
      place(x, y, opacity = 1) { g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); g.setAttribute('opacity', opacity) },
    }
  }
  function makeWagon() {
    const g = el('g', { opacity: 0 }, wagonLayer)
    el('line', { x1: 0, y1: RAIL_Y, x2: 0, y2: 170, stroke: '#94A3B8', 'stroke-width': 2.5 }, g)
    el('rect', { x: -5, y: RAIL_Y - 6, width: 10, height: 7, fill: INK }, g)
    el('line', { x1: -22, y1: 170, x2: -22, y2: WAGON_Y, stroke: '#94A3B8', 'stroke-width': 2 }, g)
    el('line', { x1: 22, y1: 170, x2: 22, y2: WAGON_Y, stroke: '#94A3B8', 'stroke-width': 2 }, g)
    el('line', { x1: -22, y1: 170, x2: 22, y2: 170, stroke: '#94A3B8', 'stroke-width': 2 }, g)
    el('rect', { x: -25, y: WAGON_Y, width: 50, height: 6, fill: SLATE, stroke: INK, 'stroke-width': 1 }, g)
    return g
  }

  // One shepherd agent escorts each parcel, hall by hall, alone.
  const SEG = [
    { k: 'glide', to: 0, d: 1.8 }, { k: 'work', hall: 0, d: 2.6 },
    { k: 'glide', to: 1, d: 1.2 }, { k: 'work', hall: 1, d: 2.8 },
    { k: 'glide', to: 2, d: 1.2 }, { k: 'work', hall: 2, d: 3.0 },
    { k: 'glide', to: 3, d: 1.2 }, { k: 'work', hall: 3, d: 3.2 },
    { k: 'escort', d: 0.9 }, { k: 'hoist', d: 1.4 },
    { k: 'dispatch', d: 3.2 }, { k: 'drop', d: 0.8 },
  ]
  const T = SEG.reduce((a, p) => a + p.d, 0)
  const STEP_OF = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4]
  function phaseOf(segs, t) {
    const total = segs.reduce((a, p) => a + p.d, 0)
    let lt = ((t % total) + total) % total, acc = 0
    for (let i = 0; i < segs.length; i++) {
      if (lt < acc + segs[i].d) return { p: segs[i], i, u: (lt - acc) / segs[i].d }
      acc += segs[i].d
    }
    return { p: segs[segs.length - 1], i: segs.length - 1, u: 1 }
  }
  const teams = FEATURES.map((f, k) => ({
    f, shepherd: makeAgent(f.c, 1, 1.32), parcel: makeParcel(f), wagon: makeWagon(),
    start: -7 + (k * T) / 3, hallNow: -1,
  }))

  // Team-mates: two more agents per team, each on its own solo patrol.
  const MATE_SLOTS = [[18, 350], [36, 404]]
  function mateSegs(order) {
    const segs = []
    let from = GH_X
    for (const h of order) {
      segs.push({ k: 'glide', from, to: halls[h].door, hall: h, d: Math.max(0.9, Math.min(2.2, Math.abs(halls[h].door - from) / 150)) })
      segs.push({ k: 'work', hall: h, d: 2.7 })
      from = halls[h].door
    }
    segs.push({ k: 'glide', from, to: GH_X, hall: -1, d: Math.max(0.9, Math.min(2.4, Math.abs(GH_X - from) / 150)) })
    return segs
  }
  const mates = []
  FEATURES.forEach((f, k) => {
    ;[[0, 2, 1, 3], [3, 1, 0, 2]].forEach((base, m) => {
      mates.push({
        f, agent: makeAgent(f.c, m + 2, 1.0), slot: MATE_SLOTS[m],
        segs: mateSegs(base.map(i => (i + k) % 4)), off: k * 2.9 + m * 6.1, still: 0,
      })
    })
  })

  // In the still, team-mates fill Build and Review and cross the lanes singly.
  ;[12.0, 10.4, 12.4, 14.4, 20.8, 3.5].forEach((v, i) => { if (mates[i]) mates[i].still = v })

  // ---------- Signal pulses on the wiring ----------
  const pulses = []
  function pathMeasure(pts) {
    const lens = []
    let total = 0
    for (let i = 1; i < pts.length; i++) { const l = Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y); lens.push(l); total += l }
    return { lens, total }
  }
  function posOn(pts, meas, dist) {
    let d = Math.max(0, Math.min(meas.total, dist))
    for (let i = 1; i < pts.length; i++) {
      if (d <= meas.lens[i - 1] || i === pts.length - 1) {
        const l = meas.lens[i - 1] || 1, u = d / l
        return { x: lerp(pts[i - 1].x, pts[i].x, u), y: lerp(pts[i - 1].y, pts[i].y, u) }
      }
      d -= meas.lens[i - 1]
    }
    return pts[pts.length - 1]
  }
  const PANEL_PT = [{ x: 1052, y: 262 }, { x: 1036, y: 262 }, { x: 1036, y: TRUNK_Y }]
  function wirePanelTo(bx) { return [...PANEL_PT, { x: bx, y: TRUNK_Y }, { x: bx, y: 240 }] }
  function wireBetween(a, b) { return [{ x: a, y: 240 }, { x: a, y: TRUNK_Y }, { x: b, y: TRUNK_Y }, { x: b, y: 240 }] }
  function sendPulse(pts, colour, now) {
    const r = el('rect', { x: -3.5, y: -3.5, width: 7, height: 7, fill: colour, stroke: INK, 'stroke-width': 0.7 }, pulseLayer)
    const meas = pathMeasure(pts)
    pulses.push({ pts, meas, r, start: now, d: Math.max(0.55, meas.total / 300) })
  }
  let stillPulsesDone = false
  function drawStillPulses() {
    if (stillPulsesDone) return
    stillPulsesDone = true
    const marks = [
      [wirePanelTo(halls[3].bx), AMBER, 0.42],
      [wirePanelTo(halls[0].bx).reverse(), FEATURES[1].c, 0.30],
      [wireBetween(halls[2].bx, halls[3].bx), FEATURES[0].c, 0.55],
    ]
    for (const [pts, colour, frac] of marks) {
      const meas = pathMeasure(pts), p = posOn(pts, meas, meas.total * frac)
      el('rect', { x: -3.5, y: -3.5, width: 7, height: 7, fill: colour, stroke: INK, 'stroke-width': 0.7, transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, pulseLayer)
    }
  }

  // ---------- Frame ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const phone = matchMedia('(max-width: 720px)')
  // Still: blue is mid-rail home, lime plans, rose is checked under supervision.
  const STILL = Array.isArray(opts.still) ? opts.still
    : typeof opts.still === 'number' ? teams.map(tm => ((opts.still - tm.start) % T + T) % T)
    : [20.9, 3.1, 16.2]
  const canPlay = opts.animate !== false
  let mode = reduce || !canPlay ? 'still' : 'story', running = mode === 'story', started = false, visible = false
  let looping = true, idle = 0, lastStep = -1
  let elapsed = 0, last = null, lastPulse = 0, pulseTurn = 0, lastFlicker = 0, lastBuilding = 0

  function frame(now) {
    if (last !== null && running && started && visible) elapsed += Math.min(0.1, (now - last) / 1000)
    last = now
    const t = elapsed
    const live = running && started && visible && mode === 'story'
    for (const s of halls) s.active = null
    let hoistY = null, anyDispatch = false
    if (mode === 'still') drawStillPulses()

    for (const [k, team] of teams.entries()) {
      const local = mode === 'still' ? STILL[k] : t - team.start
      const { p, i, u } = phaseOf(SEG, local)
      if (k === 0 && opts.onStep && STEP_OF[i] !== lastStep) { lastStep = STEP_OF[i]; opts.onStep(lastStep) }
      const S = team.shepherd, Pc = team.parcel
      const level = (i < 3 || (i === 3 && u < 0.18)) ? 0 : 1
      const tickOn = i > 5 || (i === 5 && u > 0.7)
      const sealOn = i > 7 || (i === 7 && u > 0.72)
      Pc.set(level, tickOn, sealOn)
      team.wagon.setAttribute('opacity', 0)
      S.g.setAttribute('opacity', 1)
      team.hallNow = p.k === 'work' ? p.hall : -1

      if (p.k === 'glide') {
        if (S.g.parentNode !== agentLayer) agentLayer.appendChild(S.g)
        const from = p.to === 0 ? START_X : halls[p.to - 1].benchX
        const x = lerp(from, halls[p.to].benchX, ease(u))
        const fade = i === 0 ? Math.min(1, u * 6) : 1
        Pc.place(x, BENCH_Y, fade)
        S.g.setAttribute('opacity', fade)
        S.place(x - 30, 390, 1); S.pose(t, false, 6)
      } else if (p.k === 'work') {
        const s = halls[p.hall]
        s.active = { team, u }
        if (S.g.parentNode !== s.crew) s.crew.appendChild(S.g)
        Pc.place(s.benchX, BENCH_Y)
        S.place(s.wx + 58, 392, 1); S.pose(t, true)
      } else if (p.k === 'escort') {
        if (S.g.parentNode !== agentLayer) agentLayer.appendChild(S.g)
        const x = lerp(halls[3].benchX, HOIST_X, ease(u))
        Pc.place(x, BENCH_Y)
        S.place(x - 30, 390, 1); S.pose(t, false, 6)
      } else if (p.k === 'hoist') {
        if (S.g.parentNode !== agentLayer) agentLayer.appendChild(S.g)
        const y = lerp(BENCH_Y, WAGON_Y, ease(u))
        hoistY = y
        Pc.place(HOIST_X, y)
        team.wagon.setAttribute('opacity', 1)
        team.wagon.setAttribute('transform', `translate(${HOIST_X} 0)`)
        S.place(HOIST_X - 40, 398, 1); S.pose(t, false, -4)
      } else if (p.k === 'dispatch') {
        anyDispatch = true
        if (S.g.parentNode !== agentLayer) agentLayer.appendChild(S.g)
        const x = lerp(HOIST_X, GH_X, ease(u))
        team.wagon.setAttribute('opacity', 1)
        team.wagon.setAttribute('transform', `translate(${x.toFixed(1)} 0)`)
        Pc.place(x, WAGON_Y)
        S.place(lerp(HOIST_X - 40, 210, ease(u)), 424, -1); S.pose(t, false, 6)
      } else {
        anyDispatch = true
        if (S.g.parentNode !== agentLayer) agentLayer.appendChild(S.g)
        team.wagon.setAttribute('opacity', 1 - u)
        team.wagon.setAttribute('transform', `translate(${GH_X} 0)`)
        Pc.place(GH_X, lerp(WAGON_Y, 296, ease(u)), u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3)
        S.g.setAttribute('opacity', 1 - clamp01((u - 0.55) / 0.45))
        S.place(lerp(210, 150, u), 424, -1); S.pose(t, false, 4)
      }
    }

    for (const m of mates) {
      const lt = mode === 'still' ? m.still : t + m.off
      const { p, u } = phaseOf(m.segs, lt)
      const A = m.agent
      if (p.k === 'glide') {
        if (A.g.parentNode !== agentLayer) agentLayer.appendChild(A.g)
        const x = lerp(p.from, p.to, ease(u)), face = p.to >= p.from ? 1 : -1
        A.g.setAttribute('opacity', u < 0.08 ? u / 0.08 : u > 0.92 ? (1 - u) / 0.08 : 1)
        A.place(x, 414, face); A.pose(t, false, face * 5)
      } else {
        const s = halls[p.hall]
        if (A.g.parentNode !== s.crew) s.crew.appendChild(A.g)
        A.g.setAttribute('opacity', u < 0.08 ? u / 0.08 : 1)
        A.place(s.wx + m.slot[0], m.slot[1], 1); A.pose(t, true)
      }
    }

    // Hoist cage carries parcels up, then returns empty.
    if (hoistY !== null) cage.setAttribute('y', hoistY)
    else cage.setAttribute('y', Math.min(BENCH_Y, +cage.getAttribute('y') + 4))

    // Hall props follow the team on the bench.
    const [plan, build, review, check] = halls
    if (plan.active) { P[0].draw.setAttribute('stroke', plan.active.team.f.c); P[0].draw.setAttribute('stroke-dashoffset', 70 * (1 - plan.active.u)) }
    else P[0].draw.setAttribute('stroke-dashoffset', 70)
    P[1].blocks.forEach((bk, kk) => {
      const on = build.active && build.active.u > (kk + 0.5) / 7
      bk.setAttribute('opacity', on ? 1 : 0); if (build.active) bk.setAttribute('fill', build.active.team.f.c)
    })
    if (review.active) {
      const u = review.active.u
      P[2].lens.setAttribute('transform', `translate(${(review.benchX + Math.sin(u * 12) * 9).toFixed(1)} ${(380 + Math.cos(u * 9) * 3).toFixed(1)})`)
      P[2].tick.setAttribute('opacity', u > 0.75 ? 1 : 0); P[2].tick.setAttribute('stroke', review.active.team.f.c)
    } else { P[2].lens.setAttribute('transform', `translate(${review.benchX} 384)`); P[2].tick.setAttribute('opacity', 0) }
    if (check.active) {
      const u = check.active.u
      const drop = u < 0.6 ? 0 : u < 0.72 ? (u - 0.6) / 0.12 : u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15
      P[3].stamp.setAttribute('transform', `translate(${check.benchX} ${(344 + drop * 38).toFixed(1)})`)
    } else P[3].stamp.setAttribute('transform', `translate(${check.benchX} 344)`)

    // Lamps: each hall roof and its console channel take the working colour.
    halls.forEach((s, idx) => {
      const fill = s.active ? s.active.team.f.c : C.conduitDark
      roofLamps[idx].setAttribute('fill', fill)
      panelLamps[idx].setAttribute('fill', fill)
    })
    ghLamp.setAttribute('fill', anyDispatch ? VERM : C.conduitDark)
    director.armTo(check.active ? -22 + Math.sin(t * 4) * 7 : Math.sin(t * 1.6) * 6)
    assistants.forEach((a, kk) => a.armTo(Math.sin(t * 2 + kk * 2) * 8 - 6))
    screenBars.forEach((b, idx) => {
      const h = 6 + (Math.sin(t * 1.4 + idx * 1.9) * 0.5 + 0.5) * 16
      b.setAttribute('height', h.toFixed(1)); b.setAttribute('y', (182 - h).toFixed(1))
      b.setAttribute('fill', halls[idx].active ? halls[idx].active.team.f.c : C.cool)
    })

    // Pulses: panel to hall, hall to panel, hall to hall. Wires only.
    if (live && t - lastPulse > 0.95 && pulses.length < 5) {
      const activeIdx = halls.map((s, idx) => s.active ? idx : -1).filter(v => v >= 0)
      if (activeIdx.length) {
        pulseTurn++
        const pick = activeIdx[Math.floor(Math.random() * activeIdx.length)]
        if (pulseTurn % 3 === 0) sendPulse(wirePanelTo(halls[check.active ? 3 : pick].bx), AMBER, t)
        else if (pulseTurn % 3 === 1) sendPulse(wirePanelTo(halls[pick].bx).reverse(), halls[pick].active.team.f.c, t)
        else if (activeIdx.length > 1) {
          const other = activeIdx.find(v => v !== pick)
          sendPulse(wireBetween(halls[pick].bx, halls[other].bx), halls[pick].active.team.f.c, t)
        } else sendPulse(wirePanelTo(halls[pick].bx), AMBER, t)
        lastPulse = t
      }
    }
    for (let kk = pulses.length - 1; kk >= 0; kk--) {
      const pu = pulses[kk], u = (t - pu.start) / pu.d
      if (u >= 1) { pu.r.remove(); pulses.splice(kk, 1); continue }
      if (u < 0) { pu.r.setAttribute('opacity', 0); continue }
      const pos = posOn(pu.pts, pu.meas, u * pu.meas.total)
      pu.r.setAttribute('opacity', 1)
      pu.r.setAttribute('transform', `translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`)
    }

    if (live && t - lastFlicker > 0.7) {
      const s = halls[Math.floor(Math.random() * halls.length)]
      const w = s.upper[Math.floor(Math.random() * s.upper.length)]
      w.setAttribute('fill', w.getAttribute('fill') === C.warm ? C.darkWin : C.warm)
      lastFlicker = t
    }
    // GitHub and the control building are busy too: their windows switch on and off.
    if (live && t - lastBuilding > 0.9) {
      const gh = ghWins[Math.floor(Math.random() * ghWins.length)]
      gh.setAttribute('fill', gh.getAttribute('fill') === '#E0F2FE' ? C.steelDk : '#E0F2FE')
      const cw = ctlWins[Math.floor(Math.random() * ctlWins.length)]
      cw.setAttribute('fill', cw.getAttribute('fill') === C.warm ? '#101A26' : C.warm)
      lastBuilding = t
    }
    idle = running ? 0 : idle + 1
    if (running || idle < 90) requestAnimationFrame(frame)
    else looping = false
  }
  requestAnimationFrame(frame)
  const wake = () => { if (!looping) { looping = true; idle = 0; last = null; requestAnimationFrame(frame) } }

  // ---------- Controls ----------
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) { started = true; wake() }
  }, { threshold: 0.35 }).observe(svg)

  const button = opts.button
  if (!button) {
    if (opts.viewBox) svg.setAttribute('viewBox', opts.viewBox)
    return
  }
  const label = () => {
    button.querySelector('span').textContent = running ? 'Pause' : 'Play'
    button.setAttribute('aria-label', running ? 'Pause the animation' : 'Play the animation')
    button.classList.toggle('is-paused', !running)
  }
  button.addEventListener('click', () => {
    if (mode === 'still') {
      mode = 'story'; elapsed = 0; started = true
      for (const pu of pulses) pu.r.remove()
      pulses.length = 0
    }
    running = !running
    label()
    wake()
  })
  label()
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    if (e.matches) { mode = 'still'; running = false; label(); wake() }
  })

  // Phones see the control end: Verify, the hoist and the Director's panel.
  const frameFor = () => svg.setAttribute('viewBox', opts.viewBoxFor ? opts.viewBoxFor(phone.matches)
    : opts.viewBox || (phone.matches ? '600 110 600 390' : '0 0 1200 500'))
  phone.addEventListener('change', frameFor)
  if (opts.viewBoxFor) addEventListener('resize', frameFor)
  frameFor()
}

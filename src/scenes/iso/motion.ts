import { gsap } from 'gsap'

/**
 * Dashed lines grow from their start point (DrawSVG would replace the dash pattern).
 * They also fade in: a line of zero length still shows its round end cap as a dot.
 */
export function grow(lines: Element[]) {
  const g = gsap.timeline()
  lines.forEach((l) => g.from(l, { attr: { x2: +l.getAttribute('x1')!, y2: +l.getAttribute('y1')! }, opacity: 0, duration: 0.06, ease: 'none' }, 0))
  return g
}

/**
 * Every scene plays its story on its own: the timeline waits, paused, until the scene comes into view,
 * then plays once over `seconds`. Scrolling never drives it.
 */
export function playOnView(el: Element, tl: gsap.core.Timeline, seconds: number) {
  tl.pause().timeScale(1 / seconds)
  const seen = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tl.play(); seen.disconnect() } }, { threshold: 0.25 })
  seen.observe(el)
  return () => seen.disconnect()
}

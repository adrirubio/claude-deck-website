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
 * Pinned triggers must be measured top to bottom, but scenes load in any order. A scene's triggers take
 * this priority (the higher on the page, the earlier it is measured); then all are sorted and measured again.
 */
export const refreshPriority = (el: Element) => -[...document.querySelectorAll('[data-scene]')].indexOf(el)

import { gsap } from 'gsap'

type Loop = { anim: gsap.core.Animation; from: number; hide: gsap.TweenTarget }

/**
 * Animations that run on their own once the story passes `from`, and only while `el` is on screen.
 * The story's progress is read on every frame: a scroll that jumps past a whole scene renders its
 * timeline without update callbacks. An IntersectionObserver sees the element where it is drawn,
 * so a pinned scene counts as on screen.
 */
export function makeLoops(el: Element, story: gsap.core.Animation) {
  const loops: Loop[] = []
  let visible = true, progress = 0
  const sync = () => loops.forEach(({ anim, from, hide }) => {
    if (visible && progress > from) {
      // From the start, honour the delay so loops stay staggered; otherwise carry on where it stopped.
      if (anim.paused()) { if (anim.totalTime() === 0) anim.restart(true); else anim.resume() }
    } else if (progress <= from) { anim.pause(0); gsap.set(hide, { opacity: 0 }) }
    else anim.pause()
  })
  const tick = () => { const p = story.progress(); if (p !== progress) { progress = p; sync() } }
  gsap.ticker.add(tick)
  const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() })
  seen.observe(el)
  return {
    add: (anim: gsap.core.Animation, from: number, hide: gsap.TweenTarget) => { loops.push({ anim, from, hide }) },
    kill: () => { gsap.ticker.remove(tick); seen.disconnect(); loops.forEach(({ anim }) => anim.kill()) },
  }
}

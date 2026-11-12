// Shared street-scene initialisation: mounts every [data-street] svg on
// the page through the one scene module (website-and-docs.md 4.2).
// Runs once per page; later component instances are ignored by the
// mounted guard. The hero mount keeps its caller-chosen crop, the
// pause/play button, and the stage steps wiring from the mockup.
import { mountStreet } from './street.js';

function heroBoxFactory(frame) {
  return function heroBox(isPhone) {
    frame.style.maxWidth = '';
    if (isPhone) return '600 110 600 390';
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    let vbH = (1200 * h) / w;
    if (vbH < 350) {
      frame.style.maxWidth = Math.round((h * 1200) / 350) + 'px';
      vbH = 350;
    }
    vbH = Math.min(vbH, 500);
    return `0 ${Math.round(495 - vbH)} 1200 ${Math.round(vbH)}`;
  };
}

for (const svg of document.querySelectorAll('svg[data-street]')) {
  if (svg.dataset.mounted) continue;
  svg.dataset.mounted = '1';

  const opts = { prefix: svg.dataset.prefix || 'st' };
  if (svg.dataset.animate === 'false') opts.animate = false;
  if (svg.dataset.viewbox) opts.viewBox = svg.dataset.viewbox;
  if (svg.dataset.still) {
    const parts = svg.dataset.still.split(',').map(Number);
    opts.still = parts.length === 1 ? parts[0] : parts;
  }

  if (svg.dataset.hero !== undefined) {
    const frame = svg.closest('.frame');
    if (frame) opts.viewBoxFor = heroBoxFactory(frame);
  }

  if (svg.dataset.steps !== undefined) {
    const tools = svg.closest('.plate') || document;
    const button = tools.querySelector('.playpause');
    if (button) opts.button = button;
    const steps = [...document.querySelectorAll('.steps li')];
    if (steps.length) {
      opts.onStep = (n) => steps.forEach((li, k) => li.classList.toggle('on', k === n));
    }
  }

  mountStreet(svg, opts);
}

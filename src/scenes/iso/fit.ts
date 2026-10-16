/** Fit the SVG's viewBox to its drawing, now and again once the fonts have loaded (labels change width). */
export function fitViewBox(svg: SVGSVGElement, pad = 18): void {
  const fit = () => {
    const b = svg.getBBox()
    if (b.width && b.height) svg.setAttribute('viewBox', [b.x - pad, b.y - pad, b.width + 2 * pad, b.height + 2 * pad].join(' '))
  }
  fit()
  if (document.fonts?.ready) document.fonts.ready.then(fit)
}

import { expect, test } from 'vitest'
import { project, shade, sortByDepth } from '../src/scenes/iso/project'

const o = { x: 100, y: 50, k: 1 }
test('the origin projects to itself', () => expect(project(o, 0, 0, 0)).toEqual([100, 50]))
test('x goes right and down, y goes left and down, z goes up', () => {
  const [ax, ay] = project(o, 10, 0, 0); const [bx, by] = project(o, 0, 10, 0); const [, cz] = project(o, 0, 0, 10)
  expect(ax).toBeGreaterThan(100); expect(ay).toBeGreaterThan(50)
  expect(bx).toBeLessThan(100); expect(by).toBeGreaterThan(50)
  expect(cz).toBe(40)
})
test('scale k multiplies distances', () => expect(project({ ...o, k: 2 }, 0, 0, 10)[1]).toBe(30))
test('shade darkens and clamps', () => {
  expect(shade('#808080', 0.5)).toBe('#404040')
  expect(shade('#ffffff', 2)).toBe('#ffffff')
})
test('items are drawn from back to front', () => {
  expect(sortByDepth([{ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 }]).map((i) => i.x + i.y)).toEqual([0, 10, 10])
})

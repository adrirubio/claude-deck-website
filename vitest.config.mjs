import { defineConfig } from 'vitest/config'

// Vitest runs the unit tests only; Playwright runs tests/e2e.
export default defineConfig({ test: { include: ['tests/*.test.{mjs,ts}'] } })

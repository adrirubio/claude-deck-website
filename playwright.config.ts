import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4321' },
  // A plain static server: Astro 7's preview backgrounds itself in non-interactive sessions.
  webServer: { command: 'python3 -m http.server 4321 --bind 127.0.0.1 --directory dist', url: 'http://127.0.0.1:4321', reuseExistingServer: false },
})

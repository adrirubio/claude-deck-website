// Astro configuration for the Albiex Synth City website.
// Static output only. The generated VitePress documentation under docs/
// is copied verbatim into dist/docs/ by scripts/copy-docs.mjs after the
// Astro build, so docs/ keeps being served unchanged at the same URLs.
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  outDir: './dist',
  build: {
    format: 'directory',
  },
});

# Albiex Synth City Website

Website and public documentation for Albiex Synth City, a self-hosted workspace to follow and steer coding agents working on GitHub issues.

This branch (`preview/synth-city`) carries the Astro foundation for the new site. It is a preview: every built page is `noindex`, nothing here is published, and a merge to `master` remains the production deployment, gated on the release owner's approval.

## Live Site

https://claudedeck.org

## Development

The site is built with Astro (static output). Fonts are self-hosted under `public/fonts/`; the build makes no external font or asset requests.

```bash
npm ci
npm run dev      # local dev server
npm run build    # astro build, then copies docs/ verbatim into dist/docs/
npm run check    # build, then scripts/check-pages.py on the built pages
```

The build output is `dist/`. The generated documentation under `docs/` is copied into `dist/docs/` unchanged by `scripts/copy-docs.mjs`, so the documentation keeps being served at the same URLs.

## Preview deploy

`.github/workflows/preview.yml` builds and checks the site on pushes to `preview/synth-city`. It deploys only when the Director has supplied the Cloudflare Pages preview target as the repository variable `CLOUDFLARE_PAGES_PREVIEW_PROJECT`; until then the deploy step is skipped and the workflow only builds and checks.

## Deployment

This site is deployed on Cloudflare Pages. Any push to the `master` branch will trigger a new deployment. The production workflow (`.github/workflows/deploy.yml`) is prepared on this preview branch as the go-live candidate for the single reviewed cutover merge: it builds the Astro site, checks the built pages, and deploys `dist/` only when the Director has supplied the production Pages project as the repository variable `CLOUDFLARE_PAGES_PRODUCTION_PROJECT`. Until that variable exists the deploy step is skipped; the workflow never falls back to a guessed project name, and nothing in this branch is merged or pushed to `master` here.

## Documentation source

The pages under `docs/` are generated. Do not edit them by hand.

- Source repository: [albiexai/synth-city](https://github.com/albiexai/synth-city), directory `docs/` (Markdown and VitePress configuration)
- Source commit: `b4aafaa05f5b364a4b3ff3a68d0e67c8bfe00a80` (`release/v4.0` merge; its tree is identical to the accepted head `9550a1987206d861473336422f542a8d3238b105`)
- Build method: `npm ci` in the Synth City `docs/` directory, then `scripts/deploy-docs.sh` from that commit. The script runs `vitepress build` and replaces this repository's `docs/` directory with the output.
- Excluded from the public build: `docs/plans/`, `docs/superpowers/` and `docs/deploy/`.

## Screenshots

All captures below show Albiex Synth City with synthetic example records from an isolated test instance (seeded sample-app data, never a live workspace or the live factory). They come from the renamed product at the documentation source commit above (`b4aafaa05f5b364a4b3ff3a68d0e67c8bfe00a80`). Fresh isolated captures were taken for the Overview (`/`), Work (`/work`), Teams (`/teams`, Members view) and Hooks (`/harnesses/claude-code/hooks`) views. The remaining retained paths reuse the product repository's verified `screenshots/` files from that same source commit, mapped explicitly: `screenshot-cc-bridge.png` from `screenshots/cc-bridge.png`, `screenshot-config.png` from `screenshots/config.png`, `screenshot-mcp.png` from `screenshots/mcp-servers.png`, `screenshot-sessions.png` from `screenshots/sessions.png`, and `screenshot-usage.png` from `screenshots/usage-tracking.png`. Every replaced capture is served at both its repo-root `assets/` path and the same `public/assets/` path, so the built site resolves each old `/assets/screenshot-*.png` URL. The root brand assets were replaced from brand package v2: `assets/apple-touch-icon.png` is the supplied `apple-touch-icon.png` and the 512×512 `assets/logo-dark.png` slot is served by the supplied `icon-512.png` raster.

| File | SHA-256 |
|---|---|
| `public/assets/tour/overview.png` (= `assets/screenshot-overview.png`) | `daae710c1a935f42db435ffe47e54bdbd70703683bfff56abb0d3f397c013c77` |
| `public/assets/tour/teams.png` | `0c426329b947a7e682bf7f34f37319be279e6bcb39c9e023a8da6e3361232696` |
| `public/assets/work-active.png` (= `assets/screenshot-work.png`) | `df9701142e56b2bf6b04c50e06cd863ee21b8bae6a3152e076b8512a4d0a947d` |
| `assets/screenshot-cc-bridge.png` | `4dfd3b93ec38766d7bb8b49ff110b78d2ce46017a225fae4e9ae8d33f2f85684` |
| `assets/screenshot-config.png` | `2fcbb79a717466d3e48e80634cfb935e1314540e382b5ccfd10d94ce6d41035a` |
| `assets/screenshot-hooks.png` | `eeb26b3461e610ce78ff75be8e5b9875bed40c4d6cddb2f224e34fdb954299cb` |
| `assets/screenshot-mcp.png` | `5114c230098a40ed95e386253945c61968de6a1885a26b87bd2e1b12bf7b7e4f` |
| `assets/screenshot-sessions.png` | `73c41bf8433fc2a98d1c9b6787a7f6f7536105401905b26ab06a4e5182eb0963` |
| `assets/screenshot-usage.png` | `509f6e30b27e51fe77aba84b9c98582c92b67efa28ab0dd14dfbc67c4aa56b73` |
| `assets/logo-dark.png` (brand `icon-512.png`) | `c0c94d926387c1820e0c96a8d9d6daa19bf409c51aa989b000c3e1717b34aec5` |
| `assets/apple-touch-icon.png` (brand `apple-touch-icon.png`) | `47a27ca452c77107be8f4780156b228088b630239925ae7439ed8029e419ca2d` |

## Preview and publication

Preview the built site and the documentation together by serving `dist/` (for example `npx serve dist` or `python3 -m http.server -d dist`), and open `/` and `/docs/`.

A push to `master` deploys the site to Cloudflare Pages. Do not push to `master` until the release owner approves the preview.

To restore the previous site, revert the website commit on `master`. For a merge commit, use `git revert -m 1 <merge-sha>`. The deployment workflow then publishes the restored files. A push to `master` deploys production, so the revert push needs the same release owner approval as a publication.

## Tech Stack

- Astro (static output in `dist/`)
- One shared layout and stylesheet with the design tokens from the approved mockup
- Self-hosted fonts: Newsreader, Hanken Grotesk, JetBrains Mono, Chakra Petch (SIL Open Font License 1.1)

## License

MIT

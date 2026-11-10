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

`.github/workflows/preview.yml` builds and checks the site on pushes to `preview/synth-city`. It deploys only when the Director has supplied the Cloudflare Pages preview target as the repository variable `CLOUDFLARE_PAGES_PREVIEW_PROJECT`; until then the deploy step is skipped and the workflow only builds and checks. The production workflow (`.github/workflows/deploy.yml`, push to `master`) is untouched.

## Deployment

This site is deployed on Cloudflare Pages. Any push to the `master` branch will trigger a new deployment.

## Documentation source

The pages under `docs/` are generated. Do not edit them by hand.

- Source repository: [adrirubio/claude-deck](https://github.com/adrirubio/claude-deck), directory `docs/` (Markdown and VitePress configuration)
- Source commit: `bc66e5fbb45af681f1a6a9b5df749addb5355a30` (`release/v3.0.0`, Claude Deck 3.0.0)
- Build method: `npm ci` in the Deck `docs/` directory, then `scripts/deploy-docs.sh` from that commit. The script runs `vitepress build` and replaces this repository's `docs/` directory with the output.
- Excluded from the public build: `docs/plans/`, `docs/superpowers/` and `docs/deploy/`.

## Screenshots

`assets/screenshot-overview.png` and `assets/screenshot-work.png` show Claude Deck 3.0.0 with synthetic example records. They contain no live records or private settings. They come from Deck frontend source commit `1c4ecb672e553a5d413387a85d342aa00feb1e27`. Its `frontend/` directory is identical to the `frontend/` directory of the source commit above (tree `08a3f12d25fb23599a2b4f8fa7e5a12d2c3a0b59`). The source commit above also changes backend code and one documentation page.

| File | SHA-256 |
|---|---|
| `assets/screenshot-overview.png` | `9975a5ce4089c722f009a05460bdcb171def2a09a54902ed1ae8bbdef3c32ce1` |
| `assets/screenshot-work.png` | `d4749fa1bf6c75c58673f94dc67be3cd19085dc3105e1e6543e0fef944ec29c2` |

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

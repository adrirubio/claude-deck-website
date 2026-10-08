# Claude Deck Website

Landing page and public documentation for [Claude Deck](https://github.com/adrirubio/claude-deck), a self-hosted workspace to follow and steer coding agents working on GitHub issues.

## Live Site

https://claudedeck.org

## Development

```bash
# Serve locally
npx serve

# Or open index.html directly in your browser
```

## Deployment

This site is deployed on Cloudflare Pages. Any push to the `master` branch will trigger a new deployment.

## Documentation source

The pages under `docs/` are generated. Do not edit them by hand.

- Source repository: [adrirubio/claude-deck](https://github.com/adrirubio/claude-deck), directory `docs/` (Markdown and VitePress configuration)
- Source commit: `0b56b1e7856dd1da8bcea17df7553857dfe3c4e8` (`release/v3.0.0`, Claude Deck 3.0.0)
- Build method: `npm ci` in the Deck `docs/` directory, then `scripts/deploy-docs.sh` from that commit. The script runs `vitepress build` and replaces this repository's `docs/` directory with the output.
- Excluded from the public build: `docs/plans/`, `docs/superpowers/` and `docs/deploy/`.

## Screenshots

`assets/screenshot-overview.png` and `assets/screenshot-work.png` show Claude Deck 3.0.0 with synthetic example records. They contain no live records or private settings. They come from Deck frontend source commit `1c4ecb672e553a5d413387a85d342aa00feb1e27`, which has the same tree as the source commit above.

| File | SHA-256 |
|---|---|
| `assets/screenshot-overview.png` | `9975a5ce4089c722f009a05460bdcb171def2a09a54902ed1ae8bbdef3c32ce1` |
| `assets/screenshot-work.png` | `d4749fa1bf6c75c58673f94dc67be3cd19085dc3105e1e6543e0fef944ec29c2` |

## Preview and publication

Preview the landing page and the documentation together with `npx serve` or `python3 -m http.server`, and open `/` and `/docs/`.

This repository targets `release/v3.0.0` for the Claude Deck 3.0.0 release work. A push to `master` deploys the site to Cloudflare Pages. Do not push to `master` until the release owner approves the preview.

To restore the previous site, revert the website commit on `master`. The deployment workflow then publishes the restored files.

## Tech Stack

- Static HTML
- Tailwind CSS (via CDN)
- Inter + JetBrains Mono fonts

## License

MIT

# Scene: the factory from outside

**The idea it teaches:** GitHub holds your features and the finished work, outside the factory. You, as the factory Director, and your AI assistants own the features, prepare the team rosters and supervise the factory. Inside the factory, Deck is the infrastructure, the team communication and the production dashboard, and runs your AI teams.

**Labels:** each part has a title in bold and, under it, what it is, in smaller type:
- **GitHub** — holds the features and finished work, outside the factory
- **You (as the factory Director) and your AI assistants** — own the features, prepare team rosters, perform factory supervision
- **Deck** — the factory infrastructure, team communication, production dashboard
- **AI Teams** — your selection of team roles, each with your selection of AI harnesses and AI models

The two flows ("Ready features flow in", "Finished work flows back") and the team names keep small one-line labels.

**How it plays:** the scene pins to the screen when its top reaches the top of the viewport, and scroll drives it for one and a half screen heights (GSAP ScrollTrigger, `pin`, `scrub: 0.6`). Progress runs from 0 to 1 across that scroll. Once its beat is reached, each flow of feature cards (grooming, in, back) loops on its own, but only while the scene is on screen. Scrolling back before that beat hides its cards again.

**On the home page (the hero):** the same story plays on its own, once, over 8 seconds, when the scene comes into view; no pinning and no scrolling needed. Then the flows keep looping while it is on screen. Draft at `/scenes/hero/`.

**Still version (reduced motion, or before the script loads):** the final frame, with every label shown and no motion. The frame is fixed, so the page does not shift when the script loads.

**On phones:** the drawing is too small for its labels, so it shows numbered markers and the labels appear as a numbered list under the drawing.

| Beat | Progress | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.00–0.15 | The ground slab, then GitHub, with three feature lists on top. Label: "GitHub holds your feature lists". | The ground fades in and rises 12 px (`power2.out`). GitHub rises from 40 px below (`back.out(1.4)`). The lists drop into place one by one, 0.03 apart. | Your features live in GitHub. |
| 2 | 0.15–0.31 | In the left corner, you, the Director, with your two AI assistants: one beside you, one at your side further left. Two dashed lines grow to GitHub, one from you and one from the first assistant, and feature cards travel along them. Label: "You (as the factory Director) and your AI assistants". | You rise in 20 px (`power2.out`); the helper pops in (scale 0.6 → 1, `back.out(2)`). The lines grow from you and from the helper (`none`). From 0.27 the cards loop along the lines, one every 1.4 s. | You and an AI helper prepare the features together. |
| 3 | 0.30–0.40 | The factory: its floor and walls, with the Deck console inside. | The floor fades in. The walls fade in and rise 14 px, 0.02 apart (`power3.out`). The console rises in 24 px. | Deck is part of the factory; you and GitHub are not. |
| 4 | 0.41–0.50 | Two dashed lines grow into the factory to the Deck console: an amber one from you (you prepare the rosters) and a teal one from your second assistant (it helps you supervise). Three small AI agents pop onto the console, one per feature colour (blue cube, violet pyramid, rose cylinder). The screen lights up. Label: "Deck". | The line grows (`none`). The roster agents pop in, 0.03 apart (`back.out(2)`). The screen brightens. | You choose who is on your AI teams. |
| 5 | 0.52–0.62 | Two AI teams appear on their belts, blue and rose, and a dashed line grows from Deck to each team along the floor. Labels: "AI Teams" and the two team names. | The AI agents pop in, 0.02 apart (`back.out(2)`). The lines grow from Deck (`none`). | Deck runs several AI teams for you. |
| 6 | 0.62–0.80 | Ready features travel from GitHub into the factory. Label: "Ready features flow in". | The inbound line grows; then work items in the teams' colours slide along it, one every 1.4 s, each fading in and out at the ends. | Ready work goes to the teams. |
| 7 | 0.80–1.00 | Finished work travels back to GitHub. Label: "Finished work flows back". | The return line grows; amber items slide back along it on the same rhythm. | Finished work comes back to you. |

**Rules:** people amber, AI agents verdigris with feature caps (blue cube, violet pyramid, rose cylinder; team A blue, team B rose), systems steel and graphite. Labels never sit on an object. No word "backlog".

# Scene: the factory from outside

**The idea it teaches:** you and your AI helper groom your features in GitHub, you choose your AI team roster in Deck, and Deck runs your AI teams; the factory turns ready features into finished work and gives it back.

**How it plays:** the scene pins to the screen when its top reaches the top of the viewport, and scroll drives it for one and a half screen heights (GSAP ScrollTrigger, `pin`, `scrub: 0.6`). Progress runs from 0 to 1 across that scroll. Once its beat is reached, each flow of feature cards (grooming, in, back) loops on its own, but only while the scene is on screen. Scrolling back before that beat hides its cards again.

**On the home page (the hero):** the same story plays on its own, once, over 8 seconds, when the scene comes into view; no pinning and no scrolling needed. Then the flows keep looping while it is on screen. Draft at `/scenes/hero/`.

**Still version (reduced motion, or before the script loads):** the final frame, with every label shown and no motion. The frame is fixed, so the page does not shift when the script loads.

**On phones:** the drawing is too small for its labels, so it shows numbered markers and the labels appear as a numbered list under the drawing.

| Beat | Progress | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.00–0.15 | The ground slab, then GitHub, with three feature lists on top. Label: "GitHub holds your feature lists". | The ground fades in and rises 12 px (`power2.out`). GitHub rises from 40 px below (`back.out(1.4)`). The lists drop into place one by one, 0.03 apart. | Your features live in GitHub. |
| 2 | 0.15–0.31 | In the left corner, you, the Director, and your AI helper beside you. Two dashed lines grow to GitHub, one from you and one from the helper, and feature cards travel along them. Label: "You, the Director, and your AI helper groom the features". | You rise in 20 px (`power2.out`); the helper pops in (scale 0.6 → 1, `back.out(2)`). The lines grow from you and from the helper (`none`). From 0.27 the cards loop along the lines, one every 1.4 s. | You and an AI helper prepare the features together. |
| 3 | 0.31–0.47 | The Deck console beside you. A dashed line grows from you to it, and three small AI agents pop onto it, one per feature colour (blue cube, violet pyramid, rose cylinder). The screen lights up. Label: "In Deck, you choose your AI team roster". | The console rises in 24 px. The line grows (`none`). The roster agents pop in, 0.03 apart (`back.out(2)`). The screen brightens. | You choose who is on your AI teams. |
| 4 | 0.47–0.62 | The factory floor, its belts and walls; two AI teams inside, blue and rose. A dashed line grows from Deck to the factory. Labels: "Deck runs your AI teams", "The factory: several AI teams at work", and the two team names. | The floor and belts fade in. The walls fade in and rise 14 px, 0.02 apart (`power3.out`). The AI agents pop in, 0.02 apart (`back.out(2)`). The line from Deck grows (`none`). | Deck runs several AI teams for you. |
| 5 | 0.62–0.80 | Ready features travel from GitHub into the factory. Label: "Ready features flow in". | The inbound line grows; then work items in the teams' colours slide along it, one every 1.4 s, each fading in and out at the ends. | Ready work goes to the teams. |
| 6 | 0.80–1.00 | Finished work travels back to GitHub. Label: "Finished work flows back". | The return line grows; amber items slide back along it on the same rhythm. | Finished work comes back to you. |

**Rules:** people amber, AI agents verdigris with feature caps (blue cube, violet pyramid, rose cylinder; team A blue, team B rose), systems steel and graphite. Labels never sit on an object. No word "backlog".

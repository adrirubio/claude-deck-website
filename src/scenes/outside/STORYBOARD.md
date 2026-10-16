# Scene: the factory from outside

**The idea it teaches:** you prepare your features in GitHub and run your AI teams from Deck; the factory turns ready features into finished work and gives it back.

**How it plays:** the scene pins to the screen when its top reaches the top of the viewport, and scroll drives it for one and a half screen heights (GSAP ScrollTrigger, `pin`, `scrub: 0.6`). Progress runs from 0 to 1 across that scroll. Once beat 5 is reached, the work items flow on their own in a loop, but only while the scene is on screen. Scrolling back before beat 5 hides them again.

**Still version (reduced motion, or before the script loads):** the final frame, with every label shown and no motion. The frame is fixed, so the page does not shift when the script loads.

**On phones:** the drawing is too small for its labels, so it shows numbered markers and the labels appear as a numbered list under the drawing.

| Beat | Progress | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.00–0.15 | The ground slab, then GitHub, with three feature lists on top. Label: "GitHub holds your feature lists". | The ground fades in and rises 12 px (`power2.out`). GitHub rises from 40 px below (`back.out(1.4)`). The lists drop into place one by one, 0.03 apart. | Your features live in GitHub. |
| 2 | 0.15–0.30 | The AI helper appears beside GitHub, and the dashed line to GitHub grows. Label: "Your AI helper prepares them". | The helper pops in (scale 0.6 → 1, `back.out(2)`). The line grows from the helper (`none`). | An AI helper prepares the features with you. |
| 3 | 0.30–0.45 | You, the Director, between GitHub and the Deck console. Label: "You, the Director". | You rise in 20 px (`power2.out`). Your lines to GitHub and to Deck grow (`none`). | You are in charge of both. |
| 4 | 0.45–0.62 | The Deck console lights up; the factory floor, its belts and walls appear; two AI teams appear inside, blue and rose. Labels: "Deck sets up and runs your AI teams", "The factory: several AI teams at work", and the two team names. | The screen brightens. The floor and belts fade in. The walls fade in and rise 14 px, 0.02 apart (`power3.out`). The AI agents pop in, 0.02 apart (`back.out(2)`). The line from Deck to the factory grows. | Deck runs several AI teams for you. |
| 5 | 0.62–0.80 | Ready features travel from GitHub into the factory. Label: "Ready features flow in". | The inbound line grows; then work items in the teams' colours slide along it, one every 1.4 s, each fading in and out at the ends. | Ready work goes to the teams. |
| 6 | 0.80–1.00 | Finished work travels back to GitHub. Label: "Finished work flows back". | The return line grows; amber items slide back along it on the same rhythm. | Finished work comes back to you. |

**Rules:** people amber, AI agents verdigris with feature caps (team A blue cube, team B rose cylinder), systems steel and graphite. Labels never sit on an object. No word "backlog".

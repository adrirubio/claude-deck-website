# Scene: the factory from outside

**The idea it teaches:** you prepare your features in GitHub and run your AI teams from Deck; the factory turns ready features into finished work and gives it back.

**How it plays:** scroll drives the scene (GSAP ScrollTrigger, `scrub`). The scene takes about one and a half screen heights of scrolling. Progress runs from 0 (the scene's top reaches 75% of the viewport) to 1 (the scene's bottom reaches 40%). After beat 6, the flows keep moving on their own in a gentle loop.

**Still version (reduced motion):** beat 6's final frame, with every label shown and no motion.

| Beat | Progress | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.00–0.15 | The ground slab, then GitHub, with three feature lists on top. Label: "GitHub holds your feature lists". | The ground fades and rises 12 px (`power2.out`). GitHub rises from 40 px below (`back.out(1.4)`). The lists stack in one by one, 0.03 apart. | Your features live in GitHub. |
| 2 | 0.15–0.30 | The AI helper appears beside GitHub and a new list lifts into the stack. Label: "Your AI helper prepares them". | The helper pops in (scale 0.6 → 1, `back.out(2)`). A list moves from the helper to the top of the stack along the dashed path (`power1.inOut`). | An AI helper prepares the features with you. |
| 3 | 0.30–0.45 | You, the Director, between GitHub and the Deck console. Label: "You, the Director". | You rise in (`power2.out`). The dashed lines to GitHub and Deck draw in (DrawSVG, `none`). | You are in charge of both. |
| 4 | 0.45–0.62 | The Deck console lights; the factory floor and its walls rise; two AI teams appear inside, blue and rose. Labels: "Deck sets up and runs your AI teams", "The factory: several AI teams at work". | The console screen fades from dark to verdigris. The walls rise from height 0 (`power3.out`). The AI agents pop in team by team, 0.02 apart. The line from Deck to the factory draws in. | Deck runs several AI teams for you. |
| 5 | 0.62–0.80 | Ready features travel from GitHub into the factory. Label: "Ready features flow in". | Work items slide along the inbound path (`none`), one after another. | Ready work goes to the teams. |
| 6 | 0.80–1.00 | Finished work travels back to GitHub. Label: "Finished work flows back". | Amber items slide along the return path (`none`). From here the flows loop on their own every 4.2 s. | Finished work comes back to you. |

**Rules:** people amber, AI agents verdigris with feature caps (team A blue cube, team B rose cylinder), systems steel and graphite. Labels never sit on an object. The drawing fits its width after the fonts load. No word "backlog".

# Scene: what the factory is

**The idea it teaches:** the factory is the Supervisor, Deck and your AI team, working through your features together; you, your AI helper and GitHub stay outside it. The test: if you start, stop, upgrade or repair a part, it is in the factory (Deck's operating model, `docs/guide/operating-model.md`, "The factory").

**How it plays:** a home-page figure, so it builds on its own, once, in 5 seconds, when its top reaches 80% of the viewport; no pinning and no scrolling needed. Then only the work moves and the Supervisor's check-in pulses, while the figure is on screen. The page loads its scenes up front (`client:load`): every pinned scene's space exists before the reader scrolls, so a jump down the page lands where it should, and the reader never sees the finished still vanish and rebuild.

**Still version (reduced motion, or before the script loads):** the closed boundary with every part and label in place, and one feature on each flow: one coming in, one going back, one on the team's belt at the AI reviewer.

**On phones:** the drawing shows numbers; the parts and the two flows appear as a numbered list under it.

| Beat | Time | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.0–1.1 s | The ground; you and your AI helper, above; GitHub, below; your amber grooming line around the left of where the factory will be. Labels: "You and your AI helper: outside: you own the features and the decisions", "GitHub: outside: holds the features and the finished work". | You and the helper pop in (scale 0.6 → 1, `back.out(2)`). GitHub rises 20 px. The line grows from you. | You and GitHub are outside. |
| 2 | 1.1–2.4 s | The factory floor, and its dashed boundary drawn edge by edge. Label: "The factory: everything you start, stop, upgrade or repair". | The floor fades in; each edge grows in 0.3 s, 0.25 s apart. | The boundary of the factory. |
| 3 | 2.4–3.5 s | Inside: Deck, the Supervisor (half amber, half verdigris) and your AI team, an AI Leader, two agent owners and an AI reviewer by a belt; a dashed check-in line from the Supervisor to the Leader. Labels: "Supervisor: checks in on the team", "Deck: runs the team and keeps it within its rules", "Your AI team: works through your features". | Deck rises 20 px; the Supervisor and the agents pop in, 0.1 s apart. | The three parts of the factory. |
| 4 | 3.7–5.0 s | A teal line from GitHub into the factory and an amber line back out. Labels: "Ready features come in", "Finished work goes back". | The lines grow from their start. | Work crosses the boundary both ways. |
| loop | after 4.3 s | A feature comes in from GitHub; one goes back; one travels along the team's belt; the ring under the Supervisor pulses. | The features fade in (0.4 s), travel (2.4 s on the flows, 4 s on the belt, `none`) and fade out; the ring's opacity swings 0.15 ↔ 1 over 0.9 s (`sine.inOut`, yoyo). | The team works; the Supervisor checks in. |

**Rules:** people amber; AI agents verdigris, the agent owners in their feature's cap; the Supervisor half amber, half verdigris; systems steel and graphite. Labels never sit on an object. No word "backlog", and no "lane".

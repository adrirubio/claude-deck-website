# Scene: who does what

**The idea it teaches:** who decides, who does the work, and what is a person, an AI agent or a system. You are at the top; the Supervisor answers to you; an AI Leader runs each team; under each Leader, agent owners build and an AI reviewer checks. Deck and GitHub are systems.

**How it plays:** the scene pins to the screen when its top reaches the top of the viewport, and scroll drives it for one and a half screen heights (GSAP ScrollTrigger, `pin`, `scrub: 0.6`). The hierarchy builds from the top down, one level at a time. Once it is built, each team's feature travels down to an agent owner and back up for the checks, on its own, in a loop, at the team's pace, but only while the scene is on screen. Scrolling back before that hides the features again.

**Still version (reduced motion, or before the script loads):** the final frame, with every label, and the three features at different points: blue with an agent owner, violet at its Leader, rose back at the Supervisor. The frame is fixed, so the page does not shift when the script loads.

**On phones:** the drawing shows numbers; the roles appear as a numbered list under it.

| Beat | Progress | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.00–0.14 | The ground; you, the Director, on the highest platform; GitHub beside you, with an amber line from you to it. Labels: "You, the Director: writes the features, marks them ready, chooses the roster", "GitHub: holds the features and the merged work". | The platform and you rise 24 px (`power2.out`). GitHub rises 20 px. The line grows from you (`none`). | You are in charge, and your features live in GitHub. |
| 2 | 0.16–0.26 | The Supervisor, half amber and half verdigris, on the next platform down, with a line from you. Label: "Supervisor: an AI agent or a person; watches every team, checks the work before it merges". | Rises 24 px; the line grows. | The Supervisor answers to you. |
| 3 | 0.30–0.48 | An AI Leader per team on a lower platform striped in the team's colour, with lines from the Supervisor. Deck appears below the teams, with a line along the floor to each team. Labels: "AI Leaders: one per team; approve the plans, check the work", "Deck: runs the teams". | The Leaders pop in, 0.03 apart (scale 0.6 → 1, `back.out(2)`). The lines grow, fading in as they start. Deck rises 20 px. | Each team has a Leader, and Deck runs the teams. |
| 4 | 0.50–0.62 | Under each Leader, two agent owners in the team's cap and an AI reviewer in the plain cap, with lines from their Leader. Labels: "Agent owners: plan and build one feature each", "AI reviewers: check the work". | The members pop in, 0.012 apart; the lines grow. | The owners build; the reviewers check. |
| 5 | 0.64–1.00 | Each team's feature card goes from you to the Supervisor, its Leader and an agent owner, then to the AI reviewer, back to the Leader and the Supervisor, and out to GitHub. | The card fades in (0.4 s), moves between people (0.7 s, `power1.inOut`) and stays 0.6 s with each, 1.4 s with the owner, who builds; all scaled by the team's pace (blue 1, violet 1.2, rose 0.9). The teams start 2.2 s apart. | Work goes down to be built and comes back up to be checked. |

**Rules:** people amber; AI agents verdigris, agent owners in their team's feature cap (blue cube, violet pyramid, rose cylinder); the Supervisor half amber, half verdigris; systems steel and graphite. Labels never sit on an object. No word "backlog", and no "lane".

# Scene: inside the factory

**The idea it teaches:** inside the factory, each ready feature gets its own lane, and several features move through the AI team at once. Every lane passes the same six steps, and each step says who does it.

**How it plays:** the scene pins to the screen when its top reaches the top of the viewport, and scroll drives it for one and a half screen heights (GSAP ScrollTrigger, `pin`, `scrub: 0.6`). Once the lanes are built, each feature travels through its lane on its own, in a loop, one lane a third of a trip after the other, but only while the scene is on screen. Scrolling back before that hides the features again.

**Still version (reduced motion, or before the script loads):** the final frame, with every label, and the three features at different stations (blue at Review, violet at Build, rose at Plan), each with its station lit. The frame is fixed, so the page does not shift when the script loads.

**On phones:** the drawing shows the step numbers; the six steps appear as a numbered list under the drawing, and the three captions as a list after it.

| Beat | Progress | What the viewer sees | Motion and easing | The idea |
|---|---|---|---|---|
| 1 | 0.00–0.20 | The factory floor, its walls with a doorway for each lane, and three empty belts striped blue, violet and rose. A dashed line comes in from GitHub. Label: "Each ready feature gets its own lane". | The floor fades in and rises 12 px (`power2.out`). The walls rise 14 px, 0.01 apart (`power3.out`). The belts fade in, 0.03 apart. | One lane per feature. |
| 2 | 0.20–0.58 | The stations appear one column at a time, from Plan to Merged, each with its number, step name and role: 1 Plan (agent owner), 2 Approve (AI Leader), 3 Build (agent owner), 4 Review (AI reviewer), 5 Check (AI Leader and Supervisor), 6 Merged (back to GitHub). | Each column's agents pop in (scale 0.6 → 1, `back.out(2)`), 0.06 apart; its label fades in and rises 8 px just after. | The same steps, in order, with who does each. |
| 3 | 0.58–0.72 | The features enter through their doorways and travel through their lanes. Label: "Several features move through the AI team at once". | Each feature fades in (0.4 s), then moves to each station (0.6 s, `power1.inOut`) and stays 0.9 s while that station's ring lights up in the lane's colour. A trip takes 10.3 s; the lanes start 3.4 s apart. | Several features at once, in parallel. |
| 4 | 0.72–1.00 | A dashed line leaves the factory towards GitHub. Label: "Merged work goes back to GitHub". | The line and its label fade in. At the end of each trip the feature fades out at Merged. | Finished work goes back. |

**Rules:** AI agents verdigris. The agent owners wear their lane's cap (blue cube, violet pyramid, rose cylinder), because each feature has its own owner; the AI Leader and the AI reviewers wear the plain cap. The Supervisor is drawn half amber and half verdigris: a person or an AI agent. Systems steel. Labels never sit on an object. No word "backlog".

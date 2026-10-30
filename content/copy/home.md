# Home — final page copy

**Director changes, 2026-10-30** (after the draft review): the new slogan "Scale product velocity with self-directing AI teams."; the main button is "See how it works" (the Quick tour is part of How it works); the inside-the-factory scene and its section move to How it works only; the navigation is Home, How it works, Technical information.

For: issue #778, page 1 of 4 under parent issue #777.

This file is the complete copy for the home page, in page order, ready for the Supervisor to build from on the preview branch. Text under a **Page copy** heading is the exact text for the page. Placement notes and evidence notes are guidance for the build; they do not appear on the page.

Planned route mapping for the builder (Leader-confirmed 2026-10-16; only the home and scene pages exist on the preview branch today, so these are the intended destinations, not yet live routes):

| Page | Destination |
|---|---|
| Home | `/` |
| How it works | `/how-it-works/` |
| Quick tour | `/quick-tour/` |
| Technical information | `/technical-information/` |

The page uses the two approved scenes and no screenshots. The scenes carry their own fixed labels and captions; the copy below does not repeat them.

## Page title

Page copy:

> Deck — Scale product velocity with self-directing AI teams.

## Navigation (top of page)

Page copy:

> Deck
>
> Home · How it works · Technical information

Placement note: "Deck" is the brand text and links to `/`. The four links go to `/`, `/how-it-works/`, `/quick-tour/` and `/technical-information/`, in that order.

## 1. First screen

Page copy:

> # Scale product velocity with self-directing AI teams.
>
> Choose what to build. Let your AI teams get to work.
>
> [Main button] See how it works

Placement note: the main button links to `/quick-tour/`; the secondary link goes to `/how-it-works/`. The hero scene, "the factory from outside", sits beside the heading on wide screens and under it on narrow ones. It plays on its own when it comes into view, as approved. Its fixed labels stay as they are.

Alt text for the hero scene:

> Ready features flow from GitHub into Deck and its AI teams. Finished work returns to GitHub. You and your AI assistants supervise from outside the factory.

Evidence: you choose and order the features and mark them ready — `docs/guide/operating-model.md:17` and `:53-57`. AI teams then do the work under an AI Leader — `docs/guide/operating-model.md:27` and `:89`.

## 3. What stays yours

Page copy:

> ## What stays yours
>
> You, the Director, choose the features and who builds them.
>
> You supervise the factory with your AI assistants.
>
> You decide whether the results meet your goals.

Placement note: plain text only; no scene or screenshot sits in this section.

Evidence: you choose the features and who builds them — you own the outcome and the features (`docs/guide/operating-model.md:17` and `:53`) and choose the roster and how many builders and checkers each team has (`:30` and `:46`). Supervising the factory from outside is yours, with your AI assistants — `docs/superpowers/specs/2026-10-16-website-build-design.md:80` and `:83`. Whether results meet your goals is your call: you own the outcome and set the acceptance conditions — `docs/guide/operating-model.md:17` and `:53-57`.

## 4. Closing

Page copy:

> Ready to watch your features become finished products? See how it works.
>
> [Main button] See how it works

Placement note: the button links to `/quick-tour/`, the same destination as the main button on the first screen.

Evidence: no product fact is claimed in this section.

## Footer

Page copy:

> Deck
>
> How it works · Technical information

Placement note: "Deck" links to `/`. The three links go to `/how-it-works/`, `/quick-tour/` and `/technical-information/`, in that order.

## Evidence notes (not shown on the page)

- Sources, in order of authority: the Director's decisions in `docs/superpowers/specs/2026-10-16-website-build-design.md` (`:70-86`), then the "Director decisions" and "Decisions after approval" sections of `docs/plans/2026-10-15-director-website/README.md` (`:50-74`), then `03-website-plan.md`. Where the older plan text disagreed with a decision, the decision was followed.
- The factory in this copy is Deck and the AI teams, with you and your AI assistants supervising from outside. That is the Director's decision of 2026-10-16 (`docs/superpowers/specs/2026-10-16-website-build-design.md:80`). `docs/guide/operating-model.md` still describes the factory the older way (`:38`, `:42-44`) until issue #775 updates it, so the factory-boundary lines above cite the decision, not the guide. Every other fact cites the guide or the feature docs at the line shown.
- No screenshot appears on this page, so no seeded-data caption is needed. The two scenes are the built, approved scenes named in the issue; this file does not change their labels, captions, or motion.
- The preview address is deliberately not linked or named anywhere in this file.

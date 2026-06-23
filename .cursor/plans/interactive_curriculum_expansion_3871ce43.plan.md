---
name: Interactive Curriculum Expansion
overview: Build a high-spec interactive learning system (code sandbox, generative math arena, match/fill-blank, history timeline, science sim), author enough new + activity lessons to fully fill the first ~2 months of the school-year calendar with no bare subject chips, and log the full remaining year's curriculum list for future build-out.
todos:
  - id: schema-types
    content: Extend schema contentBlock variants (codeSandbox, mathArena, match, fillBlank, simulation) + optional lessons.kind; extend curriculum/types.ts Block union and add builders (code, arena, match, cloze, sim)
    status: completed
  - id: interactive-components
    content: Build 5 new interactive components (code-sandbox, math-arena, match-game, fill-blank, simulation) and register them in lesson-blocks.tsx; add Activity badge
    status: completed
  - id: author-maths-english
    content: Author ~18 new Maths + ~16 new English teaching lessons + math-arena/match/fill-blank activities to cover the first 2 school months
    status: completed
  - id: author-other-activities
    content: Author code-sandbox lessons (AI&CS, Game Dev), science simulations, history timeline challenge, and homemaking/building match activities
    status: completed
  - id: seed-calendar
    content: Re-run seedRichCurriculum + calendar:generateYear; add friendly placeholder for unauthored days; verify weeks 1-8 fully filled
    status: completed
  - id: docs-state
    content: Log full remaining curriculum in docs/curriculum-plan.md; update specs.md + .agent/memory.md; typecheck + lint clean
    status: completed
isProject: false
---

# Interactive Curriculum Expansion

## Problem (confirmed)
In [convex/calendar.ts](convex/calendar.ts) `generateYear` assigns the next unused published lesson per subject per the daily rotation; when a subject runs out it still inserts an entry with `lessonId: undefined` (lines 113-122) — that is the bare "Maths"/"English" chip in the screenshot. Maths/English are daily (~190 days) but only have ~19/~22 rich lessons. The interactive system today only has 4 inline variants (`reveal`, `flashcards`, `ordering`, `timeline`) in [components/student/lesson-blocks.tsx](components/student/lesson-blocks.tsx) — no runnable code, no generative practice.

## Strategy (per your decisions)
- Hybrid, **no repeated lessons**: author a solid batch of distinct new teaching + activity lessons to cover the **first ~2 school months (~8 weeks)**, log the rest for future.
- Code sandbox runtime: **JavaScript + HTML/CSS in a sandboxed iframe**.
- Build **all** activity types: math arena, code sandbox, match/fill-blank, history timeline, science simulation.

## Architecture: new interactive blocks (backward-compatible)
Encode all activity config inside the existing `data: {key,value}[]` array so the only schema change is new `variant` literals.

- [convex/schema.ts](convex/schema.ts): extend `contentBlock.variant` union with `codeSandbox`, `mathArena`, `match`, `fillBlank`, `simulation`. Add optional `kind: v.optional(v.union(v.literal("lesson"), v.literal("activity")))` to `lessons` (+ a `by_subject` already exists) for an "Activity" badge.
- [convex/curriculum/types.ts](convex/curriculum/types.ts): extend `Block` union + add builders `code()`, `arena()`, `match()`, `cloze()`, `sim()`; add optional `kind` to `RichLesson`.
- [convex/seedRichCurriculum.ts](convex/seedRichCurriculum.ts): pass through `kind` and the new variants in `toContent()`.

### New components under `components/student/interactive/`
- `code-sandbox.tsx` — starter code editor (textarea), Run button writes `srcdoc` into an `<iframe sandbox="allow-scripts">` (no same-origin → cannot touch parent). Injected shim forwards `console.log` to the parent via `postMessage`; shows a console panel + live HTML preview. Optional "challenge" + expected-output check.
- `math-arena.tsx` — generative practice game: config `mode` (add/sub/mul/div/fractions/percent), operand `min/max`, `count`, optional `seconds` timer; instant feedback, streak, score, end screen + replay. Procedurally infinite (one authored lesson = endless practice, but placed once in the calendar).
- `match-game.tsx` — two-column click-to-match (term ↔ definition) with shuffle + scoring.
- `fill-blank.tsx` — cloze sentences with a word bank, drop/click to fill, check answers.
- `simulation.tsx` — small parameterized sims keyed by `sim` id; scope first batch to 2: `circuit` (series bulb on/off + battery count → brightness) and `particles` (states-of-matter temperature slider).
- Register all five in [components/student/lesson-blocks.tsx](components/student/lesson-blocks.tsx) switch.
- Add a small "Activity" badge on the lesson header ([app/(student)/lessons/[id]/page.tsx](app/(student)/lessons/[id]/page.tsx)) and a chip marker in the lesson list / calendar when `kind === "activity"`.

## Content to author NOW (covers first ~8 school weeks)
Daily-subject gap is the priority; others already have ≥2 months of teaching lessons, so they get a few activity lessons for variety.

- [convex/curriculum/maths.ts](convex/curriculum/maths.ts): ~18 new teaching lessons (extend Decimals, Percentages, Measurement, Geometry, Negative Numbers, Times-tables fluency, Word Problems units) + 3 `mathArena` activity lessons (Times-Tables Sprint, Add/Subtract Dash, Fractions Face-off).
- [convex/curriculum/english.ts](convex/curriculum/english.ts): ~16 new teaching lessons (Punctuation, Paragraphs, Spelling Patterns, Vocabulary, Inference units) + 2 `match` + 1 `fillBlank` activity lessons (Vocab Match, Punctuation Fix-it, Word-Class Sort).
- [convex/curriculum/aics.ts](convex/curriculum/aics.ts): 2 `codeSandbox` lessons (Your First JavaScript: variables + `console.log`; Conditionals & a guessing game).
- [convex/curriculum/gamedev.ts](convex/curriculum/gamedev.ts): 2 `codeSandbox` lessons (Move a sprite with coordinates on a `<canvas>`; Collision + scoring loop).
- [convex/curriculum/science.ts](convex/curriculum/science.ts): 2 `simulation` activity lessons (Build a Circuit; States of Matter particles).
- [convex/curriculum/history.ts](convex/curriculum/history.ts): 1 `timeline` ordering challenge (WWII key events) — timeline variant already exists.
- [convex/curriculum/homemaking.ts](convex/curriculum/homemaking.ts) + [convex/curriculum/building.ts](convex/curriculum/building.ts): 1 `match` activity each (Kitchen-safety match; Tool ↔ Job match).

Each new teaching lesson keeps the existing rich shape: heading + 2-4 teaching blocks + worked example + key points + ≥1 interactive + 5-question MCQ quiz.

## Calendar
- Re-seed + regenerate: `set -a; source .env.local; set +a` then `npx convex run seedRichCurriculum:seedRichCurriculum` and `npx convex run calendar:generateYear`.
- Minor polish in [convex/calendar.ts](convex/calendar.ts): for entries still beyond authored content (months 3+), render a friendly "More lessons coming soon" placeholder instead of a bare subject chip (handled in the calendar page render, no auto-repeat per your instruction).
- Verify: weeks 1-8 (Aug 25 → ~Oct 23) have a real lesson in every slot.

## Logged full remaining curriculum (future build-out — NOT built now)
Recorded here + appended to `docs/curriculum-plan.md` so future terms stay consistent. Target ~260 lessons/year total.

- Maths (to ~190): finish Decimals, Percentages, Geometry (angles/area/perimeter/volume), Measurement, Coordinates, Negative Numbers, Statistics, Graphs, Time & Money, Mental Maths, multi-step Word Problems; + recurring `mathArena` activity per unit.
- English (to ~190): Persuasive/Creative/Non-fiction Writing, Summarising, Story Structure, Editing, Planning, Tone, Comparing Texts, Explanations; + `match`/`fillBlank` activity per unit.
- Science (to ~76): Light, Sound, Space, Plants, Animals, Ecosystems, Materials, Scientific Method/Fair Testing/Data; + more `simulation` ids (forces/balance, light rays, sound waves, plant growth).
- History (to ~76): WWI/WWII/Founding/1812/Civil War sub-topics + source analysis, bias, propaganda, chronology; + `timeline` challenge per era.
- AI & CS (to ~38): Algorithms, Variables, Conditionals, Loops, Debugging, Binary, Logic Gates, Internet Safety; + `codeSandbox` per concept.
- Game Dev (to ~38): Sprites, Collision, Controls, Health, Timers, Win Conditions, Animation, Menus; + `codeSandbox` canvas projects.
- Homemaking (to ~38): Meal Planning, Nutrition, Food Storage, Laundry, Budgeting, Routines; + `match`/checklist activities.
- Building (to ~38): Materials, Measuring, Angles, Levels, Load/Stability, Tool Safety, Project Planning; + `match`/diagram activities.

## Docs / state
- Update `docs/curriculum-plan.md` (full list + new activity-block authoring guide), [specs.md](specs.md) (Phase 9 Step 4 progress + new "Interactive Activity System"), and [.agent/memory.md](.agent/memory.md) Recent Progress / Next Steps.
- Verify: `npx tsc --noEmit` + lint clean; lesson + calendar pages render the new activities.

## Security
Code sandbox uses `sandbox="allow-scripts"` only (no `allow-same-origin`), so student code is isolated from the app and Convex. No secrets exposed; all new content is static authored data.
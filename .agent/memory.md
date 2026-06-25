# HomeschoolHero — Agent Memory

## Current Objective
Build a gamified homeschool learning platform (student + parent portals) per implementation plan and project brief.

## Technical Architecture
- Next.js 16.2.9 App Router + TypeScript + Tailwind **v4** (CSS-first config via `@theme` in `app/globals.css`) + shadcn/ui (base-nova, neutral)
- React 19.2.4
- Convex (database, auth, storage, realtime) — deployment `oceanic-crane-853` / dev/ryan-gliozzo
- `@convex-dev/auth` v0.0.94 — provider is `ConvexAuthProvider` from `@convex-dev/auth/react` (NOT the old `ConvexProviderWithAuth` name)
- AI course builder via Convex action + OpenRouter BYOK (Phase 7)
- Hosting: Vercel Hobby

## Environment / Auth
- `.env.local` (gitignored) holds: `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_SITE_URL`
- Convex CLI authenticates non-interactively via the deploy key (browser login was flaky in non-interactive shell). **Do NOT `source .env.local`** — the deploy key value contains a `|`, so an unquoted `source` mangles it (bash treats `|` as a pipe). The Convex CLI reads `.env.local` automatically; just run `npx convex run ...` directly. Push code first with `npx convex dev --once` before running newly-edited functions.
- Auth env vars set on deployment by `@convex-dev/auth` setup: `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`.

## Design Tokens
- Source of truth: `.cursor/skills/design/SKILL.md`. Applied in `app/globals.css` (`:root` permanent dark theme) + `tailwind.config.ts` (reference).
- Tailwind v4: tokens live in CSS `@theme`. Note: design skill's `text-primary`/`text-secondary` map to shadcn `text-foreground` (#fff) / `text-muted-foreground` (#94a3b8) to avoid clobbering shadcn component tokens. Subject + accent utilities available (`bg-maths`, `text-accent-purple`, etc.).

## Recent Progress — Phases 1–8 COMPLETE, Phase 9 COMPLETE (rich curriculum shipped)
- Phases 1–6: foundation, schema, student portal, parent console, Friday Challenge, adaptive learning.
- Phase 7: AI lesson builder (OpenRouter BYOK). Settings, AI Builder, draft lifecycle, transactional approve.
- Phase 8: Framer Motion staggered reveals + confetti + sonner toasts + badges engine (`convex/badges.ts`: 6 seeded badges, `checkAndAward` wired into quiz submissions + lesson completion). Dashboard achievements wired to real `badges.mine`. Hover scale on cards.
- Phase 9 COMPLETE: Rich structured lessons + school-year calendar + quiz insights + FULL multi-lesson curriculum.
  - Schema: `lessons.content` (typed block array: heading/text/example/keyPoints/video/interactive), `schoolYear` + `calendarEntries` tables.
  - Lesson block renderer + 4 interactive components (reveal/MCQ, flashcards w/ 3D flip, ordering w/ seeded shuffle, timeline). Lesson page renders `content` blocks, falls back to `lessonNotes`.
  - Calendar: `convex/calendar.ts` (seedDefaultYear US Aug→June, generateYear 677 entries / 41 weeks, getToday/getWeek/getMonth with completion status, assignLesson/clearEntry). Student + parent month-grid calendar pages with holiday names. Full year auto-planned (core-heavy rotation).
  - Quiz insights: `quizzes.listAll` returns attemptsCount + bestPercentage + latestPercentage per quiz. Parent quizzes page shows score badges.
  - Subject manager + lesson editor (rich content + inline quiz editor + YouTube search helper) shipped post-Phase 8.
  - **Full multi-lesson curriculum authored + seeded**: each TOPIC is now a 4–8 lesson unit. 167 new rich lessons + 835 quiz questions via `convex/seedRichCurriculum.ts` (idempotent). Curriculum data lives in `convex/curriculum/{maths,english,science,history,aics,gamedev,homemaking,building}.ts` + shared `types.ts`. Master plan/log: `docs/curriculum-plan.md`. ~206 total lessons now. Calendar regenerated (677/41wk).
  - Flashcards interactive upgraded to a real 3D flip animation (was broken: flip button set state to false instead of toggling).
- Phase 9b — **Interactive Activity System** (high-spec learning): schema `contentBlock.variant` extended (`codeSandbox · mathArena · match · fillBlank · simulation`) + `lessons.kind` (`lesson`/`activity`). New authoring builders `code/arena/match/cloze/sim` + optional per-subject `topics` in `convex/curriculum/types.ts`. `seedRichCurriculum` now auto-creates declared/referenced topics (appended in order) and seeds `kind`.
  - 5 new React components in `components/student/interactive/`: `code-sandbox` (sandboxed `<iframe sandbox="allow-scripts">`, console via `postMessage`, canvas for game-dev — fully isolated, no same-origin), `math-arena` (generative practice game w/ streak/timer), `match-game`, `fill-blank` (cloze w/ word bank), `simulation` (`circuit` + `particles` canvas). Registered in `lesson-blocks.tsx`. "Activity" badge on lesson page + gamepad chip on subject list.
  - **+45 lessons authored & seeded** (Maths +21: Decimals/Percentages/Measurement/Geometry/Negative Numbers/Times Tables + 3 arena games; English +16: Punctuation/Spelling/Paragraphs/Inference/Vocabulary + match/cloze games; AI&CS + GameDev code labs; Science circuit/particles sims; History WWII timeline; Homemaking/Building match games). ~216 rich lessons total. Calendar regenerated (677 entries); **weeks 1–8 (Aug 25→~Oct 21) fully filled**; later unauthored days render a friendly "· soon" placeholder (calendar page) instead of bare subject chips. Full remaining-year curriculum logged in `docs/curriculum-plan.md`.
- Phase 9c — **Interactive result logging + full coverage** (parent visibility):
  - New `interactiveResults` table (userId/lessonId/subjectId/blockIndex/variant/title/score/total/percentage/detail/completed) + `convex/interactiveResults.ts`: `log` mutation (auth, server-derived ownership; first completion of each lesson+block earns 5 engagement pts + up to 10 score-scaled pts to `pointsLedger` and fires `badges.checkAndAward`), `recentForParents` (parent) + `forLesson` (parent) queries.
  - **All 9 interactive components now emit results** via an `onComplete` prop (shared `components/student/interactive/types.ts`); `lesson-blocks.tsx` logs them with lessonId + block index. code-sandbox logs exactly what the student ran + console output (~900ms after Run); arena/match/fillBlank/ordering log score, flashcards/timeline/simulation log exploration. Previously NOTHING from interactives was tracked.
  - Parent surfaces: dashboard "Recent interactive activity" panel + per-lesson "Interactive activity results" section on the parent lesson editor + interactive rows added to CSV/JSON export.
  - **Interactive coverage = 100%** (259/259 lessons). Shared pure derivation `convex/curriculum/derive.ts` (maths→topic-matched arena drill; others→flashcards/MCQ from the lesson's own quiz) is used by BOTH the seed (new lessons) and `enrichLessons:ensureInteractivePractice` (existing lessons: enriched the 38 that had no interactive). Re-runnable + idempotent.
  - **Fix**: code-sandbox preview iframe now `overflow-hidden` + `border-0` so the white frame has rounded corners matching the card (was cut off).
- Phase 9f — **Calendar fill (IXL + Geography + 53 lessons)**:
  - **IXL labels**: `calendar:generateYear` sets `label: "IXL Maths/English/Science Lesson"` when no in-app lesson remains for those subjects (existing assigned lessons preserved). Student calendar shows the label instead of "· soon".
  - **Geography** added to Wed rotation (auto-patched on regenerate). `convex/curriculum/geography.ts` — 19 new lessons; user's existing Western Europe lesson kept. Registered in `seedRichCurriculum`. `lib/subjects.ts` includes Globe icon.
  - **+53 lessons** seeded: History +12 (Ancient Civ + Source Analysis), AI&CS +6 (Loops/Functions), GameDev +6 (Collision/Scoring labs), Homemaking +6, Building +6, Geography +19. **716 calendar entries**; Oct–Nov 2026 fully filled (app lessons + IXL notes, 0 "soon").
  - Commands: `npx convex dev --once` → `seedRichCurriculum` → `calendar:generateYear`.
- Phase 9d — **Learning simulations (animated, attention-grabbing)**:
  - Clarified two interactive families: **(1) learning simulations** (movement, cause-and-effect — particles, circuits, body systems) vs **(2) practice games** (arena, match, MCQ, flashcards). Documented when to use each in `docs/curriculum-plan.md`.
  - Built 5 human-body animated sims in `components/student/interactive/body-sims.tsx`: `heart` (pulsing circulation loop + BPM slider), `lungs` (expand/contract + O₂/CO₂), `skeleton` (elbow flex + opposing muscles), `digestive` (food stages auto-play), `brain` (reflex nerve pulse). Wired in `simulation.tsx`; extended `sim()` builder with 7 sim ids.
  - Added sim blocks to all 5 Human Body science lessons in `convex/curriculum/science.ts` (alongside existing flashcards/MCQ/ordering). Patched live DB via `enrichLessons:attachBodySimulations` (5/5 patched).
- **Convex plugin demo**: MCP `status` connected to deployment; applied query-optimization rule — added `by_topic_and_status` + `by_subject_and_status` compound indexes and updated `lessons.ts` + `calendar.ts` to stop post-index `.filter()` scans on published lessons (~206 rows today, scales as curriculum grows).
- Blog Parts 1–7 written (`blog/` dir).

## Next.js routing note
- Route groups `(name)` do NOT create URL segments. Student routes use `(student)` → top-level URLs (`/dashboard`); parent routes MUST use a real `parent` segment (`app/parent/**` → `/parent/...`) to avoid colliding with same-named student routes.

## Convex file naming gotcha
- Convex module filenames CANNOT contain hyphens (path components only allow alphanumeric/underscore/period). Use camelCase in `convex/` (e.g. `authHelpers.ts`, NOT `auth-helpers.ts`). React component files under `components/` stay kebab-case per design skill.

## Phase 1 status (scaffold + smoke)
- Scaffolded Next.js 16 (worked around capital folder name by scaffolding in temp lowercase dir then `mv`ing files in, preserving `.git`/`.cursor`/`.agent`/mockups/brief).
- Installed deps; initialised shadcn/ui; added button, card, input, label, dialog, drawer, badge, progress, table, tabs.
- Linked Convex to existing `oceanic-crane-853` via deploy key; pushed `convex/hello.ts` + auth files (`auth.ts`, `auth.config.ts`, `http.ts`).
- Wired `ConvexAuthProvider` via `app/providers.tsx` in `app/layout.tsx`.
- Smoke test live: `convex run hello:hello` → `"HomeschoolHero online"`; home page (`app/page.tsx`) renders + hydrates via `useQuery(api.hello.hello)`.
- Typecheck 0 errors; lint only harmless warnings. Dev server confirmed serving HTTP 200 with the HomeschoolHero shell.
- Created `specs.md` (9-phase checklist).

## Known Issues / Blockers
- **Convex MCP**: `status` tool works (finds `oceanic-crane-853` dev + prod). `insights`/`run` require interactive login via `npx convex dev` in a terminal (deploy-key CLI works separately). Re-enable in Cursor MCP settings if disabled.
- **GitHub**: repo `darkjedig/homeschool-hero` created (public). Fine-grained PAT now has Contents:Write. Push works via `git push "https://x-access-token:<PAT>@github.com/darkjedig/homeschool-hero.git" main:main`.

## Next Steps (Phase 10)

### Curriculum follow-ups (optional polish)
- **IXL**: Maths/English/Science daily slots use IXL labels when in-app content runs out — student completes on uk.ixl.com. Do not add more in-app maths/english lessons unless replacing IXL workflow.
- Late-year calendar gaps (~March 2027) in History/Geography until more units authored — see `docs/curriculum-plan.md`.
- 4 lessons skipped in the rich seed (title overlap with original text-only seedLessons, e.g. "What Is a Fraction?", "Finding the Main Idea"). They still render fine via `lessonNotes` fallback, but lack rich `content` blocks. Patch by renaming/deleting the old text-only versions or adding content to them.
- To add MORE lessons: edit the relevant `convex/curriculum/<subject>.ts`, then `npx convex dev --once` (push), then `npx convex run seedRichCurriculum:seedRichCurriculum` (idempotent — now auto-derives an interactive for any new lesson lacking one) + `npx convex run calendar:generateYear`. If older lessons ever end up without an interactive, re-run `npx convex run enrichLessons:ensureInteractivePractice` (idempotent; reports coverage %).
- Interactive content authoring: builders `mcq/fc/ord/tl` + new `code/arena/match/cloze/sim` live in `convex/curriculum/types.ts`. Reveal = `{key:"question"|"option_0..3"|"answer"|"explanation"}`. Activity lessons set `kind:"activity"` and may have `questions: []` (no quiz).
- **Continue the curriculum build toward ~260 lessons/year** so the full Aug→June calendar fills with real content — remaining unit list per subject is logged in `docs/curriculum-plan.md` (calendar currently thins out from ~Oct 22 onward).
- New simulation ids: `heart`, `lungs`, `skeleton`, `digestive`, `brain` (+ existing `circuit`, `particles`). Add sims in `body-sims.tsx` / `simulation.tsx`, extend `sim()` in `types.ts`, patch DB with `npx convex run enrichLessons:attachBodySimulations`. **Use simulations for process/animation topics; use games/MCQ for facts/skills** — see `docs/curriculum-plan.md` § "Two kinds of interactive".
- New simulation ids can be added in `components/student/interactive/simulation.tsx` (currently `circuit`, `particles`, `heart`, `lungs`, `skeleton`, `digestive`, `brain`); future: `forces`, `lightRays`, `soundWaves`, `plantGrowth`.

### Remaining work
- Phase 10: Full RBAC audit, Playwright + Vitest, mobile polish, error boundaries, README.

- Phase 9g — **Big content batch + 4 new science sims (reduce IXL / fill "soon")**:
  - New science simulations in `components/student/interactive/science-sims.tsx` (wired into `simulation.tsx` + `sim()`): `lightRays` (mirror tilt → reflection; prism → rainbow), `soundWaves` (frequency↔pitch, amplitude↔volume animated wave), `plantGrowth` (seed→sprout→seedling→flower stages), `orbit` (clickable planets + speed slider). SimId union now 16 ids.
  - **+52 new lessons** (IXL reducers + "soon" fillers, each with a varied interactive): Science +12 (Light/Sound/Space/Plants using the new sims), Maths +9 (Statistics, Time & Money, Patterns & Sequences), English +9 (Persuasive, Poetry, Letters & Reports), History +4 (Ancient Egypt), Geography +6 (North America, Asia), AI&CS +3 (Strings/Arrays/if-else code labs), GameDev +3 (Health/Lives, Scoring, Feedback code labs), Homemaking +3 (Money & Budgeting), Building +3 (Finishing & Painting).
  - Varied interactives per lesson (NO match pile-ups): sims, arena (maths), code (CS/gamedev), match/ord/cloze/fc/mcq spread out. Standing rule still: one lesson-specific interactive, never stack the same type in a topic.
  - Commands: `npx convex dev --once` → `seedRichCurriculum` (52 created) → `calendar:generateYear` (716 entries). Topics auto-created.

- Phase 9h — **3×/week core rotation + big content batch (Sep–Mar fill)**:
  - **Calendar rotation fixed**: Maths/English/Science now appear EXACTLY 3×/week each (was daily → far too many IXL labels). New layout enforced by `buildStandardRotation()` in `calendar.ts` (used by both `generateYear` + `seedDefaultYear`): Mon maths/english/science · Tue maths/english/history/aics · Wed science/geography/history · Thu maths/english/homemaking · Fri science/gamedev/building. generateYear auto-patches the stored rotation if it differs (so every regenerate enforces it). Calendar dropped 716→602 entries (fewer core slots).
  - **+44 robust new lessons** (no duplicate topics): Maths +14 (Written Methods, 3D Shapes & Volume, Coordinates & Graphs, Probability), English +12 (Story Writing, Word Building, Advanced Grammar), Science +10 (Animals & Habitats, Materials & Properties, Earth & Environment, Scientific Enquiry), History +4 (The Tudors), Geography +4 (South America). Each ~heading+text+example+keyPoints+1 varied interactive (match/ord/cloze/arena/fc/mcq) + 5Q.
  - Commands: `npx convex dev --once` → `seedRichCurriculum` (44 created) → `calendar:generateYear` (602 entries, rotation auto-patched).
  - **Note**: full Sep–Mar fill of every daily maths/english slot needs more batches (still ~3×/week × 30 weeks ≈ 90 slots per core subject). This batch meaningfully extends coverage; repeat for the cores to finish.

### STANDING RULE — duplicate lessons
When two lessons cover the same ground (e.g. an old text-only seedLessons title vs a rich curriculum title — "How the Heart Pumps Blood" vs "The Heart & Blood"), the one **WITHOUT** an interactive is the one changed into something NEW/unique (different angle), keeping its `_id`/`topicId` stable. `enrichLessons:replaceDuplicateLessons` did this for 4 science dups → "Blood Vessels…", "Series & Parallel Circuits", "Density…", "Measuring Forces". Apply the same rule to other subjects as duplicates are found.

- Phase 9e — **Electricity activities + science duplicate cleanup**:
  - `attachElectricityActivities` mutation (idempotent) added rich interactives to the 5 Electricity lessons: match (electrical quantities), `circuit` sim (Simple Circuits), match (conductor/insulator real-world parts), match (circuit symbols), cloze (safety). Source of truth also updated in `convex/curriculum/science.ts` (imported `match`/`cloze`).
  - `replaceDuplicateLessons` mutation (idempotent) replaced the 4 old text-only science duplicates IN PLACE (stable IDs/topicIds, rebuilt quizzes) with unique lessons: Human Body → "Blood Vessels: Arteries, Veins & Capillaries"; Electricity → "Series & Parallel Circuits"; States of Matter → "Density: Why Things Float or Sink"; Forces → "Measuring Forces". Each has rich content + a match interactive + fresh 5Q quiz.
  - Commands: `npx convex dev --once` → `npx convex run enrichLessons:attachElectricityActivities` → `npx convex run enrichLessons:replaceDuplicateLessons` → `npx convex run calendar:generateYear`.

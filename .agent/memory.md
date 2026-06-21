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
- Convex CLI authenticates non-interactively via the deploy key (browser login was flaky in non-interactive shell). Always prefix Convex CLI with `set -a; source .env.local; set +a` (values are quoted because deploy key contains `|`).
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
- **Convex MCP disabled** in `~/.config/opencode/opencode.json` (auth bug with v2 tokens). Verify Convex via CLI: `npx convex run <fn>` / `npx convex dev --once`. Convex auto-loads `.env.local`.
- **GitHub**: repo `darkjedig/homeschool-hero` created (public). Fine-grained PAT now has Contents:Write. Push works via `git push "https://x-access-token:<PAT>@github.com/darkjedig/homeschool-hero.git" main:main`.

## Next Steps (Phase 10)

### Curriculum follow-ups (optional polish)
- 4 lessons skipped in the rich seed (title overlap with original text-only seedLessons, e.g. "What Is a Fraction?", "Finding the Main Idea"). They still render fine via `lessonNotes` fallback, but lack rich `content` blocks. Patch by renaming/deleting the old text-only versions or adding content to them.
- To add MORE lessons: edit the relevant `convex/curriculum/<subject>.ts`, then re-run `npx convex run seedRichCurriculum:seedRichCurriculum` (idempotent) + `npx convex run calendar:generateYear`.
- Interactive content authoring: builders `mcq/fc/ord/tl` live in `convex/curriculum/types.ts`. Reveal = `{key:"question"|"option_0..3"|"answer"|"explanation"}`.

### Remaining work
- Phase 10: Full RBAC audit, Playwright + Vitest, mobile polish, error boundaries, README.

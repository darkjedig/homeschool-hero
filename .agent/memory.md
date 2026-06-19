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

## Recent Progress — Phases 1, 2, 3 COMPLETE
- Phase 1: scaffold + Convex wiring + smoke test.
- Phase 2: schema (17 tables + indexes), authHelpers (roles), seed (8 subjects + 39 topics), read queries.
- Phase 3: full student portal — app shell + sidebar, dashboard mirroring mockup (all rows/components), subject/lesson(YouTube IFrame island with per-second progress)/quiz/rewards pages, `lib/subjects.ts` design-token map, `lib/auth-guard.ts` (no-op until login UI). Convex fns: topics, lessons, videoProgress, quizzes (getWithQuestions/submitAttempt), rewards (listActive/redeem), points (balance). Stub nav routes via `ComingSoon`. Typecheck + lint 0 errors; dev server renders all pages. Blog Part 2 written at `blog/2026-06-19-part-2-*.md`.

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
- **Convex MCP disabled** in `~/.config/opencode/opencode.json` (auth bug: v2 token "Not Authorized" loop even with valid login + override). Verify Convex via CLI instead: `npx convex run <fn>` and `npx convex dev --once` (convex auto-loads `.env.local`; do NOT `source` it in zsh — the `|` in the deploy key breaks sourcing). Cloud `oceanic-crane-853` is fully working via CLI + deploy key + the running Next.js app.
- **GitHub repo creation blocked**: fine-grained PAT returns 403 for `POST /user/repos`. Repo `darkjedig/HomeschoolHero` not created; user must create manually or supply a classic PAT with `repo` scope.

## Next Steps (Phase 4)
- Parent dashboard: same design tokens, data-dense admin layout (Recharts charts), manual full-course + single-lesson builders (`courses:create`, `lessons:create`), reward manager CRUD, CSV/JSON export action. This creates real lessons (status: published) so the student portal has content. Auth login UI (creates parent/student accounts → userProfiles.role) should land here too so RBAC activates.

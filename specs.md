# HomeschoolHero — Build Specs

Gamified, cloud-backed homeschool platform: student portal (video lessons, quizzes, points, badges, Friday quiz, reward shop) + parent admin dashboard (progress, manual + AI lesson builder, reward manager, CSV/JSON export). Single-student MVP, role-based access, real-time via Convex.

**Plan**: `.cursor/plans/homeschoolhero_implementation_plan_6b99cba7.plan.md`
**Design standard**: `.cursor/skills/design/SKILL.md`
**Backend**: Convex deployment `oceanic-crane-853` (dev/ryan-gliozzo) — `https://oceanic-crane-853.eu-west-1.convex.cloud`

---

## Phase Checklist

### Phase 1 — Foundation & Convex Wiring  ✅ COMPLETE
- [x] Scaffold Next.js 16 (TS, Tailwind v4, App Router, ESLint, `@/*` alias)
- [x] Install deps: convex, @convex-dev/auth, lucide-react, framer-motion, recharts
- [x] shadcn/ui initialised; added button, card, input, label, dialog, drawer, badge, progress, table, tabs
- [x] Convex linked to existing `oceanic-crane-853` (deploy-key auth, non-interactive)
- [x] `.env.local` set (NEXT_PUBLIC_CONVEX_URL, CONVEX_DEPLOY_KEY, CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_SITE_URL)
- [x] `ConvexAuthProvider` wired via `app/providers.tsx` in `app/layout.tsx`
- [x] `convex/hello.ts` smoke query → returns `"HomeschoolHero online"`
- [x] `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts` created via `@convex-dev/auth` setup; SITE_URL/JWT_PRIVATE_KEY/JWKS set on deployment
- [x] Design tokens seeded in `app/globals.css` (`@theme`) + `tailwind.config.ts` reference
- [x] `specs.md` + `.agent/memory.md` initialised
- [x] **Gate**: smoke test shows live Convex data (verified: `convex run hello:hello` → `"HomeschoolHero online"`; home page SSR + client hydration wired)
- [ ] Convex MCP read tools (tables/functionSpec/run) — pending opencode restart to load deploy key into MCP server

### Phase 2 — Core Data Model  ✅ COMPLETE
- [x] `convex/schema.ts` with 17 tables + indexes (spreads `authTables` from `@convex-dev/auth`): userProfiles, subjects, topics, lessons, quizzes, quizQuestions, quizAttempts, fridayQuizzes, videoProgress, pointsLedger, rewards, rewardRedemptions, badges, studentBadges, aiLessonDrafts, aiCourseDrafts, settings + auth component tables
- [x] Role-based access via `convex/authHelpers.ts` (`requireRole`/`requireParent`/`requireStudent`) using `getAuthUserId` + `userProfiles.role` (`parent`/`student`)
- [x] `convex/auth.ts` + `convex/auth.config.ts` (Convex Auth wired)
- [x] Schema pushed to cloud `oceanic-crane-853` (all indexes created)
- [x] Seed script `convex/seed.ts` → 8 subjects + 39 starter topics seeded (idempotent)
- [x] Read queries (`subjects:list`, `subjects:bySlug`) verified live
- [ ] Sample lessons: deferred to Phase 3/4 (require a parent `createdBy` account, created via sign-in flow)
- [ ] Parent + student accounts: created when auth login UI lands (Phase 3); role mechanism ready

### Phase 3 — Student Portal MVP  ✅ COMPLETE
- [x] Student app shell: `app/(student)/layout.tsx` + `components/student/student-sidebar.tsx` (logo, 8 nav items, profile card, XP bar, 7-day streak)
- [x] `lib/auth-guard.ts` (no-op until auth login UI lands) + `lib/subjects.ts` (subject meta: colours/icons/design tokens)
- [x] Dashboard `app/(student)/dashboard/page.tsx` mirroring mockup: header + mascot, 4 stat cards, missions | continue learning | Friday countdown, overall-progress donut | Core Subjects grid | achievements | parent insights, reward-shop strip + hint card + FAB
- [x] All 13 components from design checklist (sidebar, header, stat-card, mission-card, continue-learning, friday-challenge, overall-progress, subject-tile, achievement-badge, reward-shop-strip, hint-card, ai-mascot, FAB) + `youtube-player` island
- [x] Subject overview `subjects/[slug]` + subjects index (live Convex: subjects + topics)
- [x] Lesson page `lessons/[id]` with YouTube IFrame island (per-second progress → `videoProgress:upsert`, resume from timestamp, complete @ 90%)
- [x] Quiz flow `quiz/[id]` (one Q per screen, immediate feedback, score + points, retry) → `quizzes:submitAttempt`
- [x] Reward shop `rewards` (balance, redeem with balance check) → `rewards:redeem`
- [x] Convex functions: topics, lessons, videoProgress, quizzes (getWithQuestions/getForLesson/submitAttempt), rewards (listActive/redeem), points (balance)
- [x] Placeholder nav routes (lessons/quiz/progress/friday-quiz/settings) via shared `ComingSoon`
- [x] Verified: typecheck 0 errors, lint 0 errors, dev server renders dashboard + subject + rewards pages
- [ ] Live student values (points/streak/progress) still placeholder until auth login UI + student account active (Phase 4/9)
- [ ] Framer Motion entrance animations (Phase 8)

### Phase 4 — Parent Dashboard MVP  ✅ COMPLETE
- [x] Auth login page `app/(auth)/login` (anonymous sign-in + role claim → `userProfiles.ensureMine`/`setMyRole`)
- [x] Parent shell `app/parent/layout.tsx` + `components/parent/parent-sidebar.tsx` (real `parent` segment — route groups collide with student)
- [x] Parent dashboard `app/parent/dashboard` (Recharts bar + area, stat cards, recent attempts table, `dashboard.overview`)
- [x] Manual full-course builder `app/parent/courses/new` (subject → topics → lessons + quiz questions → transactional `courses.create`)
- [x] Single-lesson builder `app/parent/lessons/new` (`lessons.createSingle`) + lesson manager `app/parent/lessons` (publish/unpublish via `lessons.setStatus`)
- [x] Reward manager `app/parent/rewards` (CRUD via `rewards.create/update`, approve redemptions `rewards.approveRedemption`)
- [x] Export `app/parent/history` (CSV + JSON via `export.exportCsv`/`exportJson` action + internal `exportData.allData` query)
- [x] RBAC: all parent mutations/actions call `requireParent`; redeem enforces balance
- [x] Verified: typecheck 0 errors, lint 0 errors, all parent + login + student routes 200
- [ ] Real account/invitation flow + stricter role assignment (Phase 9)

### Phase 5 — Friday Quiz System  ✅ COMPLETE
- [x] Schema tweak: `quizAttempts.quizId` optional + `fridayQuizId` field + `by_friday_quiz` index (Friday attempts reference the weekly doc, not a single lesson quiz)
- [x] `convex/fridayQuiz.ts`: `getCurrent` (this week's challenge + questions, enriched with subjectId), `generateForWeek` (internal; idempotent; samples prior-week completed-lesson questions, fallback to any published, deterministic shuffle, 10 Q), `submitFriday` (records attempt + **double points** via pointsLedger `friday_quiz`), `listHistory` (parent), `generateCurrentWeek` (parent dev trigger)
- [x] `convex/crons.ts`: weekly cron `5 0 * * 1` (Mon 00:05) → `generateForWeek`
- [x] Student `app/(student)/friday-quiz/page.tsx`: purple boss-level intro (Framer Motion), 10-Q one-per-screen flow with instant feedback, results screen with score + 2× points + per-subject strong/weak + recommended review (<70%)
- [x] Dashboard Friday card "Get Ready!" → links to `/friday-quiz`
- [x] Verified: typecheck/lint 0 errors, Convex pushed (cron live), pages render
- [ ] Populate with real content (parent builds course → cron/auto generates weekly challenge)

### Phase 6 — Adaptive Learning  ⏳
- [ ] Rolling per-topic performance, next-difficulty query
- [ ] Get-Help drawer below 60%, recommended-review list

### Phase 7 — AI Course & Lesson Builder (OpenRouter BYOK)  ⏳
- [ ] Parent AI settings (BYOK key stored server-side, never exposed)
- [ ] Convex action `aiCourseBuilder:generate` (OpenRouter, up to 10 min)
- [ ] Full-course + single-lesson draft review/approve flow (transactional publish)

### Phase 8 — Premium UI & Gamification  ⏳
- [ ] Framer Motion animations (stagger, confetti, level-up, rings)
- [ ] Interactive learning objects (timelines, drag-drop, simulations)
- [ ] Badges engine + dashboard verification against mockup checklist

### Phase 9 — Security, Testing, Polish  ⏳
- [ ] RBAC audit on every Convex function + route group
- [ ] Playwright smoke + Vitest unit tests
- [ ] Mobile polish, error boundaries, optimistic updates
- [ ] README + specs finalised, Vercel deploy

---

## Architecture Notes

- **Convex only**: database, auth, storage, realtime, scheduled crons. AI generation is Phase 7 (Convex action).
- **Component files**: kebab-case.
- **RSC-first**: minimal `'use client'` (providers, charts, countdown, video player, FAB).
- **No secrets in browser**: only `NEXT_PUBLIC_*` exposed; deploy/BYOK keys stay server-side.

## Design Token Reference (v4 CSS-first, see `app/globals.css`)

| Class intent | Token |
|---|---|
| Page bg | `bg-app` (`#050810`) |
| Card surface | `bg-card` (`#0f172a`) / `bg-card-hover` (`#1e293b`) |
| Primary text | `text-foreground` (`#ffffff`) |
| Secondary text | `text-muted-foreground` (`#94a3b8`) |
| Subtle border | `border-subtle` (`rgba(255,255,255,0.08)`) |
| Accents | `accent-blue/purple/green/orange/gold/pink/cyan` |
| Subjects | `maths / english / science / history / aics / gamedev / homemaking / building` |

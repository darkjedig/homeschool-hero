---
name: design
description: HomeschoolHero UI/UX design standards and student dashboard layout. Use when building or styling any HomeschoolHero page, component, layout, Tailwind theme, or when the user mentions design, dashboard, visual style, gamification UI, or references the HomeschoolHero mockup.
---

# HomeschoolHero Design Standards

Reference mockup: [ChatGPT Image Jun 18, 2026, 12_32_48 PM.png](../../../ChatGPT%20Image%20Jun%2018,%202026,%2012_32_48%20PM.png)

When implementing UI, **mirror the exact layout of the mockup** for the student dashboard. Do not substitute a generic admin dashboard or default shadcn styling.

---

## Design Intent

Premium gamified homeschool app — dark space theme, neon accents, rounded cards, soft glows, motivating copy. Feels like a learning game, not a school admin system.

**Student portal**: follow this skill closely.
**Parent portal**: same design tokens (colors, radius, typography) but cleaner, data-dense layout — no mascot clutter.

---

## Theme Tokens

Define in `tailwind.config.ts` and CSS variables in `globals.css`.

### Colors

| Token | Hex (approx) | Usage |
|-------|--------------|-------|
| `bg-app` | `#050810` | Page background (deep navy/black) |
| `bg-card` | `#0f172a` / `#111827` | Card surfaces |
| `bg-card-hover` | `#1e293b` | Hover / active card |
| `border-subtle` | `rgba(255,255,255,0.08)` | Card borders |
| `text-primary` | `#ffffff` | Headings, key numbers |
| `text-secondary` | `#94a3b8` | Labels, subtext |
| `accent-blue` | `#3b82f6` | Primary actions, active nav, FAB |
| `accent-purple` | `#a855f7` | Friday Challenge, English |
| `accent-green` | `#22c55e` | Science, success, streak checks |
| `accent-orange` | `#f97316` | History, streak flame |
| `accent-gold` | `#eab308` | Points, stars, rewards |
| `accent-pink` | `#ec4899` | Game Dev, Homemaking |
| `accent-cyan` | `#06b6d4` | AI & CS, glow highlights |

### Subject Colors (consistent everywhere)

| Subject | Accent |
|---------|--------|
| Maths | Blue `#3b82f6` |
| English | Purple `#a855f7` |
| Science | Green `#22c55e` |
| History | Orange `#f97316` |
| AI & Computer Science | Cyan `#06b6d4` |
| Game Development | Pink `#ec4899` |
| Homemaking | Rose `#f43f5e` |
| Building & Construction | Stone/Amber `#78716c` / `#d97706` |

### Typography

- **Font**: Inter (or Geist Sans) — clean modern sans-serif
- **Page title / greeting**: `text-2xl`–`text-3xl`, `font-bold`, white
- **Section headings**: `text-lg`, `font-semibold`, white
- **Card labels**: `text-sm`, `text-secondary`
- **Stat numbers**: `text-3xl`–`text-4xl`, `font-bold`, white
- **Monospace accents**: optional for countdown timer digits

### Shape & Effects

- **Border radius**: `rounded-2xl` (16px) cards; `rounded-3xl` (24px) hero/feature cards; `rounded-full` avatars and day pills
- **Glassmorphism**: `bg-white/5 backdrop-blur-md border border-white/10`
- **Glow**: `shadow-[0_0_20px_rgba(59,130,246,0.3)]` on active nav and primary buttons; subject-colored glow on mission cards
- **Progress bars**: `h-2` rounded-full; filled portion uses subject or accent gradient

### Icons

- Sidebar nav: thin line icons (Lucide)
- Dashboard content: colorful illustrative icons (custom SVG or 3D-style assets); subject cards use distinct icon per subject

### Motion (Framer Motion)

- Card entrance: stagger `0.05s`, fade + slide up `y: 12 → 0`
- Progress bars: animate width on mount
- Countdown: tick every second; no jarring layout shift
- Hover: subtle scale `1.02` on mission cards and subject tiles

---

## App Shell Layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (fixed, w-64)  │  MAIN CONTENT (flex-1, overflow-y-auto)        │
│                        │  ┌─ Header row ─────────────────────────────┐ │
│ Logo                   │  │ Greeting + AI mascot    │ stats │ bell │ av│ │
│ Nav links              │  └────────────────────────────────────────────┘ │
│                        │  ┌─ Stats row (4 equal cards) ────────────────┐ │
│ User profile card      │  │ Points │ Streak │ Level │ Weekly Goal      │ │
│ XP bar                 │  └────────────────────────────────────────────┘ │
│                        │  ┌─ Middle row (3 columns) ───────────────────┐ │
│ 7-day streak tracker   │  │ Today's Missions │ Continue │ Fri Challenge│ │
│                        │  └────────────────────────────────────────────┘ │
│                        │  ┌─ Bottom row (4 columns) ───────────────────┐ │
│                        │  │ Overall Progress │ Core Subjects │ Achieve │ │
│                        │  │ Parent Insights  │                         │ │
│                        │  └────────────────────────────────────────────┘ │
│                        │  ┌─ Footer widgets ───────────────────────────┐ │
│                        │  │ Reward Shop │ Need a Hint? │         [FAB]│ │
│                        │  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Grid breakpoints**

- Desktop (`lg+`): sidebar fixed 256px; main uses the grid below
- Tablet: sidebar collapses to icon rail or drawer
- Mobile: single column stack; preserve section order

---

## Student Dashboard — Exact Section Spec

File target: `app/(student)/dashboard/page.tsx`

### 1. Sidebar (`components/student/student-sidebar.tsx`)

**Logo (top)**
- Rocket icon + "HomeschoolHero" wordmark

**Navigation (vertical list)**
| Item | Route | Notes |
|------|-------|-------|
| Home | `/dashboard` | Active: blue glow background pill |
| Subjects | `/subjects` | |
| Lessons | `/lessons` | |
| Quizzes | `/quiz` | |
| Friday Challenge | `/friday-quiz` | |
| Rewards | `/rewards` | |
| Progress | `/progress` or badges | |
| Settings | `/settings` | |

**User profile card (bottom, above streak)**
- Circular avatar (student photo/illustration)
- Name: "Hudson" (dynamic)
- Rank title: "Explorer"
- Level badge: "12"
- XP progress bar: `2,350 / 3,000 XP` (dynamic from Convex)

**7-Day Streak tracker (very bottom)**
- Label: "7 Day Streak!" with flame icon
- Row of 7 circles: M T W T F S S
- Completed days: green checkmark fill
- Current day: orange flame highlight

---

### 2. Header Row (`components/student/dashboard-header.tsx`)

**Left**
- Heading: `Welcome back, {name}! 👋`
- Subtext: `Ready to learn, build, and level up? Let's go!`

**Center-left (AI mascot widget)**
- Floating 3D robot head in glowing blue sphere
- Speech bubble: `You've got this! Keep being awesome.`

**Right (top bar stats)**
- Blue diamond icon + points total (e.g. `2,450`)
- Gold star icon + secondary currency (e.g. `18`)
- Notification bell with red dot badge
- Circular user avatar thumbnail

---

### 3. Top Stats Row — 4 equal cards (`components/student/stat-card.tsx`)

Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`

| Card | Icon | Primary | Secondary |
|------|------|---------|-----------|
| **Points** | Gold coin/star | `2,450` | `+150 this week` (green) |
| **Current Streak** | Flame | `7 Days` | `Best: 12 days` |
| **Level** | Purple hex shield | `12` + "Explorer" | XP progress bar |
| **Weekly Goal** | Target | `72%` | `5 of 7 missions` + progress bar |

Each card: dark glass card, icon top-left, large number, muted label below.

---

### 4. Middle Row — 3 columns

Grid: `grid grid-cols-1 xl:grid-cols-12 gap-4`

#### 4a. Today's Missions (left, `xl:col-span-4`)

Section title: **Today's Missions**

Horizontal row / grid of **4 vertical subject cards**:

| Card | Subject | Sub-topic example | Progress | Points |
|------|---------|-------------------|----------|--------|
| 1 | Maths | Fractions | bar + % | 120 |
| 2 | English | Grammar | bar + % | 100 |
| 3 | Science | Solar System | bar + % | 150 |
| 4 | History | World War II | bar + % | 130 |

Each mission card:
- Subject-colored top border or glow
- Subject icon (3D/color)
- Title + sub-topic
- Progress bar with percentage
- Point reward pill at bottom

#### 4b. Continue Learning (center, `xl:col-span-5`)

Section title: **Continue Learning**

Wide hero card:
- Thumbnail: lesson video still (e.g. "The Solar System" with planets)
- Play button overlay (center)
- Subject tag pill: "Science"
- Meta: `Lesson 4 of 8` + progress bar
- Primary CTA: large blue button **Continue Lesson**

#### 4c. Friday Challenge (right, `xl:col-span-3`)

Purple-themed featured card:
- Game controller icon
- Title: **Game Dev Challenge** (or current week's challenge subject)
- Subtitle: e.g. `Build a Platformer Level`
- Countdown: `Starts in 02 Days 14 Hours 37 Mins 25 Secs` (monospace, live)
- CTA: **Get Ready!** button

---

### 5. Bottom Row — 4 widgets

Grid: `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4`

#### 5a. Overall Progress (left)

- Donut chart center: **72% Overall**
- Legend (right or below):
  - Lessons Completed — 72%
  - Quizzes Passed — 68%
  - Challenges Done — 60%
  - Badges Earned — 75%

Use Recharts `PieChart` with inner radius for donut; segment colors match accent palette.

#### 5b. Core Subjects (center-left)

Section title: **Core Subjects**

2×4 grid of small subject tiles:

| Maths | English | Science | History |
| AI & CS | Game Dev | Homemaking | Building |

Each tile: icon, name, mini progress bar + percentage.

#### 5c. Recent Achievements (center-right)

Section title: **Recent Achievements**

Horizontal row of 4 circular medal/badge icons:
- Streak Master
- Science Star
- Quiz Whiz
- Early Bird

#### 5d. Parent Insights (right)

Small card:
- Title: **Parent Insights**
- CTA link/button: **Open Parent View** / **View Dashboard**
- Only visible to parent role or hidden on student view (student sees a simplified "Ask parent" variant if needed)

---

### 6. Footer Widgets (below bottom row)

Grid: `flex flex-wrap gap-4 items-end justify-between`

#### Reward Shop strip
- Title: **Reward Shop**
- 3 item chips in a row:
  - Neon Rocket — ⭐ 500
  - Galaxy Headset — ⭐ 800
  - Hero Cape — ⭐ 1200

#### Need a Hint?
- Small card with robot mascot thumbnail
- Text: **Need a Hint?**
- Button: **Ask for Help** (opens Get Help drawer)

#### Floating Action Button (FAB)
- Fixed bottom-right: `fixed bottom-6 right-6`
- Blue circle, white star icon
- Primary quick action (e.g. jump to rewards or daily mission)

---

## Component Checklist

Build these as reusable components before page assembly:

```
components/student/
├── student-sidebar.tsx
├── dashboard-header.tsx
├── stat-card.tsx
├── mission-card.tsx
├── continue-learning-card.tsx
├── friday-challenge-card.tsx
├── overall-progress-chart.tsx
├── subject-tile.tsx
├── achievement-badge.tsx
├── reward-shop-strip.tsx
├── hint-card.tsx
├── ai-mascot.tsx
└── floating-action-button.tsx
```

---

## Parent Dashboard Adaptation

Reuse tokens only — **do not copy the student dashboard layout**.

- Same `bg-app`, card styles, subject colors, typography
- Replace mascot/streak/gamification hero with data cards: weekly progress, quiz scores, watch time, weak areas
- Charts: Recharts bar/line instead of donut gamification where appropriate
- Navigation: separate `(parent)` sidebar with admin links (dashboard, courses, lessons, AI builder, rewards, export, settings)

---

## Implementation Rules

1. **Match the mockup layout first**, then wire Convex data — use placeholder data that matches mockup values during development.
2. Use **semantic HTML**: `nav`, `main`, `section`, `aside`, `header`.
3. Keep client components small: charts, countdown, mascot animation, FAB only.
4. All stat numbers, progress %, streak, missions come from **Convex queries** — no hardcoded production values.
5. One clear primary action per section (Continue Lesson, Get Ready, Ask for Help).
6. Avoid Bootstrap defaults, plain white backgrounds, or unstyled shadcn out of the box — always apply HomeschoolHero tokens.
7. Mobile: stack sections in order listed above; sidebar becomes drawer.

---

## Tailwind Snippets

**Glass card**
```tsx
className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
```

**Active nav item**
```tsx
className="rounded-xl bg-blue-500/20 text-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
```

**Primary button**
```tsx
className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400"
```

**Subject mission card (example: Maths)**
```tsx
className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent p-4 shadow-[0_0_24px_rgba(59,130,246,0.15)]"
```

---

## Verification

Before marking dashboard UI complete, compare against the mockup:

- [ ] Sidebar: logo, 8 nav items, profile card, streak tracker
- [ ] Header: greeting, mascot + bubble, diamond/star stats, bell, avatar
- [ ] 4 stat cards in top row
- [ ] Middle: 4 mission cards | continue learning hero | Friday challenge with countdown
- [ ] Bottom: donut chart | 8 subject tiles | 4 achievement badges | parent insights
- [ ] Footer: reward shop strip | hint card | FAB bottom-right
- [ ] Dark theme, rounded corners, glow effects throughout

For detailed wireframe ASCII, see [dashboard-layout.md](dashboard-layout.md).

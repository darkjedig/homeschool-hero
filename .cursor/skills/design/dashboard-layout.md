# Student Dashboard — Wireframe Reference

Source: [ChatGPT Image Jun 18, 2026, 12_32_48 PM.png](../../../ChatGPT%20Image%20Jun%2018,%202026,%2012_32_48%20PM.png)

## Full Page ASCII Wireframe

```text
+----------+------------------------------------------------------------------+
| ROCKET   | Welcome back, Hudson! 👋                    💎2450 ⭐18 🔔 👤   |
| HomeSchool| Ready to learn, build, and level up? Let's go!                  |
| Hero     |                                                                  |
|          |  [🤖 robot in blue orb]  "You've got this! Keep being awesome."  |
|----------|------------------------------------------------------------------|
| 🏠 Home* | +------------+ +------------+ +------------+ +------------+     |
| Subjects | | ⭐ Points  | | 🔥 Streak  | | 🛡 Level   | | 🎯 Weekly  |     |
| Lessons  | |  2,450     | |  7 Days    | |  12        | |  Goal 72%  |     |
| Quizzes  | | +150/week  | | Best: 12   | | Explorer   | | 5 of 7     |     |
| Friday   | |            | |            | | [===--] XP | | [=====--]  |     |
| Rewards  | +------------+ +------------+ +------------+ +------------+     |
| Progress |                                                                  |
| Settings | Today's Missions                                                 |
|          | +--------+ +--------+ +--------+ +--------+                        |
|          | | Maths  | |English | |Science | |History |                        |
|          | |Fractions| |Grammar| | Solar  | | WWII   |                        |
|          | | [===]  | | [==]  | | [====] | | [==]   |                        |
|          | | 120pts | | 100pts| | 150pts | | 130pts |                        |
|          | +--------+ +--------+ +--------+ +--------+                        |
|          |                                                                  |
| [avatar] | Continue Learning          | Friday Challenge                    |
| Hudson   | +------------------------+ | +----------------------+            |
| Explorer | | [▶ Solar System thumb] | | | 🎮 Game Dev Challenge|            |
| Lv 12    | | Science  Lesson 4/8    | | | Build a Platformer   |            |
| [==XP==] | | [Continue Lesson    ]  | | | Starts in 02:14:37:25|            |
|          | +------------------------+ | | [ Get Ready!       ] |            |
| 7 Day    |                                                                  |
| Streak!  | +-------------+ +------------------+ +------------------+         |
| M✓T✓W✓.. | | Overall 72% | | Core Subjects    | | Recent Achieve.  |         |
|          | |  (donut)    | | [8 subject tiles]| | 🏅🏅🏅🏅         |         |
|          | | Lessons 72% | | 2x4 grid         | | Streak Science   |         |
|          | | Quizzes 68% | |                  | | Quiz   Early     |         |
|          | +-------------+ +------------------+ +------------------+         |
|          | | Parent Insights → Open Parent View |                             |
|          |                                                                  |
|          | Reward Shop: 🚀500 🎧800 🦸1200    Need a Hint? [Ask for Help]  ⭐ |
+----------+------------------------------------------------------------------+
```

## Column Proportions (Desktop xl+)

| Region | Grid span | Min width |
|--------|-----------|-----------|
| Sidebar | fixed 256px | 256px |
| Stats row | 4 × equal | — |
| Today's Missions | 4/12 | ~33% |
| Continue Learning | 5/12 | ~42% |
| Friday Challenge | 3/12 | ~25% |
| Bottom widgets | 4 × equal | — |

## Spacing

- Page padding: `p-6` main content
- Section gap: `gap-6` between major rows
- Card internal padding: `p-5`
- Sidebar nav item gap: `gap-1`, item padding `px-3 py-2`

## Z-Index Layers

| Layer | z-index | Elements |
|-------|---------|----------|
| Base content | 0 | Cards, grids |
| Sidebar | 40 | Fixed sidebar |
| FAB | 50 | Bottom-right star button |
| Drawers/modals | 60 | Get Help drawer |
| Toasts | 70 | Badge unlock, points earned |

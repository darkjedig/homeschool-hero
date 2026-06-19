# Building a Gamified Homeschooling App with GLM 5.2 — Part 3: The Parent Console, Builders, and Exports

June 19, 2026
11 min read

Ryan Gliozzo
Digital Marketing Expert
homeschool hero webapp build with glm 5.2
Project status: Parent dashboard, manual course + lesson builders, reward manager and CSV/JSON export all live. Phases 1–4 complete.

> Catch up: [Part 1](#) covered planning and setup, [Part 2](#) shipped the foundation, data model, and student dashboard. This post is about the parent side — the control room that makes the whole learning system manageable.

---

## The Other Half of the App

In Part 2 we built the fun half: the gamified student dashboard, the YouTube lesson player, the quizzes, and the reward shop. But a homeschool app is only useful if the person running it — me — can actually put content in front of my son, see how he is doing, and hand out rewards. That is what Phase 4 is about.

The design rule for the parent side was deliberate: reuse the same dark space theme and tokens, but do not copy the student dashboard. The parent console should feel like a calm, data-dense control room — no mascot, no streak flames, no gamification clutter. Just the numbers, the content tools, and the controls.

screenshot of the parent dashboard with stat cards and recharts charts
Figure 1: The parent console — same dark theme as the student side, but stripped back to data: stat cards, a lessons-per-subject bar chart, a quiz-score trend, and a recent attempts table.

---

## Step 1: A Way In (Sign-in and Roles)

Before the parent can do anything, the app needs to know who is signed in. We wired up Convex Auth with a simple entry screen: you arrive, pick "Enter as Parent" or "Enter as Student", and the app creates your profile with the right role.

It is a dev-friendly flow for now — anonymous sign-in under the hood — but the important part is the architecture. Every sensitive action is gated behind a `requireParent` check on the server. A student can never call the course builder or the export function, no matter what they try from the browser, because the role is checked inside the Convex mutation itself, not trusted from the client.

I want to be clear about that, because it matters for a kids' app: the security boundary lives on the server. Role assignment will be locked down properly with real accounts in a later phase, but the permission checks are already in the right place.

screenshot of the sign-in screen with parent and student buttons
Figure 2: The sign-in screen — pick a role and the app routes you to the right console, with the role enforced server-side on every action.

---

## Step 2: The Parent Dashboard

The first thing I see as a parent is an overview: how many subjects and published lessons exist, how many quiz attempts have been made, the average score, and total points earned. It is all live — when my son finishes a quiz, the numbers and the score trend chart update in real time through Convex's subscriptions.

I built two charts with Recharts: a bar chart of lessons published per subject (each bar in the subject's accent colour), and an area chart showing quiz scores across recent attempts. Underneath is a table of the latest quiz results. Right now, with a fresh database, the charts are sparse — but the plumbing is there, and as soon as lessons are published and quizzes are taken, the dashboard fills up automatically.

This is the difference between a real app and a mockup: the numbers are not hardcoded. They come from queries over the actual data, so they can never lie about progress.

screenshot of the recharts area chart showing quiz scores over recent attempts
Figure 3: The quiz-score trend — an area chart that updates live as new attempts come in.

---

## Step 3: The Course Builder (the big one)

This was the largest single piece of the project so far. I wanted to be able to sit down and build an entire course in one go: define a subject, lay out its topics, then add lessons under each topic — each with a YouTube video, notes, a difficulty level, points, and a set of quiz questions with correct answers and explanations.

The course builder is a multi-section form that does exactly that. You fill in the subject (name, slug, accent colour, icon), add as many topics as you like, then add lessons and assign each one to a topic. Each lesson expands to reveal its fields and a quiz-question editor where you write the question, four options, the correct answer, and an explanation that appears after answering.

screenshot of the course builder form with subject topics and an expanded lesson with quiz questions
Figure 4: The full-course builder — subject, topics, and an expanded lesson with its quiz questions, all created in a single transactional save.

The engineering detail I care about here is that the whole thing saves as **one transaction**. When I hit "Save course", a single Convex mutation creates the subject, all the topics, all the lessons, their quizzes, and every quiz question — atomically. It either all goes in or none of it does. That matters because a half-saved course would leave orphaned lessons pointing at topics that don't exist. Transactions are the reason the data stays clean.

There is also a lighter **single-lesson builder** for when I just want to add one lesson to an existing subject without standing up a whole course, plus a **lesson manager** that lists every lesson and lets me publish or unpublish them with one click. Drafts stay hidden from the student until I flip them to published — a rule enforced in the student-facing queries.

---

## Step 4: The Reward Manager

The reward shop only works if I can stock it. The reward manager lets me create rewards (a toy, pocket money, extra screen time — whatever I decide), set a points cost, and hide or show them. When my son redeems something, it shows up as a request that I can approve from the same screen.

The redeem logic does the boring-but-critical maths correctly: it checks the student actually has enough points before letting them spend, deducts the points by writing a negative entry to the points ledger, and records the redemption. You cannot redeem a reward you cannot afford — the server enforces it, not the button.

screenshot of the reward manager with a create form rewards table and redemption requests
Figure 5: The reward manager — create rewards, edit costs, toggle visibility, and approve redemption requests, all in one place.

---

## Step 5: Exporting the Learning History

As a parent, one of my least favourite things about most learning apps is that my data is trapped inside them. So I built an export that downloads everything — subjects, lessons, quiz attempts, video watch time, the full points ledger, and redemption history — as either CSV or JSON.

This runs as a Convex action (which can use the Node runtime and run for up to ten minutes, so it will not time out even as the data grows). It aggregates the data through a parent-only internal query, formats it, and streams it back as a file download. The CSV is spreadsheet-friendly; the JSON is a full structured backup I could re-import if I ever needed to.

screenshot of the export page with download csv and download json buttons
Figure 6: One-click export — the entire learning history as CSV or JSON, parent-only.

The permission check lives inside the action's query, so even if someone found the endpoint, they would still need the parent role to get anything back.

---

## What Tripped Us Up

A couple of honest notes on what went wrong, because that is the point of writing these.

The first was a Next.js routing subtlety. I had put the parent pages under a route group called `(parent)`, expecting them to live at `/parent/dashboard`. But route groups in the App Router do not create URL segments — so the parent dashboard was resolving to the same `/dashboard` path as the student dashboard, and Next.js quite rightly refused to compile two pages at the same path. The fix was to use a real `parent` segment instead of a group. A small thing, but the kind of detail that will catch you if you learned routing on an older version.

The second was a typing discipline issue that cascaded. One Convex function had a loose type on an ID field, which made a downstream query's return type collapse to `any`, which then made a whole batch of `.map()` callbacks in the frontend lose their types all at once. It looked like a dozen broken components; really it was one upstream type. Fixing the root cause fixed all of them. It was a good reminder that when many things break at once, look for the single shared dependency.

---

## Where We Are Now

- A parent can sign in and is recognised by role.
- The parent dashboard shows live counts, charts and recent activity.
- Entire courses can be built in one transactional flow, or single lessons added to existing subjects.
- Lessons can be published and unpublished, and drafts stay hidden from the student.
- Rewards can be created, priced, toggled, and redemptions approved.
- The full learning history exports to CSV or JSON.

The student and parent sides now form a complete loop: I build the content, my son learns from it, his progress flows back to my dashboard in real time, and I can reward him and export the record. That is a minimum viable product skeleton, end to end.

screenshot of the github commit history showing phase 3 and phase 4 commits
Figure 7: The repo on GitHub — Phase 4 committed on top of the student portal.

---

## What Comes Next

With the two MVP sides working, the next phases add the things that make it actually feel like a game. Phase 5 is the **Friday Challenge** — a weekly boss-level quiz that pulls questions from the week's lessons and awards double points, generated automatically by a scheduled cron job. Phase 6 is **adaptive learning**, where the app watches performance per topic, dials difficulty up when my son is acing it, and slides open a "Get Help" drawer with simpler explanations when he scores below 60%.

Then the big one: Phase 7 is the **AI lesson builder**, where I plan to give the agent a topic, have it research and draft a full lesson with a video suggestion and quiz questions, and let me review and approve it before it reaches my son.

The takeaway from this stage: building the parent tools first, alongside the student experience, is what turns a demo into a product. A shiny dashboard means nothing if there is no way to put content behind it. Now there is.

We will be back with Part 4 once the Friday Challenge and adaptive learning are in. Thanks for reading.

---

*This is the third in a series of posts. We will keep updating as each phase ships.*

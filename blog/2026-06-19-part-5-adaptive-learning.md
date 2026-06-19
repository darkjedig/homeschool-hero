# Building a Gamified Homeschooling App with GLM 5.2 — Part 5: Adaptive Learning

June 19, 2026
8 min read

Ryan Gliozzo
Digital Marketing Expert
homeschool hero webapp build with glm 5.2
Project status: Adaptive difficulty + Get-Help drawer + recommended review live. Phases 1–6 complete.

> Catch up: [Part 1](#) planned it, [Part 2](#) built the foundation and student dashboard, [Part 3](#) shipped the parent console, [Part 4](#) added the weekly Friday boss battle. This post is about making the app respond to how my son is actually doing — not treating every result the same.

---

## Why Adaptivity Matters

A fixed-difficulty quiz is a blunt instrument. If a child aces every Maths question for three weeks, the quiz is too easy and they coast. If they keep scoring 40% in a topic, another hard quiz does not teach them — it just demoralises them. Good teaching adjusts. The app should too.

Phase 6 makes HomeschoolHero pay attention. It tracks how my son does in each topic over time, surfaces the weak spots on the dashboard, dials difficulty up or down for the next quiz, and — the bit I care about most — refuses to let a bad score just sit there. Score under 60% and a Get Help drawer slides up with a calmer explanation and a way back to the lesson.

screenshot of the dashboard recommended review widget highlighting weak topics in orange
Figure 1: The new "Recommended Review" widget on the dashboard — weak topics (under 70%) flagged in orange, each linking straight back to its subject.

---

## Step 1: A Rolling Picture of Each Topic

The first job is knowing, per topic, how he is trending. Every quiz attempt already records a percentage and is linked (via its quiz) to a topic. So we built a query that walks the attempt history for the current student, groups it by topic, and keeps the last five attempts per topic — a rolling average rather than an all-time one, so recent progress counts more than ancient results.

That single query powers two things: the Recommended Review list (any topic averaging under 70%), and the next-difficulty decision. It deliberately ignores Friday Challenge attempts for topic-level maths, because those pull questions from across the week and would muddy the per-topic signal.

---

## Step 2: Difficulty That Moves With Him

From that rolling average we derive a recommended difficulty tier for a topic: 85% and above suggests advanced material, 65% and up stays at intermediate, anything below drops back to beginner, and no data yet starts gentle. It is exposed as a simple query so the quiz and lesson flows can ask "how hard should the next one be?" and get a one-word answer.

This is the foundation for the smart version coming later — once AI-generated lessons exist, the difficulty tier can shape what gets generated next, not just what is recommended. For now it is a clean, honest signal running on real data.

---

## Step 3: The Get-Help Drawer (the heart of this phase)

This is the part I wanted most. The rule is simple: if my son scores under 60% on a quiz, the results screen does not just say "3 out of 10" and leave him there. It shows a "Get Help" button. Tap it and a drawer slides up from the bottom with:

- A clear re-explanation of every question he got wrong, using the explanation written into that question.
- A short list of step-by-step hints — re-read the question, eliminate obvious wrong answers, break the problem into steps — to nudge him toward the answer without handing it over.
- A button to jump straight back to the lesson to rewatch the relevant bit.
- A "Try again" button so he can retry immediately.

The tone is deliberate. The copy says "let's get this sorted" and "you've got this", not "you failed". The colour is a gentle orange prompt, not a red error. The point is to make support feel immediate and calm rather than stressful — exactly the feeling we described in the original brief.

screenshot of the get help drawer sliding up with missed question explanations and step by step hints
Figure 2: The Get-Help drawer — missed questions explained simply, step-by-step hints, and a path back to the lesson and a retry.

The same drawer is wired into the "Need a Hint?" card that already lives on the dashboard, so he can open it any time he is stuck, not only after a low score. One component, two entry points.

---

## Step 4: The Dashboard Knows What to Review

The Recommended Review widget on the dashboard is the parent-and-student-visible version of the same data. It lists any topic averaging under 70%, sorted worst-first, each tagged with its current percentage and coloured with its subject accent. Tap one and you go straight to that subject.

The nice detail is that it is honest about being empty. If there is nothing weak — because he has not taken quizzes yet, or because he is doing well — the widget simply does not render. No "no data" placeholder cluttering the dashboard. The app shows you something only when it has something useful to say.

screenshot of the student dashboard with the recommended review section appearing between the bottom row and the reward shop footer
Figure 3: Where it sits — Recommended Review appears between the bottom widgets and the reward shop footer, only when there are weak topics to flag.

---

## What We Learned Building It

Two engineering notes worth recording.

The first is a TypeScript discipline issue that has bitten us before in this project. One of the new queries called another query in the same file, and without an explicit return type annotation the compiler could not resolve the circular reference — which silently degraded the query's return type to `any`, which then cascaded into a dozen frontend `.map()` callbacks losing their types all at once. It looked like the whole app had broken; really it was one missing type annotation on a single function. Adding `Promise<TopicRow[]>` fixed all of it. The lesson, again: when many things break at once, find the single shared dependency.

The second is a design principle rather than a bug. We resisted the temptation to build a clever adaptive algorithm before we had the data to feed it. The rolling average is simple maths — last five attempts, mean percentage — but it is enough to drive genuinely useful behaviour today, and it gives us a clean place to plug in smarter logic (and later, AI) without rewriting the app. Start with the honest signal; get fancy later.

---

## Where We Are Now

- The app tracks a rolling per-topic average from real quiz history.
- Difficulty is recommended from that average and exposed for the next quiz.
- Anything under 70% shows up as a Recommended Review card on the dashboard.
- Scoring under 60% on a quiz opens a Get-Help drawer with explanations, hints, a lesson link and a retry.
- The same drawer is reachable any time from the "Need a Hint?" card.

The loop is now genuinely responsive: learn, get quizzed, and the app notices what you found hard and helps you fix it — instead of moving on and forgetting.

screenshot of the github commit history with the phase 6 adaptive learning commit
Figure 4: Phase 6 (Adaptive Learning) committed to the repo on top of the Friday Challenge.

---

## What Comes Next

Phase 7 is the big one: the **AI lesson builder**. The plan is to let me, as the parent, type a topic — "the water cycle", say — and have a Convex action call an AI model with my own API key to draft a full lesson: notes, a YouTube search query, difficulty, points, and a set of quiz questions with explanations. That draft lands in a review screen where I can edit anything before approving it transactionally into the student portal. Nothing the AI writes reaches my son until I say so.

After that, Phase 8 is the polish pass — Framer Motion animations, progress rings, a badges engine — and Phase 9 locks it all down with a full security audit and tests.

The takeaway from this stage: the most valuable features in an ed-tech app are not the flashy ones. They are the ones that notice when a child is struggling and quietly do something about it. A rolling average and a drawer that says "let's try again" is worth more than a dozen leaderboards.

We will be back with Part 6 once the AI builder is in. Thanks for reading.

---

*This is the fifth in a series of posts. We will keep updating as each phase ships.*

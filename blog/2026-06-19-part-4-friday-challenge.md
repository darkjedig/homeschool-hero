# Building a Gamified Homeschooling App with GLM 5.2 — Part 4: The Friday Challenge

June 19, 2026
9 min read

Ryan Gliozzo
Digital Marketing Expert
homeschool hero webapp build with glm 5.2
Project status: Weekly Friday Challenge system live — cron, boss-level student UI, double points, and results analysis. Phases 1–5 complete.

> Catch up: [Part 1](#) planned the product, [Part 2](#) built the foundation, data model, and student dashboard, [Part 3](#) shipped the parent console. This post adds the thing my son is most excited about: the weekly boss battle.

---

## Why a Friday Quiz

The whole point of HomeschoolHero is that learning should feel like a game, not a chore. So from the very first plan we wrote a rule into the system: every Friday there is a mandatory review quiz that pulls together what was learned that week and pays out double points. Think of it as the weekly boss battle.

It is not just for fun, though. Spaced review is one of the best-evidenced ways to actually retain what you learn. Forcing a recap at the end of each week means nothing gets quietly forgotten. And because it is worth double points, my son has a real reason to take it seriously — those points buy real rewards from the shop I manage.

This post covers Phase 5: the scheduling, the boss-level start screen, the quiz itself, the double-points maths, and the results screen that tells us where he is strong and where he needs to review.

screenshot of the friday challenge boss-level intro screen in purple
Figure 1: The Friday Challenge intro — a purple "boss level" start screen with the crossed-swords icon and the promise of double points.

---

## Step 1: A Quiz That Builds Itself

I did not want to hand-write a Friday quiz every week. That would be exactly the kind of admin work this app is supposed to remove. So the Friday Challenge generates itself.

Every Monday at one minute past midnight, a scheduled job runs on the Convex backend. It looks at the lessons my son completed in the previous week, gathers the quiz questions attached to those lessons, shuffles them in a way that is stable for the whole week (so the quiz does not change if he refreshes), picks ten, and saves a "Friday Challenge" document ready for Friday.

The clever-ish part is the fallback. On the very first week, when there is no history of completed lessons yet, the generator reaches into any published lessons and builds a challenge from those instead. That means the boss battle works the moment there is content — it does not sit empty waiting for weeks of history to build up.

screenshot of the convex cron schedule showing the monday weekly job
Figure 2: The weekly cron — `5 0 * * 1` — that regenerates the Friday Challenge every Monday morning, fully managed by Convex so it runs even when nobody is looking.

This is a good example of why Convex's scheduled jobs matter. The quiz generates whether or not my laptop is open, whether or not the app has a visitor. It is a true background job on a real backend, not something the browser has to remember to trigger.

---

## Step 2: The Boss-Level Start Screen

When my son opens the Friday Challenge, he does not just see question one. He gets a purple-tinted intro screen — the boss-level banner, with a wobbling crossed-swords icon and the words "2× points active". It is a small touch, but it reframes the quiz from "test" to "event". He hits "Start the Challenge" and the questions begin.

We used Framer Motion for the entrance animations — a spring reveal on the intro card, and a slide transition between each question so it feels like progressing through levels rather than scrolling a form. These are the kinds of details that, added up, make the difference between something a kid wants to use and something they tolerate.

screenshot of the quiz question screen with answer options and a purple progress bar
Figure 3: Inside the challenge — one question at a time, a purple progress bar, instant feedback, and an explanation after each answer.

---

## Step 3: One Question, Immediate Feedback, Then the Next

The quiz itself mirrors the lesson-quiz flow from earlier phases but themed purple for Friday. One question per screen, four answer options, and the moment he picks one the correct answer lights up green and a short explanation appears. Then "Next question", and a slide animation carries him into the next one.

Each step updates the progress bar, and because the questions are tagged with their subject, the results screen can later break down performance by subject — not just an overall score.

---

## Step 4: Double Points (and Getting the Maths Right)

The reward for the Friday Challenge is double points. That sounds simple, but it has to be correct, because the points feed directly into the reward shop where he spends them on real things.

When he finishes, a single server mutation works out how many he got right, calculates the points (twenty per correct answer, doubled on Fridays), writes a quiz attempt record, and writes a points-ledger entry tagged `friday_quiz`. Because both writes happen in the same Convex transaction, the points and the attempt can never get out of sync. He cannot be awarded points without the attempt being recorded, and he cannot record an attempt without the points landing.

This is the kind of boring detail that is easy to get wrong if you let the frontend do the maths. We do not. The browser sends only his answers; the server decides the score, the points, and writes the ledger. There is no way to cheat the points from the client.

screenshot of the results screen showing the score percentage and double points earned
Figure 4: Results — the percentage, the number correct, and the doubled points added to his balance.

---

## Step 5: Knowing Where to Review

The part I care about most, as the parent, is the results screen. It does not just say "7 out of 10". It breaks the score down by subject, so we can see at a glance whether he aced the Maths questions but struggled with the History ones.

Anything under 70% in a subject triggers a "Recommended review" card that names the weak areas and suggests revisiting those lessons before next week. This is the bridge into the next phase — adaptive learning — where the app will start adjusting difficulty automatically and sliding open a help drawer the moment he scores below 60%. For now, it gives us a concrete, human-readable signal to act on together.

screenshot of the results screen showing per-subject bars and a recommended review card
Figure 5: Per-subject breakdown with a recommended-review prompt for anything under 70%.

---

## What We Learned Building It

A couple of notes on the engineering, because that is the honest part of these posts.

The first was a schema decision that paid off. Early on we made the quiz attempt record reference a single lesson quiz. But the Friday Challenge is not one lesson's quiz — it pulls questions from many. Rather than fake a single "lesson" for it, we made that link optional and added a separate reference to the weekly Friday doc. It is a small change, but it keeps the data model honest: a Friday attempt is clearly a Friday attempt, not a lesson attempt wearing a costume.

The second was the deterministic shuffle. A weekly quiz must not reshuffle every time the page loads — that would be disorienting and could change the questions mid-attempt. So the generator seeds its shuffle with the week's start timestamp, meaning the order is stable for the whole week. Tiny detail, important for trust.

And, as in earlier phases, the security boundary held: the Friday submission is a server mutation, the points are server-calculated, and nothing about scoring is trusted from the browser.

---

## Where We Are Now

- A weekly boss-battle quiz generates itself every Monday and is ready by Friday.
- It pulls from the week's lessons, falls back to any published content, and is always ten questions.
- The student gets a themed, animated experience with immediate feedback.
- Points are doubled, server-calculated, and recorded transactionally.
- The results screen shows strong and weak subjects and recommends what to review.

The full loop is now genuinely game-like: learn through the week, battle on Friday, earn double points, spend them in the shop, and get told exactly what to brush up on. That is the MVP I set out to build.

screenshot of the github history showing the phase 5 friday challenge commit
Figure 6: The repo on GitHub — Phase 5 (Friday Challenge) committed on top of the parent console.

---

## What Comes Next

Phase 6 is **adaptive learning**. The app already knows per-subject performance from the Friday results; the next step is to use it. Quizzes will get harder when he is acing a topic, and the moment he drops below 60% a "Get Help" drawer will slide open with a simpler explanation, step-by-step hints, and easier practice questions — styled as the "Need a Hint?" card already on the dashboard.

After that, Phase 7 is the one I have been waiting for: the **AI lesson builder**, where I give the agent a topic and it drafts a full lesson — notes, a video suggestion, and quiz questions — for me to review and approve before it reaches my son.

The takeaway from this stage: the features that feel magical to a kid (a boss battle that appears every Friday, double points, a results screen that knows his weak spots) are, on the backend, a disciplined mix of scheduled jobs, transactions, and honest data modelling. The magic is just engineering done carefully.

We will be back with Part 5 once adaptive learning is in. Thanks for reading.

---

*This is the fourth in a series of posts. We will keep updating as each phase ships.*

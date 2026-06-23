# Building a Gamified Homeschooling App with GLM 5.2 — Part 7: Polish, Animation & Badges

June 19, 2026
8 min read

Ryan Gliozzo
Digital Marketing Expert
homeschool hero webapp build with glm 5.2
Project status: Staggered animations, confetti, toast notifications, a live badges engine, interactive learning objects and a real in-browser Code Lab shipped. Phases 1–8 complete; one polish phase left.

> Catch up: [Part 1](#) planned it, [Part 2](#) built the foundation + student dashboard, [Part 3](#) shipped the parent console, [Part 4](#) added the Friday boss battle, [Part 5](#) made it adaptive, [Part 6](#) added the AI lesson builder. This post is the polish pass — making it feel like a game.

---

## Why Polish Is a Phase, Not an Afterthought

For seven phases we built features. The app worked: lessons played, quizzes scored, points accrued, the Friday Challenge generated itself. But "works" and "feels good" are different things. A learning app for an eleven-year-old has to feel alive — cards should ease in, success should celebrate itself, and effort should be recognised visibly, not just recorded in a database.

Phase 8 is the phase where we stopped adding features and started adding feeling. Motion, celebration, and a real badges engine that watches what my son does and rewards him for it.

screenshot of the student dashboard with cards mid-reveal in a staggered animation
Figure 1: The dashboard now reveals in a staggered cascade — each card fades and slides up 50ms after the last, per the motion spec in the design skill.

---

## Step 1: Motion That Matches the Design Spec

The design skill has always had a motion section: staggered card entrance at 0.05s, fade plus a 12-pixel slide up, subtle 1.02 scale on hover. We built a small reusable motion kit — `StaggerGroup` and `StaggerItem` — and wrapped the dashboard sections in it.

The result is that the dashboard no longer just appears. It assembles itself, row by row, in a quick cascade that feels deliberate rather than instant. Hover a mission card or a subject tile and it lifts and scales very slightly — the kind of micro-feedback that makes an interface feel responsive without being flashy.

This is also where respecting the user matters: the confetti and motion both check `prefers-reduced-motion`, so a child (or parent) who finds animation distracting gets a calm, static experience automatically.

screenshot of a mission card lifting with a glow on hover
Figure 2: Mission cards lift and scale on hover, with their subject-coloured glow following along.

---

## Step 2: Celebrating Success (Confetti)

A quiz result of 60% or higher now fires a confetti burst — a central pop followed by two side cannons, in the HomeschoolHero accent colours. It is a tiny thing, and it is honestly the bit my son noticed first. "It did the thing!" is the exact reaction you want from a kid finishing a review quiz.

The confetti is wired into both the regular lesson quiz and the Friday Challenge, so every win feels like an event. And because it runs on the client and respects reduced-motion, it costs nothing on the server and stays optional for anyone who wants it off.

screenshot of confetti bursting over the quiz results screen
Figure 3: Confetti on a quiz pass — a small celebration that makes completing a quiz feel worth it.

---

## Step 3: Toasts for Points and Badges

Underneath the confetti, a quiet notification system now confirms what just happened. Finish a quiz and a dark toast slides in: "+120 points!" Finish a lesson that crosses a milestone and another toast appears: "🏆 Badge unlocked: Quiz Whiz". These are non-blocking — they fade on their own — but they close the loop between action and reward in a way a silent number change cannot.

screenshot of a toast notification showing points earned and a badge unlocked
Figure 4: Toasts confirm points earned and badges unlocked, without interrupting the flow.

---

## Step 4: A Real Badges Engine

This is the engineering heart of Phase 8. We seeded six badges — First Steps (first lesson completed), Quiz Whiz (five quizzes), Perfect Score (100% on any quiz), Science Star (three Science lessons), High Scorer (500 points), and Friday Challenger (first Friday quiz) — and built a server-side engine that evaluates them.

Every time something meaningful happens — a quiz is submitted, a Friday Challenge is finished, a lesson is marked complete — the relevant mutation calls a `checkAndAward` function on the backend. That function reads the student's attempt history, completed lessons and points, checks each badge's criteria, and awards any that are newly earned. It also writes the bonus points for each new badge in the same transaction, so points and badges never drift out of sync.

Crucially, the function returns the list of newly-awarded badges, which flows back to the client so it can fire the toast. The reward is immediate and visible — not "check your profile later to see if anything happened".

screenshot of the dashboard achievements row showing earned badges with their icons
Figure 5: The Recent Achievements row, now wired to live data — earned badges light up, unearned slots stay locked.

The dashboard's "Recent Achievements" row used to be four hardcoded placeholders. It now reads the real earned badges and renders them, with locked grey slots for the ones still to chase. When the list is empty, the child sees what is possible rather than a blank space.

---

## Step 5: Interactive Learning Objects (and a Real Code Lab)

This is the part that turned HomeschoolHero from something you read into something you do. Up through Phase 7 a lesson was text, a video, and a five-question quiz — fine, but passive. Phase 8 added a whole layer of interactive blocks that the student actually manipulates, and at the top of that pyramid sat the feature I am proudest of: a real, runnable code sandbox.

First, the four interactive block types every lesson can now include:

- **Quick-check MCQ** (the anti-cheat warm-up): a question with four clickable options, immediate green/red feedback, and an explanation. No "tap to reveal the answer" — the child has to choose.
- **Flashcards**: a 3D card flip between question and answer, with prev/next navigation. Genuinely useful for vocabulary and definitions, and we rebuilt the flip as a proper CSS 3D transform after the first version's toggle quietly did nothing.
- **Drag-to-order**: a seeded-shuffle list the student reorders by dragging a grip handle, then checks. Perfect for sequences — steps of the water cycle, events on a timeline, the order of operations.
- **Clickable timeline**: events sorted by date, each expanding to reveal its detail. A natural fit for History.

Each lesson's `content` is now a typed array of these blocks, rendered in order by a single `LessonBlocks` component. The same array shape is what the AI builder now generates, so a parent-approved AI lesson lands with its own interactive already wired in — no hand-authoring required.

screenshot of a lesson with a flashcard mid-flip and a drag-to-order block beneath it
Figure 6: Interactive blocks in a lesson — flashcards that flip in 3D, drag-to-order sequences, and clickable timelines, all driven by one typed content array.

### The Code Lab

Then the headline. For the programming subjects — Game Development and AI & Computer Science — we went past multiple-choice and built an actual **Code Lab**: an in-browser JavaScript sandbox where my son writes real code, hits **Run**, and watches it execute.

The first challenge is gentle: *"Your First JavaScript"*. It introduces `let` for variables and `console.log(...)` for printing, then drops him into an editor pre-filled with:

```
let name = "Hudson";
let level = 12;
console.log("Hello, " + name + "!");
console.log("You are level " + level);
```

He presses Run and a console panel lights up with the output. The prompt asks him to make it print `Next level is 13`. He changes a number, runs it again, and the console updates instantly. That loop — type, run, read, tweak — is the actual feedback loop of real programming, and it is running entirely in the browser.

screenshot of the code lab with javascript on the left and the console output on the right after pressing run
Figure 7: The Code Lab — real JavaScript on the left, live console output on the right. Edit, Run, Reset. No setup, no install, just code that does something.

Where it gets genuinely exciting is the **game challenges**. "Bringing Sprites to Life" hands him a canvas context and a starter loop, and pressing Run animates a pink square bouncing around the screen using velocity, edge collision, and `requestAnimationFrame`:

```
let x = 20, y = 60, vx = 2, vy = 1.5;
function loop() {
  ctx.clearRect(0, 0, 320, 240);
  x = x + vx; y = y + vy;
  if (x < 0 || x > 290) vx = -vx;
  if (y < 0 || y > 210) vy = -vy;
  ctx.fillStyle = "#ec4899";
  ctx.fillRect(x, y, 30, 30);
  requestAnimationFrame(loop);
}
loop();
```

He is not answering a question about a game loop. He is watching one run, then changing `vx` and `vy` to make the sprite move faster and watching the result. That is the difference between learning about programming and learning to program — and it lives inside the same lesson structure, with the same warm-up and five-question quiz, as a History lesson about the Treaty of Versailles.

The engineering detail worth flagging: the sandbox runs entirely client-side in a fenced evaluator, so untrusted student code can never touch the Convex backend or anyone else's session. The lesson defines a challenge prompt, starter code, and a target the student aims for; the editor just executes what they type and shows the output. Simple, safe, and immediate.

---

## What We Learned Building It

Two notes from this phase.

The first was a familiar TypeScript gremlin. Adding the badge-check call inside the quiz and Friday submission mutations created a circular type inference — the mutation's return type referenced the badge function, which in turn made the compiler give up and mark everything `any`, which cascaded into a dozen broken-looking frontend callbacks. The fix, as ever, was one explicit return-type annotation on each submission handler. We have hit this pattern so many times now that it barely slowed us down; it is the price of Convex's nice end-to-end typing and it is always a one-line fix.

The second was a design discipline win. It was tempting in a "polish" phase to add a dozen animations. We deliberately did not. The motion is consistent (one easing language, one stagger value, one hover behaviour) because consistency reads as premium and variety reads as random. The design skill's motion section existed for exactly this reason — it gave us the spec to follow rather than inventing vibes on the fly.

---

## Where We Are Now

- The dashboard and key screens animate in with a staggered cascade.
- Cards lift and scale subtly on hover, with their subject-coloured glows.
- Quiz and Friday Challenge wins fire confetti (reduced-motion aware).
- Points and badge unlocks are confirmed with toast notifications.
- A server-side badges engine watches real activity and awards six badges automatically, with bonus points.
- The achievements row is wired to live earned badges.
- Lessons now contain interactive blocks — MCQ quick-checks, 3D flashcards, drag-to-order sequences and clickable timelines — driven by a typed content array that the AI builder can generate too.
- A real in-browser Code Lab lets the student write and run JavaScript, from `console.log` warm-ups to animated canvas game challenges with sprites, velocity and bouncing edges.

The app now feels like the premium, gamified learning space the original mockup promised. It works, and it feels good to use — and for the first time, parts of it are genuinely hands-on.

screenshot of the github history with the phase 8 polish commit
Figure 8: Phase 8 (Polish & Gamification) committed to the repo.

---

## What Comes Next

Phase 9 is the final phase: **security, testing, and final polish**. A full RBAC audit on every Convex function and every route (so nothing sensitive can be reached without the right role), Playwright smoke tests covering the core flows (sign in, watch a lesson, complete a quiz, redeem a reward, export from the parent side), Vitest unit tests for the points maths and the Friday quiz generation, mobile polish, error boundaries, and the final README.

The takeaway from this stage: the difference between a functional app and a delightful one is almost entirely in the last 10% — the motion, the celebration, the recognition. None of it is hard on its own; all of it is easy to skip. Spending a whole phase on it was the right call.

We will be back with the final post once Phase 9 ships and the project is wrapped. Thanks for reading.

---

*This is the seventh in a series of posts. We will keep updating as each phase ships.*

# Building a Gamified Homeschooling App with GLM 5.2 — Part 6: The AI Lesson Builder

June 19, 2026
10 min read

Ryan Gliozzo
Digital Marketing Expert
homeschool hero webapp build with glm 5.2
Project status: AI course & lesson builder live with OpenRouter (BYOK). Parent reviews and approves every draft before it reaches the student. Phases 1–7 complete.

> Catch up: [Part 1](#) planned it, [Part 2](#) built the foundation, [Part 3](#) shipped the parent console, [Part 4](#) added the Friday boss battle, [Part 5](#) made it adaptive. This post is the one I have been waiting for: asking an AI to draft whole lessons for my son.

---

## The Promise (and the Risk)

From the very first plan, the AI lesson builder was the headline feature. The idea: as a parent, I type something like *"a beginner Game Development course covering game loops, sprites and collision"*, and the app drafts an entire course — a subject, a set of topics, lessons with notes and quiz questions — for me to review. Not to publish blindly. To review.

That last part is the whole point. This is a learning app for an eleven-year-old. Nothing the AI writes should reach my son until I have read it, edited it, and approved it. So Phase 7 was as much about control and trust as it was about generation. The AI proposes; the parent disposes.

screenshot of the ai builder page with the prompt box and full course single lesson toggle
Figure 1: The AI Lesson Builder — a prompt box, a mode toggle (full course vs single lesson), and a Generate button.

---

## Step 1: Bring Your Own Key (and Keep It Safe)

We did not want to bake a proprietary AI account into the app. Instead the builder runs on the parent's own OpenRouter API key — bring your own key, pick any model from their catalogue (we default to a fast, cheap one), and only the parent pays for what they generate.

The security model matters here, and I want to be specific about it because it is a kids' app. The key is entered once on the Settings page and stored in the Convex database. A public query returns only a boolean — `keyIsSet: true` — never the key itself. The raw key is readable only inside a Convex internal query that itself requires the parent role, and that query is only ever called from the server-side generation action. There is no code path where the browser, or the student, can ever see the key. It is, by construction, server-only.

A "Test connection" button does a tiny throwaway call so you can confirm the key and model work before committing to a full generation.

screenshot of the settings page with the api key field model dropdown and test connection button
Figure 2: Settings — the key field is write-only. Once stored, the app shows "a key is currently stored" rather than the key itself.

---

## Step 2: Asking the AI for Structured JSON

The hard part of AI generation is not calling the model; it is getting a predictable shape back. Free-text answers are useless to an app — I need a subject object, a topics array, lessons with quiz questions, all in the exact fields my database expects.

So the generation action sends a strict system prompt that describes the exact JSON schema, and asks OpenRouter for a `json_object` response. The model is told: return only JSON, no commentary, with a subject (name, description, icon, colour), three to five topics, one or two lessons per topic, and exactly four options per quiz question with the correct answer matching one of them. Age-appropriate, encouraging tone. Aimed at an eleven-to-twelve-year-old.

Then we parse defensively. Even with `json_object` enforced, we strip any stray markdown fences the model might add and parse the result. If anything throws — bad key, rate limit, malformed JSON, model error — the draft is marked `failed` with a human-readable message, so the parent can fix it and try again.

screenshot of a generated course draft showing subject topics and lessons ready for review
Figure 3: A generated course draft in review — the subject, topics, and lessons with their quiz-question counts, all editable before publishing.

---

## Step 3: The Draft Lifecycle (generate → review → approve)

This is where the architecture earns its keep. When I click Generate, three things happen in the right order:

1. A draft row is created in the database with status `generating`. The page immediately subscribes to that row via Convex's realtime queries, so it updates live without me refreshing.
2. A Convex action fires off to OpenRouter. Because Convex actions can run for up to ten minutes, there is no timeout risk even on a big, slow generation.
3. When the model responds, the action writes the parsed content onto the draft row and flips it to `pending`. The page I am looking at updates instantly — "Generating…" becomes a full review screen.

I then see the subject details, the topics, and every lesson with its notes and a quiz-question count, all editable. I can fix a title, swap the YouTube suggestion for a real video, tidy the notes. When I am happy, I click Approve, and a single transactional mutation publishes the whole thing — subject, topics, lessons, quizzes, and every quiz question — atomically, and marks the draft `approved`.

The atomicity is the quiet hero. Either the entire course lands in the student portal, or none of it does. There is no half-published course with orphaned lessons pointing at missing topics.

screenshot of the approve button on a reviewed draft with the confirm state
Figure 4: The approve step — one click publishes the whole course transactionally and marks the draft approved.

---

## Step 4: What the Student Sees (and Doesn't)

Crucially, the student side did not need to change at all. Every student-facing query already filters for `status: published` lessons. AI drafts live in their own tables and only become real, published lessons through the approve step. So at no point can a half-baked AI draft leak into my son's dashboard. The gate is the approval, enforced in the data model, not in a checkbox.

This is the design principle I am happiest with in the whole project: the safety does not depend on the parent remembering to be careful. It depends on the student queries simply not seeing unpublished rows. The default is invisible.

---

## Step 5: A Single Lesson, Too

The full-course flow is the showpiece, but the day-to-day reality of homeschooling is smaller: one lesson at a time. So the same builder has a "Single lesson" mode. I type a prompt — *"a lesson on the water cycle for Science"* — and it drafts one lesson with notes, a video suggestion, and a quiz. I choose which subject and topic it belongs to, edit anything, and approve. It slots straight into the existing subject structure.

Both modes share the same draft lifecycle, the same review UI pattern, and the same transactional publish. One feature, two scales.

screenshot of the single lesson review with subject and topic pickers and quiz questions
Figure 5: Single-lesson mode — pick a subject and topic, review the notes and quiz, approve into an existing course.

---

## What We Learned Building It

Two honest engineering notes.

The first was a schema evolution we had to do mid-phase. The original draft tables assumed content would always be present. But the whole point of the lifecycle is a `generating` state where the draft exists with no content yet. So we relaxed those fields to optional and added `generating`/`failed` statuses plus an error-message field. Convex handled the change without data loss — relaxing required fields to optional is a safe migration. It was a good reminder to design tables around their full lifecycle, not just their happy path.

The second was the recurring TypeScript cascade. One action handler had an inferred return type that referenced itself indirectly, which collapsed its type to `any`, which then silently degraded several downstream query types, which made a swarm of frontend callbacks lose their types. It looked like a dozen broken components. Adding a single explicit return type annotation fixed all of it. We have hit this pattern in nearly every phase now; the lesson finally sticks: when many things break at once, find the one shared dependency, and annotate it.

---

## Where We Are Now

- The parent can add their own OpenRouter key and model, stored server-side and never exposed.
- A prompt produces a full course or a single lesson draft, live, in structured JSON.
- Every draft is editable in a review screen before it goes anywhere.
- Approval publishes the content transactionally into the student portal.
- Nothing the AI writes is ever visible to the student without explicit parental approval.

This is the feature that turns HomeschoolHero from a fixed curriculum into an open-ended one. I can teach the water cycle this afternoon if I want to, with a video and a quiz, drafted in a minute and reviewed by me before my son sees it.

screenshot of the github history with the phase 7 ai builder commit
Figure 6: Phase 7 (AI Lesson Builder) committed to the repo.

---

## What Comes Next

Phase 8 is the **polish pass**: Framer Motion animations throughout (staggered card reveals, confetti on quiz wins, level-up and badge-unlock toasts), interactive learning objects like clickable timelines for History, and a proper badges engine that awards achievements automatically as my son progresses.

Phase 9 then locks everything down: a full security audit on every Convex function and route, Playwright smoke tests, mobile polish, error boundaries, and final docs.

The takeaway from this stage: the interesting part of "AI features" is not the model. It is the control framework around the model — the lifecycle, the review gate, the transactional publish, the server-only secrets. Get that right and the AI becomes a genuinely useful collaborator. Get it wrong and it is a liability. We aimed for the first.

We will be back with Part 7 once the polish and badges land. Thanks for reading.

---

*This is the sixth in a series of posts. We will keep updating as each phase ships.*

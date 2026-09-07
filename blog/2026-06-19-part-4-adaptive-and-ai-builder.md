# Building a Gamified Homeschooling App with GLM 5.2 — Part 4: Adaptive Learning and the AI Lesson Builder

June 19, 2026
9 min read

Ryan Gliozzo
Digital Marketing Expert
homeschool hero webapp build with glm 5.2
Project status: Adaptive difficulty, the Get Help drawer, recommended review, and an AI course and lesson builder (BYOK) all live. Phases 1 to 7 complete.

> Catch up: Part 1 planned the product, Part 2 built the foundation and the student dashboard, Part 3 shipped the parent console and the Friday boss battle. This post is about making the app respond to how my son is actually doing, and then adding the feature I have been waiting for — asking an AI to draft whole lessons for him.

---

## Why This Stage Mattered

In Part 1 we wrote a simple rule into the plan. The app should not treat every quiz result the same. If my son is doing well in a subject, future quizzes should gradually become more challenging. If he scores below 60 percent, the app should not just mark him down and move on. A Get Help drawer should slide open with a simpler explanation, step-by-step hints, and a way back to the lesson.

Phases 6 and 7 turn that rule into reality. Phase 6 makes the app adaptive — it watches how he does in each topic, surfaces the weak spots, and refuses to let a bad score sit there. Phase 7 is the AI lesson builder, where I type a topic and the app drafts an entire lesson for me to review and approve before my son ever sees it.

Both phases share the same principle. The app should notice what a child needs and act on it, but nothing should ever be published without my approval as the parent.

---

## Step 1: A Rolling Picture of Each Topic

The first job was knowing, per topic, how he is trending. Every quiz attempt already records a percentage and is linked, through its quiz, to a topic. So we built a query that walks the attempt history for the current student, groups it by topic, and keeps the last five attempts per topic. We used a rolling average rather than an all-time one, so recent progress counts more than ancient results.

That single query powers two things. The Recommended Review list, which flags any topic averaging under 70 percent, and the next-difficulty decision. It deliberately ignores Friday Challenge attempts for the topic-level maths, because those pull questions from across the week and would muddy the per-topic signal.

---

## Step 2: Difficulty That Moves With Him

From that rolling average we derive a recommended difficulty tier for each topic.

| Rolling average | Recommended tier |
| --- | --- |
| 85 percent and above | Advanced |
| 65 to 84 percent | Intermediate |
| Below 65 percent | Beginner |
| No data yet | Beginner, start gentle |

This is exposed as a simple query, so the quiz and lesson flows can ask "how hard should the next one be?" and get a one-word answer. It is the foundation for the smart version coming later. Once AI-generated lessons exist, the difficulty tier can shape what gets generated, not just what is recommended. For now it is a clean, honest signal running on real data.

---

## Step 3: The Get Help Drawer

This is the part I wanted most. The rule is simple. If my son scores under 60 percent on a quiz, the results screen does not just say 3 out of 10 and leave him there. It shows a Get Help button. Tap it and a drawer slides up from the bottom with:

| Section | What it gives him |
| --- | --- |
| **Missed-question explanations** | A clear re-explanation of every question he got wrong, using the explanation written into that question. |
| **Step-by-step hints** | Re-read the question, eliminate the obvious wrong answers, break the problem into steps. Enough to nudge him toward the answer without handing it over. |
| **Back to the lesson** | A button to jump straight back to the relevant lesson and rewatch the bit he missed. |
| **Try again** | A retry button so he can take the quiz again immediately. |

The tone is deliberate. The copy says "let's get this sorted" and "you've got this", not "you failed". The colour is a gentle orange prompt, not a red error. The point is to make support feel immediate and calm rather than stressful, exactly the feeling we described in the original brief.

The same drawer is wired into the Need a Hint card that already lives on the dashboard, so he can open it any time he is stuck, not only after a low score. One component, two entry points.

---

## Step 4: The Dashboard Knows What to Review

The Recommended Review widget on the dashboard is the parent-and-student-visible version of the same data. It lists any topic averaging under 70 percent, sorted worst-first, each tagged with its current percentage and coloured with its subject accent. Tap one and you go straight to that subject.

The detail I like is that it is honest about being empty. If there is nothing weak — because he has not taken quizzes yet, or because he is doing well — the widget simply does not render. No "no data" placeholder cluttering the dashboard. The app shows you something only when it has something useful to say.

---

## Step 5: The AI Lesson Builder

From the very first plan, the AI lesson builder was the headline feature. The idea is that as a parent I type something like "a beginner Game Development course covering game loops, sprites and collision", and the app drafts an entire course — a subject, a set of topics, lessons with notes and quiz questions — for me to review. Not to publish blindly. To review.

That last part is the whole point. This is a learning app for an eleven-year-old. Nothing the AI writes should reach my son until I have read it, edited it, and approved it.

### Bring your own key

We did not want to bake a proprietary AI account into the app. Instead the builder runs on the parent's own OpenRouter API key. Bring your own key, pick any model from their catalogue (we default to a fast, cheap one), and only the parent pays for what they generate.

The security model matters here, and I want to be specific because it is a kids' app.

| Concern | How we handle it |
| --- | --- |
| **Where the key lives** | Entered once on the Settings page and stored in the Convex database. |
| **What the browser sees** | A public query returns only a boolean, `keyIsSet: true`. Never the key itself. |
| **Who can read the raw key** | Only a Convex internal query that itself requires the parent role, and that query is only ever called from the server-side generation action. |
| **Student exposure** | None. There is no code path where the browser, or the student, can ever see the key. It is server-only by construction. |
| **Validation** | A Test Connection button does a tiny throwaway call so you can confirm the key and model work before committing to a full generation. |

### Asking the AI for structured JSON

The hard part of AI generation is not calling the model. It is getting a predictable shape back. Free-text answers are useless to an app. I need a subject object, a topics array, lessons with quiz questions, all in the exact fields my database expects.

So the generation action sends a strict system prompt that describes the exact JSON schema, and asks OpenRouter for a `json_object` response. The model is told to return only JSON, no commentary, with a subject, three to five topics, one or two lessons per topic, and exactly four options per quiz question. Age-appropriate, encouraging tone, aimed at an eleven-to-twelve-year-old.

Then we parse defensively. Even with `json_object` enforced, we strip any stray markdown fences the model might add before parsing. If anything throws — a bad key, a rate limit, malformed JSON, a model error — the draft is marked `failed` with a human-readable message, so I can fix it and try again.

### The draft lifecycle

This is where the architecture earns its keep. When I click Generate, three things happen in the right order.

| State | What happens |
| --- | --- |
| **`generating`** | A draft row is created. The page immediately subscribes to that row through Convex's realtime queries, so it updates live without me refreshing. |
| **the action runs** | A Convex action fires off to OpenRouter. Because actions can run for up to ten minutes, there is no timeout risk even on a big, slow generation. |
| **`pending`** | When the model responds, the action writes the parsed content onto the draft row and flips it to `pending`. The page I am looking at updates instantly — "Generating…" becomes a full review screen. |
| **`approved`** | When I am happy, I click Approve, and a single transactional mutation publishes the whole thing — subject, topics, lessons, quizzes, and every question — atomically, and marks the draft approved. |
| **`failed`** | The error path. A human-readable message is shown, and I fix the problem and retry. |

The atomicity matters. Either the entire course lands in the student portal, or none of it does. There is no half-published course with orphaned lessons pointing at missing topics.

### What the student sees (and does not)

Crucially, the student side did not need to change at all. Every student-facing query already filters for published lessons. AI drafts live in their own tables and only become real, published lessons through the Approve step. So at no point can a half-baked AI draft leak into my son's dashboard.

This is the design principle I am happiest with in the whole project. The safety does not depend on me remembering to be careful. It depends on the student queries simply not seeing unpublished rows.

### A single lesson, too

The full-course flow is the showpiece, but the day-to-day reality of homeschooling is smaller. One lesson at a time. So the same builder has a Single Lesson mode. I type a prompt — "a lesson on the water cycle for Science" — and it drafts one lesson with notes, a video suggestion, and a quiz. I choose which subject and topic it belongs to, edit anything, and approve. It slots straight into the existing subject structure. Both modes share the same draft lifecycle, the same review screen, and the same transactional publish.

---

## What We Learned Building It

Two honest engineering notes.

The first was a schema evolution we had to do mid-phase. The original draft tables assumed content would always be present. But the whole point of the lifecycle is a `generating` state where the draft exists with no content yet. So we relaxed those fields to optional and added `generating` and `failed` statuses plus an error-message field. Convex handled the change without data loss, because relaxing required fields to optional is a safe migration. It was a good reminder to design tables around their full lifecycle, not just their happy path.

The second was the recurring TypeScript cascade. One query called another query in the same file, and without an explicit return-type annotation the compiler could not resolve the circular reference. That silently degraded the return type to `any`, which then cascaded into a dozen frontend `.map()` callbacks losing their types all at once. It looked like the whole app had broken. Really it was one missing type annotation on a single function. Adding `Promise<TopicRow[]>` fixed all of it. We have hit this pattern in nearly every phase now. The lesson finally sticks. When many things break at once, find the one shared dependency and annotate it.

---

## Where We Are Now

- The app tracks a rolling per-topic average from real quiz history.
- Difficulty is recommended from that average and exposed for the next quiz.
- Anything under 70 percent shows up as a Recommended Review card on the dashboard.
- Scoring under 60 percent opens a Get Help drawer with explanations, hints, a lesson link, and a retry.
- The parent can add their own OpenRouter key and model, stored server-side and never exposed.
- A prompt produces a full course or a single lesson draft, live, in structured JSON, and editable in a review screen.
- Approval publishes the content transactionally into the student portal. Nothing the AI writes is ever visible to the student without explicit parental approval.

This is the feature that turns HomeschoolHero from a fixed curriculum into an open-ended one. I can teach the water cycle this afternoon if I want to, with a video and a quiz, drafted in a minute and reviewed by me before my son sees it.

---

## What Comes Next

The next post is the polish pass. Framer Motion animations throughout, staggered card reveals, confetti on quiz wins, level-up and badge-unlock toasts, interactive learning objects like clickable timelines for History, and a proper badges engine that awards achievements automatically as my son progresses. After that comes the final phase — a full security audit on every Convex function and route, Playwright smoke tests, mobile polish, and the final docs.

The takeaway from this stage is simple. The most valuable features in an ed-tech app are not the flashy ones. They are the ones that notice when a child is struggling and quietly do something about it. And the interesting part of AI features is not the model itself. It is the control framework around the model — the lifecycle, the review gate, the transactional publish, the server-only secrets. Get that right and the AI becomes a genuinely useful collaborator.

---

*This is the fourth in a series of five posts. We will keep updating as each phase ships.*

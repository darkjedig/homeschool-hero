# HomeschoolHero — Full Curriculum Plan

Reference + progress log for the multi-lesson curriculum build. Each **topic** is a
multi-lesson unit (4–8 lessons). Each **lesson** is a full classroom lesson:
heading + teaching text + worked example + key points + 1 interactive
(MCQ / flashcards / ordering / timeline) + 5-question quiz.

Progress key: `[x]` authored + seeded · `[ ]` pending

Interactive rotation legend: **MCQ** = reveal-style quick check · **FC** = flashcards ·
**ORD** = drag ordering · **TL** = timeline · **CODE** = runnable code sandbox ·
**ARENA** = generative maths game · **MATCH** = match-up game · **CLOZE** = fill-in-the-blank ·
**SIM** = science simulation.

---

## Interactive Activity System (live)

A high-spec interactive layer woven into lessons + dedicated **activity lessons**
(`kind: "activity"`, shown with an "Activity" badge / gamepad icon).

**Schema** — `convex/schema.ts` `contentBlock.variant` now also supports
`codeSandbox · mathArena · match · fillBlank · simulation`; `lessons.kind`
(`"lesson" | "activity"`, optional) flags activity lessons.

**Authoring builders** — `convex/curriculum/types.ts`:
- `code({ language, starter, instructions, challenge?, expected? })` → runnable JS/HTML lab.
- `arena({ title, mode, min, max, count, seconds? })` → generative maths game (`mode`: add/sub/mul/div/mixed/fractions/percent).
- `match(...[term, def])` → two-column match-up.
- `cloze(...[sentenceWith___, answer])` → fill-in-the-blank with word bank.
- `sim(simId, title?)` → animated simulation (`circuit` | `particles` | `heart` | `lungs` | `skeleton` | `digestive` | `brain`).

**Components** — `components/student/interactive/`: `code-sandbox.tsx`
(sandboxed `<iframe sandbox="allow-scripts">`, console via `postMessage`, canvas
for game-dev), `math-arena.tsx`, `match-game.tsx`, `fill-blank.tsx`,
`simulation.tsx` (+ `body-sims.tsx` for human-body animations). Registered in
`components/student/lesson-blocks.tsx`.

---

## Two kinds of interactive (when to use which)

Not every lesson needs the same type. We use **two families** of interactives,
chosen by what the topic teaches best:

### 1. Learning simulations (movement, cause-and-effect)
**Goal:** Capture attention and build intuition — the student *sees* a process
happen and manipulates it (sliders, buttons, animated paths).

**Best for:** Science processes, geography, history timelines in motion, coding
canvas output, anything where **watching something change** teaches the concept.

| Sim id | Example lesson | What the student does |
|--------|----------------|------------------------|
| `particles` | Heat & States of Matter | Heat slider → particles speed up / spread |
| `circuit` | Build a Circuit | Add batteries, flip switch → bulb brightness |
| `heart` | The Heart & Blood | BPM slider → pulsing heart + blood loop |
| `lungs` | The Lungs & Breathing | Watch lungs expand/contract, O₂ in / CO₂ out |
| `skeleton` | Bones & Muscles | Bend elbow slider → biceps/triceps pairs animate |
| `digestive` | The Digestive System | Step food through mouth → stomach → intestines |
| `brain` | The Brain & Nerves | "Touch hot stove" → nerve signal races to brain |

**Authoring:** `sim("heart", "How the Heart Pumps Blood")` in the lesson's
`blocks` array, placed **after key points** and **before** any quiz-style check.
Add new sim ids in `body-sims.tsx` / `simulation.tsx` and extend `sim()` in
`types.ts`. Patch existing DB lessons with
`npx convex run enrichLessons:attachBodySimulations` (or subject-specific patch).

**Future sim candidates:** forces/balance, light rays, sound waves, plant growth,
water cycle, tectonic plates, day/night Earth rotation, historical battle map.

### 2. Practice games & quick checks (score, recall, repetition)
**Goal:** Reinforce facts and skills through repetition, scoring, and feedback.

**Best for:** Maths fluency, vocabulary, grammar rules, ordering steps, matching
terms, code challenges with expected output.

| Variant | Example use |
|---------|-------------|
| `mathArena` | Times tables, fractions, mental maths sprints |
| `codeSandbox` | JavaScript / canvas game-dev labs |
| `match` | Vocabulary pairs, tool ↔ job, safety rules |
| `fillBlank` | Punctuation, cloze sentences |
| `reveal` | Single MCQ quick-check after reading |
| `flashcards` | Term ↔ definition revision |
| `ordering` | Sequence steps (digestion order, historical events) |
| `timeline` | Expandable dated events |

**Rule of thumb:** If the lesson is about a **process you can animate**, lead
with a **simulation** and keep a lighter game/check for recall. If the lesson is
about **rules, facts, or computation**, use **arena / match / MCQ / flashcards**.
Dedicated **activity lessons** (`kind: "activity"`) are usually full simulation
or full game experiences (e.g. "Activity: Heat & States of Matter").

---

**Security** — code sandbox runs in an iframe with `allow-scripts` only (no
`allow-same-origin`), fully isolated from the app + Convex. All content is static
authored data; no secrets exposed.

**Result logging (parent visibility)** — every interactive reports its outcome so
parents can see exactly what a student did:
- Table `interactiveResults` + `convex/interactiveResults.ts` (`log` mutation,
  `recentForParents` + `forLesson` queries). First completion of each lesson+block
  earns 5 engagement points + up to 10 score-scaled points and feeds the badge engine.
- All 9 components emit results via an `onComplete` prop (`interactive/types.ts`);
  `lesson-blocks.tsx` records lessonId + block index. The code lab logs the exact
  code lines + console output; arena/match/cloze/ordering log score; flashcards,
  timeline and simulations log exploration.
- Parents see results on the **dashboard** ("Recent interactive activity"), on the
  **parent lesson editor** (per-lesson breakdown), and in the **CSV/JSON export**.

**Coverage (100%)** — every teaching lesson has ≥1 logged interactive, so each
school day surfaces multiple interactive lessons. New lessons get one automatically
at seed time and existing ones were back-filled, via the shared pure derivation
`convex/curriculum/derive.ts` (maths → topic-matched arena drill; other subjects →
a flashcard deck or quick-check MCQ built from the lesson's own quiz). Re-run any
time with `npx convex run enrichLessons:ensureInteractivePractice` (idempotent;
returns a coverage %).

---

## Interactive Expansion — Authored Now (45 new lessons)

Fills the first ~2 school months (Aug 25 → ~Oct 21) with no bare calendar chips;
remaining days render a friendly "· soon" placeholder.

### Maths (+21)
- Decimals (4): Tenths & Hundredths · Comparing & Ordering · Adding & Subtracting · Decimals, Money & Rounding
- Percentages (3): What Is a Percentage? · Finding Percentages of Amounts (ARENA) · Fractions, Decimals & Percentages (FC)
- Measurement (3): Length & Metric Units · Mass & Capacity · Converting Units
- Geometry (3): Perimeter · Area of Rectangles · Angles Basics
- Negative Numbers (3): Numbers Below Zero · Ordering Pos/Neg (ORD) · Adding & Subtracting with Negatives
- Times Tables (2): Multiplication Facts (ARENA) · Division Facts (ARENA)
- Activities (3): Times-Tables Sprint · Add & Subtract Dash · Percentages Face-Off (all ARENA)

### English (+16)
- Punctuation (4): Capitals & Full Stops · Question & Exclamation Marks · Commas · Apostrophes
- Spelling Patterns (3): Making Plurals · Prefixes · Suffixes
- Paragraphs (3): Topic Sentences · Building a Strong Paragraph · Linking with Connectives (ORD)
- Inference (2): Reading Between the Lines · Using Evidence to Support Answers
- Vocabulary (1): Synonyms & Antonyms (FC)
- Activities (3): Vocabulary Match-Up (MATCH) · Punctuation Fix-It (CLOZE) · Word-Class Sort (MATCH)

### Other subjects (+8 activity labs)
- AI & CS (2): Your First JavaScript (CODE) · Conditions & Decisions (CODE)
- Game Dev (2): Draw a Sprite on the Canvas (CODE) · Animate a Moving Character (CODE)
- Science (2): Build a Circuit (SIM circuit) · Heat & States of Matter (SIM particles)
- History (1): WWII Timeline Challenge (ORD + TL)
- Homemaking (1): Kitchen Safety Match-Up (MATCH)
- Building (1): Tool ↔ Job Match-Up (MATCH)

---

## Maths (4 topics → 19 lessons)

### Fractions — beginner (6 lessons)
- [x] L1 What Is a Fraction? — numerator/denominator, parts of a whole — MCQ
- [x] L2 Fractions of Shapes & Number Lines — FC
- [x] L3 Equivalent Fractions — multiply/divide — MCQ
- [x] L4 Comparing & Ordering Fractions — ORD
- [x] L5 Adding & Subtracting (same denominator) — MCQ
- [x] L6 Fractions of an Amount — MCQ

### Ratios — beginner (4 lessons)
- [x] L1 What Is a Ratio? — MCQ
- [x] L2 Equivalent Ratios (scaling) — MCQ
- [x] L3 Sharing in a Ratio — MCQ
- [x] L4 Ratio Word Problems — MCQ

### Basic Algebra — intermediate (5 lessons)
- [x] L1 Variables & Expressions — MCQ
- [x] L2 Writing Expressions — MCQ
- [x] L3 One-step Equations (±) — MCQ
- [x] L4 One-step Equations (×÷) — MCQ
- [x] L5 Two-step Equations — MCQ

### Problem Solving — intermediate (4 lessons)
- [x] L1 The 4-Step Plan (read/plan/solve/check) — ORD
- [x] L2 Choosing the Operation — MCQ
- [x] L3 Multi-step Word Problems — MCQ
- [x] L4 Estimating & Checking — MCQ

---

## English (5 topics → 22 lessons)

### Grammar — beginner (5 lessons)
- [x] L1 Nouns — MCQ
- [x] L2 Verbs & Tenses — MCQ
- [x] L3 Adjectives & Adverbs — MCQ
- [x] L4 Pronouns — MCQ
- [x] L5 Prepositions & Conjunctions — FC

### Sentence Structure — beginner (4 lessons)
- [x] L1 Subjects & Predicates — MCQ
- [x] L2 Statements, Questions, Commands & Exclamations — MCQ
- [x] L3 Simple & Compound Sentences — MCQ
- [x] L4 Complex Sentences (clauses) — MCQ

### Reading Comprehension — intermediate (5 lessons)
- [x] L1 Finding the Main Idea — MCQ
- [x] L2 Supporting Details — MCQ
- [x] L3 Making Inferences — MCQ
- [x] L4 Fact vs Opinion — MCQ
- [x] L5 Author's Purpose — ORD

### Vocabulary — beginner (4 lessons)
- [x] L1 Context Clues — MCQ
- [x] L2 Synonyms & Antonyms — FC
- [x] L3 Prefixes & Suffixes — MCQ
- [x] L4 Homophones & Multiple-Meaning Words — MCQ

### Writing — intermediate (4 lessons)
- [x] L1 Planning & Paragraphs — ORD
- [x] L2 Strong Topic Sentences — MCQ
- [x] L3 Descriptive Writing — MCQ
- [x] L4 Narrative Story Structure — ORD

---

## Science (4 topics → 20 lessons)

### Human Body — beginner (5 lessons)
- [x] L1 The Heart & Blood — **SIM heart** + MCQ
- [x] L2 The Lungs & Breathing — **SIM lungs** + MCQ
- [x] L3 Bones & Muscles — **SIM skeleton** + FC
- [x] L4 The Digestive System — **SIM digestive** + ORD
- [x] L5 The Brain & Nerves — **SIM brain** + MCQ

### Electricity — intermediate (5 lessons)
- [x] L1 What Is Electricity? — MCQ
- [x] L2 Simple Circuits — MCQ
- [x] L3 Conductors & Insulators — FC
- [x] L4 Switches & Circuit Diagrams — MCQ
- [x] L5 Electrical Safety — MCQ

### States of Matter — beginner (5 lessons)
- [x] L1 Solids, Liquids & Gases — MCQ
- [x] L2 Particle Theory — MCQ
- [x] L3 Melting & Freezing — MCQ
- [x] L4 Boiling, Evaporation & Condensation — ORD
- [x] L5 The Water Cycle — ORD

### Forces — intermediate (5 lessons)
- [x] L1 Push & Pull — MCQ
- [x] L2 Gravity — MCQ
- [x] L3 Friction — MCQ
- [x] L4 Balanced & Unbalanced Forces — MCQ
- [x] L5 Magnetism — FC

---

## History (5 topics → 26 lessons)

### World War I — intermediate (6 lessons)
- [x] L1 The Causes of WWI (MAIN) — MCQ
- [x] L2 The Spark: Sarajevo 1914 — MCQ
- [x] L3 The Outbreak & Two Sides — MCQ
- [x] L4 Trench Warfare — MCQ
- [x] L5 Key Battles: Somme & Verdun — MCQ
- [x] L6 End of the War & Treaty of Versailles — TL

### World War II — intermediate (6 lessons)
- [x] L1 Causes of WWII — MCQ
- [x] L2 The War Begins (1939–40) — MCQ
- [x] L3 The Home Front — MCQ
- [x] L4 Key Turning Points — MCQ
- [x] L5 D-Day & Victory in Europe — TL
- [x] L6 The End & Legacy — MCQ

### American Founding & Revolution — intermediate (5 lessons)
- [x] L1 The 13 Colonies — MCQ
- [x] L2 Taxes & Tension — MCQ
- [x] L3 The Declaration of Independence — MCQ
- [x] L4 The Revolutionary War — TL
- [x] L5 The Constitution & New Nation — MCQ

### War of 1812 — advanced (4 lessons)
- [x] L1 Causes of the War — MCQ
- [x] L2 Burning of Washington & Fort McHenry — TL
- [x] L3 The Star-Spangled Banner — MCQ
- [x] L4 The Treaty of Ghent & Effects — MCQ

### American Civil War — advanced (5 lessons)
- [x] L1 A Nation Divides (causes) — MCQ
- [x] L2 Slavery & the Emancipation Proclamation — MCQ
- [x] L3 Major Battles — TL
- [x] L4 Lincoln & Leadership — MCQ
- [x] L5 Reconstruction & Aftermath — MCQ

---

## AI & Computer Science (6 topics → 24 lessons)

### Prompts — beginner (4 lessons)
- [x] L1 What Is a Prompt? — MCQ
- [x] L2 Writing Clear Prompts — MCQ
- [x] L3 Roles, Tasks & Rules — MCQ
- [x] L4 Iterating & Refining — ORD

### Logic — beginner (4 lessons)
- [x] L1 True & False — MCQ
- [x] L2 AND, OR, NOT — MCQ
- [x] L3 If-Then Reasoning — MCQ
- [x] L4 Logic Puzzles — MCQ

### Logic Gates — intermediate (4 lessons)
- [x] L1 AND Gates — MCQ
- [x] L2 OR Gates — MCQ
- [x] L3 NOT Gates — MCQ
- [x] L4 Combining Gates — FC

### Binary — intermediate (4 lessons)
- [x] L1 Why Binary? — MCQ
- [x] L2 Counting in Binary — ORD
- [x] L3 Binary Place Value — MCQ
- [x] L4 Bits & Bytes — FC

### Problem-Solving — beginner (4 lessons)
- [x] L1 Decomposition — MCQ
- [x] L2 Algorithms — ORD
- [x] L3 Pattern Recognition — MCQ
- [x] L4 Abstraction — MCQ

### Safe AI Use — beginner (4 lessons)
- [x] L1 Hallucinations (AI can be wrong) — MCQ
- [x] L2 Privacy & Your Data — MCQ
- [x] L3 Bias in AI — MCQ
- [x] L4 Using AI Honestly — MCQ

---

## Game Development (5 topics → 20 lessons)

### Game Loops — beginner (4 lessons)
- [x] L1 What Is a Game Loop? — MCQ
- [x] L2 Input, Update, Draw — ORD
- [x] L3 Frames & Framerate — MCQ
- [x] L4 Making Games Feel Smooth — MCQ

### Coordinates — beginner (4 lessons)
- [x] L1 The X-Y Plane — MCQ
- [x] L2 Screen Coordinates — MCQ
- [x] L3 Moving with X and Y — MCQ
- [x] L4 Distance & Direction — MCQ

### Game Logic — intermediate (4 lessons)
- [x] L1 If-Statements in Games — MCQ
- [x] L2 Game State — FC
- [x] L3 Collision Detection — MCQ
- [x] L4 Keeping Score — MCQ

### Coding — intermediate (4 lessons)
- [x] L1 Variables — MCQ
- [x] L2 Loops in Code — ORD
- [x] L3 Functions — MCQ
- [x] L4 Events & Input — MCQ

### Character Movement — intermediate (4 lessons)
- [x] L1 Position & Velocity — MCQ
- [x] L2 Smooth Movement — MCQ
- [x] L3 Gravity & Jumping — MCQ
- [x] L4 Animation Basics — ORD

---

## Homemaking (5 topics → 20 lessons)

### Cooking Basics — beginner (4 lessons)
- [x] L1 Kitchen Setup & Hand Hygiene — MCQ
- [x] L2 Measuring Ingredients — MCQ
- [x] L3 Using Heat: Boil, Simmer, Fry — ORD
- [x] L4 Following a Recipe — MCQ

### Kitchen Safety — beginner (4 lessons)
- [x] L1 Knife Safety — MCQ
- [x] L2 Heat & Fire Safety — MCQ
- [x] L3 Food Safety (cross-contamination & storage) — ORD
- [x] L4 Preventing Falls & Burns — MCQ

### Recipes — beginner (4 lessons)
- [x] L1 Reading a Recipe — MCQ
- [x] L2 Mise en Place (prep first) — ORD
- [x] L3 Timing Your Dishes — MCQ
- [x] L4 Adapting & Substituting — MCQ

### Cleaning Routines — beginner (4 lessons)
- [x] L1 Daily Cleaning Habits — MCQ
- [x] L2 Room-by-Room Cleaning — ORD
- [x] L3 Cleaning Products & Safety — MCQ
- [x] L4 Laundry Basics — FC

### Appliance Safety — beginner (4 lessons)
- [x] L1 Stove & Oven Safety — MCQ
- [x] L2 Microwave Safety — MCQ
- [x] L3 Small Appliances — MCQ
- [x] L4 Home Electrical Safety — MCQ

---

## Building & Construction (5 topics → 20 lessons)

### Blueprints — intermediate (4 lessons)
- [x] L1 What Is a Blueprint? — MCQ
- [x] L2 Views & Symbols — FC
- [x] L3 Measurements on Plans — MCQ
- [x] L4 Reading a Floor Plan — MCQ

### Scale — intermediate (4 lessons)
- [x] L1 What Is Scale? — MCQ
- [x] L2 Scale Ratios (1:50 etc.) — MCQ
- [x] L3 Scaling Up & Down — MCQ
- [x] L4 Scale in the Real World — MCQ

### Measuring — beginner (4 lessons)
- [x] L1 Tools for Measuring — FC
- [x] L2 Measuring Length Accurately — MCQ
- [x] L3 Angles & Levels — MCQ
- [x] L4 Measure Twice, Cut Once — MCQ

### Construction Basics — beginner (4 lessons)
- [x] L1 Foundations — MCQ
- [x] L2 Walls & Frames — ORD
- [x] L3 Roofs — MCQ
- [x] L4 Materials: Wood, Brick, Concrete — FC

### Hand-Tool Mechanics — beginner (4 lessons)
- [x] L1 Hammers & Nails — MCQ
- [x] L2 Screwdrivers & Screws — MCQ
- [x] L3 Saws & Cutting — MCQ
- [x] L4 Measuring & Marking Tools — ORD

---

## Totals
- Original rich set: Maths 19 · English 22 · Science 20 · History 26 · AI&CS 24 · GameDev 20 · Homemaking 20 · Building 20 = **171**
- Interactive expansion (this phase): **+45** (Maths +21, English +16, AI&CS +2, GameDev +2, Science +2, History +1, Homemaking +1, Building +1)
- **≈ 216 rich lessons** seeded (plus ~39 original text lessons). New titles are distinct → seeding is idempotent/additive.

---

## Remaining Curriculum — Future Build-Out (NOT yet authored)

Target ≈ 260 lessons/year so the full Aug→June calendar fills with real content.
Each future unit follows the same shape (heading + teaching blocks + worked
example + key points + ≥1 interactive + 5-question quiz) and adds a matching
activity (ARENA / MATCH / CLOZE / CODE / SIM / TL) per unit.

### Maths → ~190 (daily)
- Finish Decimals (multiplying/dividing), Percentages (increase/decrease, of money), Geometry (volume, 3D shapes, symmetry, coordinates), Measurement (time, area of compound shapes), Negative Numbers (multiplying), Statistics & Averages, Graphs & Charts, Time & Money, Mental-Maths strategies, multi-step Word Problems. Add a recurring `mathArena` activity per unit.

### English → ~190 (daily)
- Persuasive / Creative / Non-fiction / Report Writing, Summarising, Story Structure, Editing & Proofreading, Planning, Tone & Audience, Comparing Texts, Explanation Texts, Poetry, Speech Writing. Add `match` / `fillBlank` activity per unit.

### Science → ~76
- Light, Sound, Space, Plants, Animals & Habitats, Ecosystems, Materials & Properties, Scientific Method / Fair Testing / Recording Data. Add more `simulation` ids: `forces` (balance), `lightRays`, `soundWaves`, `plantGrowth`.

### History → ~76
- WWI / WWII / Founding / 1812 / Civil War sub-topics + Ancient Civilisations, Source Analysis, Bias & Propaganda, Chronology. Add a `timeline` challenge per era.

### AI & CS → ~38
- Algorithms, Variables, Conditionals, Loops, Functions, Debugging, Binary, Logic Gates, Internet Safety. Add a `codeSandbox` lab per concept.

### Game Dev → ~38
- Sprites, Collision, Controls, Health/Lives, Timers, Win/Lose Conditions, Animation, Menus, Sound. Add `codeSandbox` canvas projects.

### Homemaking → ~38
- Meal Planning, Nutrition, Food Storage, Laundry, Budgeting, Routines, Sewing Basics. Add `match` / checklist activities.

### Building → ~38
- Materials, Measuring, Angles, Levels, Load & Stability, Tool Safety, Project Planning, Joints & Fixings. Add `match` / diagram activities.

---

## Seeding
- `convex/seedRichCurriculum.ts` iterates `convex/curriculum/*.ts`, inserts lessons (with `content` blocks) + a 5-question quiz each. Idempotent by subject+title. It also auto-creates any topic declared in a subject's `topics` array (or referenced by a lesson) that doesn't yet exist, appended after existing topics.
- After seeding, run `calendar:generateYear` so the calendar picks up the new multi-lesson topic order.
- Commands (CLI reads `.env.local` automatically — do **not** `source` it; the deploy key contains a `|`):
  - `npx convex dev --once` (push schema + functions)
  - `npx convex run seedRichCurriculum:seedRichCurriculum`
  - `npx convex run calendar:generateYear`

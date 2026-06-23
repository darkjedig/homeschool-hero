import type { SubjectCurriculum } from "./types";
import { code } from "./types";

export const aics: SubjectCurriculum = {
  slug: "ai-and-computer-science",
  topics: [
    { name: "Coding Basics", description: "Write and run your first real code.", difficulty: "beginner" },
  ],
  lessons: [
    // ===================== PROMPTS (4) =====================
    {
      topic: "Prompts",
      title: "What Is a Prompt?",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "A prompt is the instruction you give an AI to tell it what to do. Clearer prompts give better answers.",
      blocks: [
        { type: "heading", text: "Talking to AI" },
        {
          type: "text",
          text: "A prompt is the instruction or question you type to tell an AI what you want. The AI reads your words and does its best to answer or create. The clearer and more specific your prompt, the better the result.\n\nThink of the AI as a helpful stranger who knows nothing about you. If you say 'write a story', you could get anything. If you say 'write a 100-word bedtime story about a brave mouse for a 6-year-old', you get exactly what you need.",
        },
        {
          type: "example",
          text: "Vague prompt: 'write something' → random result. Clear prompt: 'write a 100-word bedtime story about a brave mouse for a 6-year-old' → useful result.",
        },
        {
          type: "keyPoints",
          items: [
            "A prompt is your instruction to an AI.",
            "Clear, specific prompts win.",
            "The AI doesn't know you — explain what you want.",
            "Small wording changes change the result.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is a prompt?" },
            { key: "option_0", value: "The instruction you give an AI" },
            { key: "option_1", value: "A type of computer virus" },
            { key: "option_2", value: "A kind of keyboard" },
            { key: "option_3", value: "A password" },
            { key: "answer", value: "The instruction you give an AI" },
            { key: "explanation", value: "It tells the AI what you want." },
          ],
        },
      ],
      questions: [
        { q: "What is a prompt?", options: ["The instruction you give an AI", "A computer virus", "A screen saver", "A type of mouse"], answer: "The instruction you give an AI", explain: "It guides the AI." },
        { q: "Which is the BEST prompt?", options: ["'Write a 100-word bedtime story about a brave mouse'", "'Write something'", "'Story'", "'Do it'"], answer: "'Write a 100-word bedtime story about a brave mouse'", explain: "Specific task, length and topic." },
        { q: "Clearer prompts give…", options: ["better answers", "worse answers", "no answer", "a virus"], answer: "better answers", explain: "Specificity pays off." },
        { q: "When prompting, you should treat the AI like…", options: ["a helpful stranger who knows nothing about you", "your best friend", "a pet", "a printer only"], answer: "a helpful stranger who knows nothing about you", explain: "Explain context fully." },
        { q: "Why does prompt wording matter?", options: ["Small changes change the result", "It doesn't matter at all", "AI ignores words", "Only length matters"], answer: "Small changes change the result", explain: "Words steer the AI." },
      ],
    },
    {
      topic: "Prompts",
      title: "Writing Clear Prompts",
      difficulty: "beginner",
      minutes: 10,
      points: 70,
      summary: "Clear prompts include the task, the audience, the format, and any rules or limits.",
      blocks: [
        { type: "heading", text: "The Recipe for a Great Prompt" },
        {
          type: "text",
          text: "A great prompt has four helpful parts: the TASK (what to do), the AUDIENCE (who it's for), the FORMAT (how it should look) and the RULES (limits like length or style). The more of these you give, the closer the result matches what you want.\n\nWeak: 'explain photosynthesis'. Strong: 'explain photosynthesis to a 10-year-old in 80 words, using a tree example, with a fun fact at the end'.",
        },
        {
          type: "example",
          text: "Task: 'write a poem'. Audience: 'for kids'. Format: '4 lines, rhyming'. Rules: 'about rain, funny'. Result: a perfect short funny rhyming poem about rain.",
        },
        {
          type: "keyPoints",
          items: [
            "Task: what to do.",
            "Audience: who it's for.",
            "Format: how it should look.",
            "Rules: limits (length, style, tone).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which prompt part says WHO the output is for?" },
            { key: "option_0", value: "Audience" },
            { key: "option_1", value: "Format" },
            { key: "option_2", value: "Rules" },
            { key: "option_3", value: "Task" },
            { key: "answer", value: "Audience" },
            { key: "explanation", value: "e.g. 'for a 10-year-old'." },
          ],
        },
      ],
      questions: [
        { q: "Which is a clear, strong prompt?", options: ["'Explain photosynthesis to a 10-year-old in 80 words'", "'Photosynthesis'", "'Explain'", "'Do science'"], answer: "'Explain photosynthesis to a 10-year-old in 80 words'", explain: "Task + audience + length." },
        { q: "The TASK part tells the AI…", options: ["what to do", "who it's for", "the font", "the price"], answer: "what to do", explain: "The action." },
        { q: "FORMAT in a prompt means…", options: ["how the output should look", "the colour of text", "the computer model", "the password"], answer: "how the output should look", explain: "e.g. list, poem, table." },
        { q: "A RULE might be…", options: ["'keep it under 50 words'", "'use a mouse'", "'type slowly'", "'turn off the wifi'"], answer: "'keep it under 50 words'", explain: "A limit on output." },
        { q: "More specific prompts usually give…", options: ["more useful answers", "shorter answers always", "no answers", "error messages"], answer: "more useful answers", explain: "Specificity pays." },
      ],
    },
    {
      topic: "Prompts",
      title: "Roles, Tasks & Rules",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Giving the AI a role (e.g. 'act as a tutor') shapes its tone and the depth of its answer.",
      blocks: [
        { type: "heading", text: "Be Someone" },
        {
          type: "text",
          text: "One powerful trick is to give the AI a ROLE: 'Act as a kind maths tutor' or 'Act as a pirate chef'. This shapes the tone, vocabulary and style of the answer — a tutor explains gently; a pirate chef is silly and salty.\n\nCombine role + task + rules: 'Act as a friendly football coach. Explain offside to an 8-year-old in 60 words.' The AI now answers in coach style, at the right level, in the right length.",
        },
        {
          type: "example",
          text: "'Act as a grumpy wizard' + 'explain gravity' → 'Bah! Gravity is the magic that pulls foolish things down. Read a book!' The role changes the whole tone.",
        },
        {
          type: "keyPoints",
          items: [
            "Give the AI a role to shape its tone.",
            "Role + task + rules = strong prompt.",
            "Roles change vocabulary and style.",
            "Pick a role that fits your goal.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What does giving the AI a ROLE do?" },
            { key: "option_0", value: "Shapes its tone and style" },
            { key: "option_1", value: "Deletes the answer" },
            { key: "option_2", value: "Changes the computer's colour" },
            { key: "option_3", value: "Has no effect" },
            { key: "answer", value: "Shapes its tone and style" },
            { key: "explanation", value: "e.g. tutor, pirate, coach." },
          ],
        },
      ],
      questions: [
        { q: "'Act as a maths tutor' is setting a…", options: ["role", "password", "virus", "screen"], answer: "role", explain: "Shapes tone." },
        { q: "Role + task + … = strong prompt?", options: ["rules", "viruses", "fonts", "passwords"], answer: "rules", explain: "Limits + style." },
        { q: "Why pick a role that fits your goal?", options: ["To get the right tone and depth", "To use more words", "To slow the AI", "No reason"], answer: "To get the right tone and depth", explain: "Match role to need." },
        { q: "A pirate role would make answers…", options: ["silly and salty", "formal and dull", "silent", "mathematical"], answer: "silly and salty", explain: "Style follows role." },
        { q: "Best prompt for a child-friendly explain?", options: ["'Act as a friendly teacher, explain X for an 8-year-old'", "'Just explain X'", "'X now'", "'Be quiet'"], answer: "'Act as a friendly teacher, explain X for an 8-year-old'", explain: "Role + audience." },
      ],
    },
    {
      topic: "Prompts",
      title: "Iterating & Refining",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "If the first answer isn't perfect, change your prompt and try again — prompting is a loop, not a one-shot.",
      blocks: [
        { type: "heading", text: "Try, Try Again" },
        {
          type: "text",
          text: "Rarely is the first answer perfect. Good prompters iterate: read the result, see what's missing, then change the prompt and try again. Add detail, switch the audience, change the format, give an example.\n\nEach round teaches the AI more about what you want. Prompting is a conversation. Track what changed so you learn what works for next time.",
        },
        {
          type: "example",
          text: "Round 1: 'explain gravity'. Too hard? Round 2: 'explain gravity to a 7-year-old with an apple example'. Better? Round 3: add 'in 40 words'. Refining gets you there.",
        },
        {
          type: "keyPoints",
          items: [
            "Iterate — don't expect perfect first time.",
            "Change one thing per round.",
            "Add detail, examples or limits.",
            "Prompting is a conversation.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Write your first prompt" },
            { key: "2", value: "Read the AI's answer" },
            { key: "3", value: "Spot what's missing or wrong" },
            { key: "4", value: "Refine the prompt and try again" },
          ],
        },
      ],
      questions: [
        { q: "First AI answers are usually…", options: ["not perfect", "always perfect", "viruses", "blank"], answer: "not perfect", explain: "So we iterate." },
        { q: "To refine, you should…", options: ["change the prompt and retry", "give up", "shout at the AI", "delete everything"], answer: "change the prompt and retry", explain: "Iterate." },
        { q: "Prompting is best seen as a…", options: ["conversation/loop", "one-time guess", "password", "game over"], answer: "conversation/loop", explain: "Refine each round." },
        { q: "A good refinement might add…", options: ["an example or a length limit", "a virus", "a random word", "silence"], answer: "an example or a length limit", explain: "More guidance." },
        { q: "When iterating, change…", options: ["one thing at a time", "everything randomly", "nothing", "the computer"], answer: "one thing at a time", explain: "So you learn what helps." },
      ],
    },

    // ===================== LOGIC (4) =====================
    {
      topic: "Logic",
      title: "True & False",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "In logic, a statement is a sentence that is either true or false — the building block of reasoning.",
      blocks: [
        { type: "heading", text: "Statements" },
        {
          type: "text",
          text: "Logic is the study of correct reasoning. A logical statement is a sentence that is either TRUE or FALSE — not both, not neither. 'The sky is blue' is a statement (true on a clear day). 'Pigs can fly' is a statement (false).\n\nQuestions, commands and feelings are NOT statements because they cannot be true or false. 'Close the door!' is a command, not a statement.",
        },
        {
          type: "example",
          text: "Statement: '2 + 2 = 4' (true). Statement: '5 is bigger than 10' (false). Not a statement: 'What time is it?' (a question).",
        },
        {
          type: "keyPoints",
          items: [
            "A statement is true or false.",
            "Not both, not neither.",
            "Questions and commands aren't statements.",
            "Statements are the atoms of logic.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is a logical statement?" },
            { key: "option_0", value: "The Moon orbits the Earth." },
            { key: "option_1", value: "Close the door!" },
            { key: "option_2", value: "Ouch!" },
            { key: "option_3", value: "What is 2+2?" },
            { key: "answer", value: "The Moon orbits the Earth." },
            { key: "explanation", value: "It can be true or false." },
          ],
        },
      ],
      questions: [
        { q: "A logical statement is…", options: ["true or false", "always a question", "a command", "a feeling"], answer: "true or false", explain: "Has a truth value." },
        { q: "Which is NOT a statement?", options: ["Sit down!", "Ice is cold.", "2 > 1.", "Cats meow."], answer: "Sit down!", explain: "It's a command." },
        { q: "'5 is bigger than 10' is a statement that is…", options: ["false", "true", "a question", "neither"], answer: "false", explain: "5 is smaller." },
        { q: "'What time is it?' is…", options: ["a question, not a statement", "a true statement", "a false statement", "a command"], answer: "a question, not a statement", explain: "No truth value." },
        { q: "Logic is the study of…", options: ["correct reasoning", "spelling", "history", "music"], answer: "correct reasoning", explain: "Reasoning from statements." },
      ],
    },
    {
      topic: "Logic",
      title: "AND, OR, NOT",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "AND, OR and NOT join statements: AND needs both true; OR needs at least one; NOT flips.",
      blocks: [
        { type: "heading", text: "Joining Statements" },
        {
          type: "text",
          text: "We can join statements with AND, OR and NOT. 'Cold AND wet' is true only if BOTH are true. 'Cold OR wet' is true if AT LEAST ONE is true. 'NOT cold' flips it: true if it's not cold.\n\nComputers use this exact kind of logic to make decisions in programs. A search filters results with AND (must match all), OR (match any), NOT (exclude).",
        },
        {
          type: "example",
          text: "'Raining AND cold' = true only if both. 'Raining OR sunny' = true if either. 'NOT raining' = true if it's dry.",
        },
        {
          type: "keyPoints",
          items: [
            "AND: both must be true.",
            "OR: at least one true.",
            "NOT: flips true↔false.",
            "Computers decide with these.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "'Cold AND wet' is true when…" },
            { key: "option_0", value: "both cold and wet" },
            { key: "option_1", value: "only cold" },
            { key: "option_2", value: "only wet" },
            { key: "option_3", value: "neither" },
            { key: "answer", value: "both cold and wet" },
            { key: "explanation", value: "AND needs both." },
          ],
        },
      ],
      questions: [
        { q: "AND needs…", options: ["both true", "one true", "none true", "any"], answer: "both true", explain: "All parts." },
        { q: "OR is true when…", options: ["at least one is true", "none are true", "both are false", "always"], answer: "at least one is true", explain: "Any one." },
        { q: "NOT true = …", options: ["false", "true", "both", "neither"], answer: "false", explain: "Flips the value." },
        { q: "'Sunny OR rainy' (it's sunny) → ?", options: ["True", "False", "Cannot tell", "Both"], answer: "True", explain: "One is true." },
        { q: "If 'raining' is false, 'NOT raining' is…", options: ["true", "false", "both", "neither"], answer: "true", explain: "Flipped." },
      ],
    },
    {
      topic: "Logic",
      title: "If-Then Reasoning",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "An if-then statement says: IF the first part is true, THEN the second must follow.",
      blocks: [
        { type: "heading", text: "Cause and Effect" },
        {
          type: "text",
          text: "An if-then statement (a conditional) says: IF A is true, THEN B happens. 'IF it rains, THEN the ground gets wet.' The first part (A) is the condition; the second (B) is the result.\n\nIf-then is the heart of both everyday reasoning and computer programs. Code is full of 'if this, then do that'. Spotting if-then helps us predict consequences and debug code.",
        },
        {
          type: "example",
          text: "'IF you study, THEN you learn.' Studying is the condition; learning is the result. If the condition is true, the result follows.",
        },
        {
          type: "keyPoints",
          items: [
            "If-then links a condition to a result.",
            "IF A, THEN B.",
            "If A is true, B should follow.",
            "Computers run on if-then logic.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "'IF it is a dog, THEN it has a tail.' A puppy is a dog. So…" },
            { key: "option_0", value: "It has a tail" },
            { key: "option_1", value: "It has no tail" },
            { key: "option_2", value: "It is a cat" },
            { key: "option_3", value: "Cannot tell" },
            { key: "answer", value: "It has a tail" },
            { key: "explanation", value: "Condition met → result follows." },
          ],
        },
      ],
      questions: [
        { q: "An if-then links a…", options: ["condition to a result", "noun to a verb", "title to a page", "name to a face"], answer: "condition to a result", explain: "IF A THEN B." },
        { q: "'IF it rains, THEN grass grows.' Raining → ?", options: ["Grass grows", "Grass dies", "No grass", "It snows"], answer: "Grass grows", explain: "Result follows." },
        { q: "In 'IF A THEN B', A is the…", options: ["condition", "result", "conclusion", "title"], answer: "condition", explain: "The 'if' part." },
        { q: "If-then logic is the heart of…", options: ["computer programs", "cooking only", "music", "painting"], answer: "computer programs", explain: "Code uses if-statements." },
        { q: "'IF you freeze water, THEN it becomes ice.' Freezing → ?", options: ["Ice", "Steam", "Gas", "Nothing"], answer: "Ice", explain: "Result follows." },
      ],
    },
    {
      topic: "Logic",
      title: "Logic Puzzles",
      difficulty: "beginner",
      minutes: 14,
      points: 80,
      summary: "Logic puzzles use clues to narrow possibilities — list what you know, eliminate, and find the only answer left.",
      blocks: [
        { type: "heading", text: "Solve With Clues" },
        {
          type: "text",
          text: "A logic puzzle gives you a set of clues and asks you to figure out something (who owns which pet? which box has the prize?). The trick is to organise what you know: make a grid or list, then eliminate anything a clue rules out.\n\nKeep crossing off until only one option fits each slot. If you get stuck, re-read every clue — one you missed may unlock the next step.",
        },
        {
          type: "example",
          text: "Clues: Tom has a dog. The cat owner is 8. Tom is 9. So Tom is NOT the cat owner. Cross off, and the cat owner must be someone else.",
        },
        {
          type: "keyPoints",
          items: [
            "List the options first.",
            "Use clues to eliminate.",
            "Re-read clues if stuck.",
            "Only one option should fit each slot.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Clue: 'The prize is NOT in the red box.' Boxes: red, blue, green. Where could the prize be?" },
            { key: "option_0", value: "Blue or green" },
            { key: "option_1", value: "Only red" },
            { key: "option_2", value: "Nowhere" },
            { key: "option_3", value: "All three boxes" },
            { key: "answer", value: "Blue or green" },
            { key: "explanation", value: "Red is ruled out by the clue." },
          ],
        },
      ],
      questions: [
        { q: "Best first step in a logic puzzle?", options: ["List the options", "Guess randomly", "Give up", "Skip the clues"], answer: "List the options", explain: "Then eliminate." },
        { q: "Clue: 'Tom has the dog. The cat owner is 8. Tom is 9.' So Tom…", options: ["does not own the cat", "owns the cat", "is 8", "has no pets"], answer: "does not own the cat", explain: "Cat owner is 8; Tom is 9." },
        { q: "If stuck, you should…", options: ["re-read every clue", "quit", "change the rules", "ignore clues"], answer: "re-read every clue", explain: "A missed clue unlocks progress." },
        { q: "A grid or list helps you…", options: ["eliminate and organise", "draw pictures", "count words", "spell"], answer: "eliminate and organise", explain: "Visual tracking." },
        { q: "In the end, how many options fit each slot?", options: ["One", "Two", "Many", "None"], answer: "One", explain: "Logic narrows to one." },
      ],
    },

    // ===================== LOGIC GATES (4) =====================
    {
      topic: "Logic Gates",
      title: "AND Gates",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "An AND gate outputs true (1) only when ALL its inputs are true. Like a door needing two keys at once.",
      blocks: [
        { type: "heading", text: "All Inputs Must Be True" },
        {
          type: "text",
          text: "An AND gate is a tiny switch inside a computer. It takes two (or more) inputs and gives one output. The output is true (1) ONLY when every input is true. If even one input is false (0), the output is false.\n\nThink of a safety door that needs two keys turned at once — both must be 'true' to open. AND gates are used when several conditions must all be met.",
        },
        {
          type: "example",
          text: "AND truth table: 1 AND 1 = 1. 1 AND 0 = 0. 0 AND 1 = 0. 0 AND 0 = 0. Only all-true gives true.",
        },
        {
          type: "keyPoints",
          items: [
            "AND outputs 1 only if all inputs are 1.",
            "Any 0 input → output 0.",
            "Like needing two keys at once.",
            "Used when all conditions must be met.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is 1 AND 1 AND 0?" },
            { key: "option_0", value: "0 (false)" },
            { key: "option_1", value: "1 (true)" },
            { key: "option_2", value: "2" },
            { key: "option_3", value: "Cannot tell" },
            { key: "answer", value: "0 (false)" },
            { key: "explanation", value: "Any 0 makes AND output 0." },
          ],
        },
      ],
      questions: [
        { q: "AND outputs 1 when…", options: ["all inputs are 1", "any input is 0", "no inputs are 1", "always"], answer: "all inputs are 1", explain: "All must be true." },
        { q: "1 AND 0 = ?", options: ["0", "1", "2", "10"], answer: "0", explain: "One false → false." },
        { q: "AND is like…", options: ["needing two keys at once", "either key alone", "no keys", "a single switch"], answer: "needing two keys at once", explain: "Both required." },
        { q: "0 AND 0 AND 0 = ?", options: ["0", "1", "3", "Cannot tell"], answer: "0", explain: "All false." },
        { q: "Which gives AND = 1?", options: ["1 AND 1", "1 AND 0", "0 AND 1", "0 AND 0"], answer: "1 AND 1", explain: "Only all true." },
      ],
    },
    {
      topic: "Logic Gates",
      title: "OR Gates",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "An OR gate outputs true (1) if ANY input is true. Like a door opening for any one of several keys.",
      blocks: [
        { type: "heading", text: "Any Input True Is Enough" },
        {
          type: "text",
          text: "An OR gate takes inputs and outputs true (1) if AT LEAST ONE input is true. Only if all inputs are false (0) is the output false. It's the easygoing gate — one true is enough.\n\nThink of a door that opens for any one of several keys. OR gates are used when any one condition being met is enough — like an alarm that sounds if any sensor trips.",
        },
        {
          type: "example",
          text: "OR truth table: 1 OR 1 = 1. 1 OR 0 = 1. 0 OR 1 = 1. 0 OR 0 = 0. Only all-false gives false.",
        },
        {
          type: "keyPoints",
          items: [
            "OR outputs 1 if any input is 1.",
            "Only all 0 inputs → output 0.",
            "Like any one key opening a door.",
            "Used when any condition is enough.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is 0 OR 0 OR 1?" },
            { key: "option_0", value: "1 (true)" },
            { key: "option_1", value: "0 (false)" },
            { key: "option_2", value: "3" },
            { key: "option_3", value: "Cannot tell" },
            { key: "answer", value: "1 (true)" },
            { key: "explanation", value: "Any 1 makes OR output 1." },
          ],
        },
      ],
      questions: [
        { q: "OR outputs 1 when…", options: ["any input is 1", "all inputs are 0", "no inputs are 1", "never"], answer: "any input is 1", explain: "One true is enough." },
        { q: "0 OR 0 = ?", options: ["0", "1", "2", "00"], answer: "0", explain: "All false → false." },
        { q: "1 OR 0 = ?", options: ["1", "0", "10", "2"], answer: "1", explain: "One true → true." },
        { q: "OR is like…", options: ["any one key opening a door", "needing all keys", "no keys", "a locked vault"], answer: "any one key opening a door", explain: "One is enough." },
        { q: "Which gives OR = 0?", options: ["0 OR 0", "1 OR 0", "0 OR 1", "1 OR 1"], answer: "0 OR 0", explain: "Only all false." },
      ],
    },
    {
      topic: "Logic Gates",
      title: "NOT Gates",
      difficulty: "intermediate",
      minutes: 10,
      points: 70,
      summary: "A NOT gate (inverter) flips its single input: 1 becomes 0, 0 becomes 1.",
      blocks: [
        { type: "heading", text: "The Flipper" },
        {
          type: "text",
          text: "A NOT gate is the simplest gate: it has ONE input and flips it. Input 1 → output 0. Input 0 → output 1. It is also called an inverter.\n\nNOT is used to reverse a condition. 'IF NOT raining, THEN go outside' — the NOT flips 'raining' into 'not raining' so the rule works the way you want.",
        },
        {
          type: "example",
          text: "NOT truth table: NOT 1 = 0. NOT 0 = 1. That's it — always the opposite.",
        },
        {
          type: "keyPoints",
          items: [
            "NOT has one input.",
            "It flips: 1→0, 0→1.",
            "Also called an inverter.",
            "Used to reverse a condition.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is NOT 1?" },
            { key: "option_0", value: "0" },
            { key: "option_1", value: "1" },
            { key: "option_2", value: "2" },
            { key: "option_3", value: "-1" },
            { key: "answer", value: "0" },
            { key: "explanation", value: "NOT flips to the opposite." },
          ],
        },
      ],
      questions: [
        { q: "NOT 0 = ?", options: ["1", "0", "2", "-1"], answer: "1", explain: "Flipped." },
        { q: "NOT 1 = ?", options: ["0", "1", "2", "10"], answer: "0", explain: "Flipped." },
        { q: "How many inputs does a NOT gate have?", options: ["One", "Two", "Three", "None"], answer: "One", explain: "Single input, flipped." },
        { q: "A NOT gate is also called a/an…", options: ["inverter", "amplifier", "antenna", "adapter"], answer: "inverter", explain: "It inverts." },
        { q: "NOT is used to…", options: ["reverse a condition", "add two numbers", "store memory", "display text"], answer: "reverse a condition", explain: "Flip true/false." },
      ],
    },
    {
      topic: "Logic Gates",
      title: "Combining Gates",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "Wiring AND, OR and NOT gates together builds every operation a computer does — maths, memory and more.",
      blocks: [
        { type: "heading", text: "Building Bigger Brains" },
        {
          type: "text",
          text: "Single gates are simple, but wire millions together and you get a computer. Combining gates lets you build circuits that add numbers, remember data and run programs. For example, AND + NOT makes NAND — a 'universal' gate that can build any other gate.\n\nEngineers chain gates into 'logic circuits' that make decisions. Every calculation your phone does is, deep down, a huge web of AND, OR and NOT.",
        },
        {
          type: "example",
          text: "Adder circuit: wires XOR (made from AND, OR, NOT) gates to add two bits and produce a sum + carry. Stack these to add whole numbers.",
        },
        {
          type: "keyPoints",
          items: [
            "Gates combine into logic circuits.",
            "AND + NOT = NAND (universal gate).",
            "Circuits can add, store and decide.",
            "Computers = millions of connected gates.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "AND (all true → true)", value: "Needs every input true" },
            { key: "OR (any true → true)", value: "One true is enough" },
            { key: "NOT (flip)", value: "1→0, 0→1" },
            { key: "NAND = AND + NOT", value: "Universal gate" },
            { key: "Millions of gates", value: "Make a computer chip" },
          ],
        },
      ],
      questions: [
        { q: "Combining gates lets you build…", options: ["circuits that add and remember", "a sandwich", "a painting", "a song"], answer: "circuits that add and remember", explain: "Logic circuits." },
        { q: "AND + NOT makes…", options: ["NAND", "OR", "XOR", "Flip-flop"], answer: "NAND", explain: "Universal gate." },
        { q: "A 'universal' gate can build…", options: ["any other gate", "only itself", "nothing", "a virus"], answer: "any other gate", explain: "NAND/NOR are universal." },
        { q: "Deep down, a computer is…", options: ["millions of connected gates", "one giant gate", "no gates", "a single AND"], answer: "millions of connected gates", explain: "Huge logic webs." },
        { q: "An adder circuit is built from…", options: ["gates like XOR/AND/OR/NOT", "wood", "water", "paper"], answer: "gates like XOR/AND/OR/NOT", explain: "Logic adds bits." },
      ],
    },

    // ===================== BINARY (4) =====================
    {
      topic: "Binary",
      title: "Why Binary?",
      difficulty: "intermediate",
      minutes: 10,
      points: 70,
      summary: "Computers use binary (just 1s and 0s) because electronic switches have two reliable states: on and off.",
      blocks: [
        { type: "heading", text: "Two States Are Reliable" },
        {
          type: "text",
          text: "Computers store everything — numbers, text, pictures, sound — using only two digits: 1 and 0. This is called binary. Why just two? Because the tiny switches inside a computer (transistors) are most reliable with two clear states: ON (1) and OFF (0).\n\nWith only two states, it's easy to tell them apart even if a wire is a bit noisy. More states would be error-prone. Binary keeps computers fast and accurate.",
        },
        {
          type: "example",
          text: "A light switch is binary: ON or OFF. If you had a dimmer with 10 levels, you might mistake a 7 for an 8 — but ON and OFF are unmistakable.",
        },
        {
          type: "keyPoints",
          items: [
            "Binary uses only 1 and 0.",
            "Each 1 or 0 is a 'bit'.",
            "Two states (on/off) are reliable.",
            "All data — text, images, sound — is binary.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why do computers use binary?" },
            { key: "option_0", value: "Two states (on/off) are reliable" },
            { key: "option_1", value: "It uses less ink" },
            { key: "option_2", value: "It's faster to read" },
            { key: "option_3", value: "There's no other way" },
            { key: "answer", value: "Two states (on/off) are reliable" },
            { key: "explanation", value: "Transistors switch cleanly between on/off." },
          ],
        },
      ],
      questions: [
        { q: "How many digits does binary use?", options: ["Two (1 and 0)", "Ten", "Eight", "One hundred"], answer: "Two (1 and 0)", explain: "Base-2." },
        { q: "Each 1 or 0 is called a…", options: ["bit", "byte", "bot", "bag"], answer: "bit", explain: "Binary digit." },
        { q: "Why are two states used?", options: ["They are reliable", "They use more power", "They are slow", "No reason"], answer: "They are reliable", explain: "Easy to tell apart." },
        { q: "A transistor's two states are…", options: ["on and off", "hot and cold", "red and blue", "loud and quiet"], answer: "on and off", explain: "Like switches." },
        { q: "Which can be stored as binary?", options: ["Text, images and sound", "Only numbers", "Only letters", "Nothing"], answer: "Text, images and sound", explain: "Everything digital." },
      ],
    },
    {
      topic: "Binary",
      title: "Counting in Binary",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "In binary, each place is worth double the one before (1, 2, 4, 8…), so 101 in binary equals 5.",
      blocks: [
        { type: "heading", text: "Base-2 Counting" },
        {
          type: "text",
          text: "In normal (decimal) counting we use ten digits and each place is worth ten times the one before (1, 10, 100…). In binary each place is worth DOUBLE (1, 2, 4, 8, 16…). So a 1 in a place means 'add that value'; a 0 means 'skip it'.\n\nBinary 101 = 4 + 0 + 1 = 5. Binary 110 = 4 + 2 + 0 = 6. Read binary right-to-left, adding the place values where there's a 1.",
        },
        {
          type: "example",
          text: "Convert 1011 to decimal: places 8,4,2,1. There's a 1 in 8, 2 and 1 → 8 + 2 + 1 = 11. So 1011 = 11.",
        },
        {
          type: "keyPoints",
          items: [
            "Binary places: 1, 2, 4, 8, 16… (doubling).",
            "1 = add that place value; 0 = skip.",
            "101 = 4 + 0 + 1 = 5.",
            "Read right-to-left.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Write the binary places: 8 4 2 1" },
            { key: "2", value: "Put the binary digits under each place" },
            { key: "3", value: "Add the places that have a 1" },
            { key: "4", value: "The total is the decimal value" },
          ],
        },
      ],
      questions: [
        { q: "Binary 101 = ?", options: ["5", "3", "101", "4"], answer: "5", explain: "4 + 0 + 1 = 5." },
        { q: "Binary 110 = ?", options: ["6", "4", "3", "110"], answer: "6", explain: "4 + 2 + 0 = 6." },
        { q: "Binary places go up by…", options: ["doubling", "adding 1", "adding 10", "tripling"], answer: "doubling", explain: "1, 2, 4, 8…" },
        { q: "Binary 1111 = ?", options: ["15", "4", "1111", "10"], answer: "15", explain: "8+4+2+1 = 15." },
        { q: "Binary 1000 = ?", options: ["8", "1", "1000", "0"], answer: "8", explain: "Only the 8 place is on." },
      ],
    },
    {
      topic: "Binary",
      title: "Binary Place Value",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Each binary digit's place value is a power of 2: …16, 8, 4, 2, 1 — just like decimal uses powers of 10.",
      blocks: [
        { type: "heading", text: "Powers of Two" },
        {
          type: "text",
          text: "Each place in binary is a power of 2. From right to left the places are 2⁰=1, 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32… This mirrors decimal, where places are powers of 10 (1, 10, 100, 1000).\n\nTo convert, list the place values, write the binary digits under them, and add up the places with a 1. With five bits you can count 0–31; with eight bits (a byte) you can count 0–255.",
        },
        {
          type: "example",
          text: "Byte places: 128, 64, 32, 16, 8, 4, 2, 1. The number 10000001 = 128 + 1 = 129.",
        },
        {
          type: "keyPoints",
          items: [
            "Places are powers of 2.",
            "Right-to-left: 1, 2, 4, 8, 16, 32…",
            "Decimal uses powers of 10.",
            "8 bits = a byte (0–255).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is the place value of the 4th binary digit from the right?" },
            { key: "option_0", value: "8" },
            { key: "option_1", value: "4" },
            { key: "option_2", value: "16" },
            { key: "option_3", value: "10" },
            { key: "answer", value: "8" },
            { key: "explanation", value: "Places: 1, 2, 4, 8 — the 4th is 8." },
          ],
        },
      ],
      questions: [
        { q: "Binary place values are powers of…", options: ["2", "10", "5", "1"], answer: "2", explain: "1, 2, 4, 8…" },
        { q: "How many values can 8 bits (a byte) represent?", options: ["256 (0–255)", "8", "100", "64"], answer: "256 (0–255)", explain: "2⁸ = 256." },
        { q: "The rightmost binary place is worth…", options: ["1", "0", "2", "10"], answer: "1", explain: "2⁰ = 1." },
        { q: "Decimal place values are powers of…", options: ["10", "2", "8", "16"], answer: "10", explain: "1, 10, 100…" },
        { q: "10000001 (binary) = ?", options: ["129", "1", "128", "2"], answer: "129", explain: "128 + 1." },
      ],
    },
    {
      topic: "Binary",
      title: "Bits & Bytes",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "A bit is one 1/0; a byte is 8 bits. Kilobytes, megabytes and gigabytes are groups of bytes.",
      blocks: [
        { type: "heading", text: "Measuring Data" },
        {
          type: "text",
          text: "A bit is a single 1 or 0 — the smallest unit of data. A byte is 8 bits grouped together, enough to store one text character (like 'A'). Bytes are the basic building block for measuring data size.\n\nLarger groups: kilobyte (KB) ≈ 1000 bytes, megabyte (MB) ≈ 1000 KB, gigabyte (GB) ≈ 1000 MB, terabyte (TB) ≈ 1000 GB. A song might be a few MB; a film a few GB.",
        },
        {
          type: "example",
          text: "The letter 'A' is stored as the byte 01000001. That's 8 bits = 1 byte. A 1 MB photo holds about 1 million bytes — 8 million bits.",
        },
        {
          type: "keyPoints",
          items: [
            "Bit = one 1 or 0.",
            "Byte = 8 bits (one character).",
            "KB ≈ 1000 bytes; MB ≈ 1000 KB.",
            "GB ≈ 1000 MB; TB ≈ 1000 GB.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "1 bit", value: "A single 1 or 0" },
            { key: "1 byte", value: "8 bits" },
            { key: "1 kilobyte (KB)", value: "~1000 bytes" },
            { key: "1 megabyte (MB)", value: "~1000 KB" },
            { key: "1 gigabyte (GB)", value: "~1000 MB" },
          ],
        },
      ],
      questions: [
        { q: "How many bits in a byte?", options: ["8", "2", "10", "1"], answer: "8", explain: "8 bits = 1 byte." },
        { q: "A bit is…", options: ["a single 1 or 0", "8 bytes", "1000 bytes", "a type of mouse"], answer: "a single 1 or 0", explain: "Smallest unit." },
        { q: "1 MB is about…", options: ["1000 KB", "8 bits", "1 byte", "100 bytes"], answer: "1000 KB", explain: "Megabyte." },
        { q: "One text character needs about…", options: ["1 byte", "1 GB", "8 bytes", "1 TB"], answer: "1 byte", explain: "8 bits." },
        { q: "A film might be a few…", options: ["GB", "bits", "bytes", "KB"], answer: "GB", explain: "Gigabytes." },
      ],
    },

    // ===================== PROBLEM-SOLVING (4) =====================
    {
      topic: "Problem-Solving",
      title: "Decomposition",
      difficulty: "beginner",
      minutes: 10,
      points: 70,
      summary: "Decomposition means breaking a big problem into smaller, manageable parts.",
      blocks: [
        { type: "heading", text: "Divide and Conquer" },
        {
          type: "text",
          text: "Decomposition is breaking a big, scary problem into smaller, easier parts. 'Build a game' is huge; but 'design the player', 'draw the level', 'code movement', 'add scoring' are smaller tasks you can tackle one at a time.\n\nThis is how programmers, engineers and planners work. Each small part can be built and tested separately, then joined. Smaller parts are easier to understand, fix and reuse.",
        },
        {
          type: "example",
          text: "Baking a cake decomposed: get ingredients, measure, mix, pour, bake, cool, decorate. Each step is simple; together they make a cake.",
        },
        {
          type: "keyPoints",
          items: [
            "Break big problems into small parts.",
            "Tackle one part at a time.",
            "Each part can be tested alone.",
            "Parts can be reused.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What does decomposition mean?" },
            { key: "option_0", value: "Breaking a big problem into smaller parts" },
            { key: "option_1", value: "Removing parts of a program" },
            { key: "option_2", value: "Composting food" },
            { key: "option_3", value: "Counting in binary" },
            { key: "answer", value: "Breaking a big problem into smaller parts" },
            { key: "explanation", value: "Divide and conquer." },
          ],
        },
      ],
      questions: [
        { q: "Decomposition is…", options: ["breaking big problems into small parts", "deleting code", "counting", "drawing"], answer: "breaking big problems into small parts", explain: "Divide and conquer." },
        { q: "'Build an app' decomposed might start with…", options: ["design the screens", "ignore the user", "skip planning", "guess randomly"], answer: "design the screens", explain: "A small task." },
        { q: "Why decompose?", options: ["Smaller parts are easier to build and test", "To use more paper", "To slow down", "No reason"], answer: "Smaller parts are easier to build and test", explain: "Manageable chunks." },
        { q: "Decomposing 'bake a cake' gives steps like…", options: ["measure, mix, bake", "eat, sleep", "run, jump", "read, write"], answer: "measure, mix, bake", explain: "Ordered sub-tasks." },
        { q: "A benefit of decomposition is…", options: ["parts can be reused", "more bugs", "slower progress", "less understanding"], answer: "parts can be reused", explain: "Reusable chunks." },
      ],
    },
    {
      topic: "Problem-Solving",
      title: "Algorithms",
      difficulty: "beginner",
      minutes: 12,
      points: 80,
      summary: "An algorithm is a step-by-step recipe for solving a problem — precise, ordered and repeatable.",
      blocks: [
        { type: "heading", text: "Recipes for Computers" },
        {
          type: "text",
          text: "An algorithm is a step-by-step set of instructions that solves a problem. Making a sandwich can be an algorithm: get bread, spread butter, add filling, close, cut. Computers need algorithms to be precise and in the right order.\n\nGood algorithms are clear (no vague steps), ordered (steps in the right sequence), and finite (they end). If you swap steps or miss one, the result changes — just like a recipe.",
        },
        {
          type: "example",
          text: "Algorithm to brush teeth: 1) wet brush, 2) add paste, 3) brush each section, 4) rinse, 5) spit. Wrong order (paste before wet?) still works, but swapping 'rinse' and 'spit' would be messy.",
        },
        {
          type: "keyPoints",
          items: [
            "Algorithm = step-by-step recipe.",
            "Steps must be precise and ordered.",
            "Algorithms are finite (they end).",
            "Wrong order → wrong result.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Get two slices of bread" },
            { key: "2", value: "Spread butter on the bread" },
            { key: "3", value: "Add the filling" },
            { key: "4", value: "Close the sandwich and cut" },
          ],
        },
      ],
      questions: [
        { q: "An algorithm is a…", options: ["step-by-step recipe", "computer virus", "type of font", "password"], answer: "step-by-step recipe", explain: "Ordered steps." },
        { q: "Algorithms must be…", options: ["precise and ordered", "random", "very long always", "in binary"], answer: "precise and ordered", explain: "Clear steps." },
        { q: "If you swap steps in an algorithm…", options: ["the result may change", "nothing happens", "it gets faster", "it becomes a virus"], answer: "the result may change", explain: "Order matters." },
        { q: "A good algorithm is finite, meaning…", options: ["it ends", "it never stops", "it has one step", "it has no steps"], answer: "it ends", explain: "Finite steps." },
        { q: "Which is an algorithm?", options: ["Brush teeth: wet, paste, brush, rinse, spit", "'Wash up somehow'", "'Just do it'", "'Whatever'"], answer: "Brush teeth: wet, paste, brush, rinse, spit", explain: "Clear ordered steps." },
      ],
    },
    {
      topic: "Problem-Solving",
      title: "Pattern Recognition",
      difficulty: "beginner",
      minutes: 12,
      points: 80,
      summary: "Spotting patterns (repeated shapes, steps or trends) lets us predict and simplify problems.",
      blocks: [
        { type: "heading", text: "Spot What Repeats" },
        {
          type: "text",
          text: "Pattern recognition means looking for things that repeat or are similar. Once you spot a pattern, you can use one solution many times instead of solving each case from scratch.\n\nProgrammers spot patterns to reuse code; scientists spot patterns to make predictions (sunrise times, weather, disease spread). Recognising a pattern turns many separate problems into one general solution.",
        },
        {
          type: "example",
          text: "Sequence 2, 4, 6, 8… the pattern is '+2 each time'. Spot it and you can predict the next number (10) without re-counting.",
        },
        {
          type: "keyPoints",
          items: [
            "Patterns are things that repeat.",
            "One solution can solve many cases.",
            "Programmers reuse code via patterns.",
            "Patterns help predict.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is the next number: 2, 4, 6, 8, ___?" },
            { key: "option_0", value: "10" },
            { key: "option_1", value: "9" },
            { key: "option_2", value: "16" },
            { key: "option_3", value: "12" },
            { key: "answer", value: "10" },
            { key: "explanation", value: "Pattern: +2 each time." },
          ],
        },
      ],
      questions: [
        { q: "Pattern recognition means…", options: ["spotting things that repeat", "ignoring data", "deleting files", "counting bits"], answer: "spotting things that repeat", explain: "Find the repeat." },
        { q: "Next in 5, 10, 15, 20…?", options: ["25", "30", "22", "15"], answer: "25", explain: "+5 pattern." },
        { q: "Spotting a pattern lets you…", options: ["reuse one solution many times", "skip all work", "ignore the problem", "make it harder"], answer: "reuse one solution many times", explain: "Generalise." },
        { q: "Next in 1, 2, 4, 8…?", options: ["16", "10", "12", "15"], answer: "16", explain: "Doubling pattern." },
        { q: "Programmers use patterns to…", options: ["reuse code", "make bugs", "slow down", "add colour"], answer: "reuse code", explain: "Less repetition." },
      ],
    },
    {
      topic: "Problem-Solving",
      title: "Abstraction",
      difficulty: "beginner",
      minutes: 12,
      points: 80,
      summary: "Abstraction means focusing on what matters and hiding the rest — like a button that 'just works'.",
      blocks: [
        { type: "heading", text: "Hide the Complicated Bits" },
        {
          type: "text",
          text: "Abstraction means focusing on what something does and hiding how it works inside. You don't need to know how a TV works to use the remote — you just press 'on'. The complicated details are hidden behind a simple control.\n\nIn computing, abstraction lets us build big things from simple 'black boxes'. A programmer uses a 'print' command without knowing the printer's wiring. Abstraction keeps complexity manageable.",
        },
        {
          type: "example",
          text: "A car is an abstraction: you turn a key and press pedals. The engine's inner workings are hidden. Imagine if you had to manually spark each cylinder!",
        },
        {
          type: "keyPoints",
          items: [
            "Abstraction hides complex details.",
            "Focus on what it does, not how.",
            "Remotes, buttons and commands are abstractions.",
            "It keeps big systems manageable.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Using a TV remote is an example of…?" },
            { key: "option_0", value: "Abstraction" },
            { key: "option_1", value: "Decomposition" },
            { key: "option_2", value: "Binary" },
            { key: "option_3", value: "Logic" },
            { key: "answer", value: "Abstraction" },
            { key: "explanation", value: "You press buttons without knowing the wiring." },
          ],
        },
      ],
      questions: [
        { q: "Abstraction means…", options: ["hiding complex details", "showing everything", "counting bits", "deleting code"], answer: "hiding complex details", explain: "Focus on what it does." },
        { q: "Which is an abstraction?", options: ["A remote control", "A raw circuit board", "A wiring diagram", "A list of transistors"], answer: "A remote control", explain: "Simple buttons hide complexity." },
        { q: "Why is abstraction useful?", options: ["Keeps big systems manageable", "Adds more bugs", "Slows everything", "No reason"], answer: "Keeps big systems manageable", explain: "Hide complexity." },
        { q: "A programmer using 'print' without knowing the wiring is…", options: ["using abstraction", "making an error", "wasting time", "counting"], answer: "using abstraction", explain: "Hidden details." },
        { q: "Abstraction focuses on…", options: ["what something does", "every inner detail", "the colour only", "the price"], answer: "what something does", explain: "Not how it works." },
      ],
    },

    // ===================== SAFE AI USE (4) =====================
    {
      topic: "Safe AI Use",
      title: "Hallucinations (AI Can Be Wrong)",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "AI can confidently state false information (called a hallucination). Always check important facts yourself.",
      blocks: [
        { type: "heading", text: "Confident but Wrong" },
        {
          type: "text",
          text: "AI is powerful, but it can be wrong. Sometimes it makes up facts that sound completely real — a fake date, a made-up book, a wrong answer — spoken with total confidence. These are called hallucinations.\n\nBecause AI sounds so sure, it's easy to trust false information. The rule: never trust an AI fact without checking, especially for school, health or news. Use a second reliable source. Treat AI as a helpful draft, not the final truth.",
        },
        {
          type: "example",
          text: "Ask an AI 'who won the 2030 World Cup?' It might invent a confident answer — but the 2030 World Cup hasn't happened. Hallucination.",
        },
        {
          type: "keyPoints",
          items: [
            "AI can sound sure but be wrong.",
            "Made-up facts are 'hallucinations'.",
            "Check important facts yourself.",
            "AI is a draft, not the final truth.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is an AI 'hallucination'?" },
            { key: "option_0", value: "A made-up fact that sounds real" },
            { key: "option_1", value: "A type of computer virus" },
            { key: "option_2", value: "A loud noise" },
            { key: "option_3", value: "A screen saver" },
            { key: "answer", value: "A made-up fact that sounds real" },
            { key: "explanation", value: "AI can invent false information." },
          ],
        },
      ],
      questions: [
        { q: "When AI invents a false fact, it's called a…", options: ["hallucination", "byte", "prompt", "shortcut"], answer: "hallucination", explain: "Confident but wrong." },
        { q: "Before trusting an important AI fact, you should…", options: ["check it yourself", "share it everywhere", "delete it", "ignore it"], answer: "check it yourself", explain: "Verify with a source." },
        { q: "AI sounds confident, so…", options: ["it can still be wrong", "it's always right", "it never lies", "it has no data"], answer: "it can still be wrong", explain: "Confidence ≠ truth." },
        { q: "Best use of AI text?", options: ["As a helpful draft to verify", "As the final truth", "To replace all books", "To skip thinking"], answer: "As a helpful draft to verify", explain: "Then check." },
        { q: "Which is most likely a hallucination?", options: ["AI gives a confident answer about a future event", "AI adds two numbers", "AI repeats a famous quote", "AI counts words"], answer: "AI gives a confident answer about a future event", explain: "Can't know the future." },
      ],
    },
    {
      topic: "Safe AI Use",
      title: "Privacy & Your Data",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Never share private information with an AI — names, addresses, passwords or photos. Treat it like a stranger.",
      blocks: [
        { type: "heading", text: "Keep Secrets Secret" },
        {
          type: "text",
          text: "Never share private information with an AI: full names, addresses, phone numbers, passwords, photos or family details. What you type may be stored and reviewed, and could leak.\n\nTreat the AI like a stranger in the street. You wouldn't tell a stranger your address — so don't tell an AI. Use first names only, share no school or home details, and never put someone else's secrets in either.",
        },
        {
          type: "example",
          text: "Bad: 'My address is 12 Elm St and my password is cat123.' Good: 'Help me write a story about a cat.' No personal data needed.",
        },
        {
          type: "keyPoints",
          items: [
            "Never share private info with AI.",
            "No names, addresses, passwords, photos.",
            "Treat AI like a stranger.",
            "Don't share other people's secrets.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is SAFE to share with an AI?" },
            { key: "option_0", value: "'Help me write a poem about space.'" },
            { key: "option_1", value: "'My home address is…'" },
            { key: "option_2", value: "'My password is…'" },
            { key: "option_3", value: "'My full name and school are…'" },
            { key: "answer", value: "'Help me write a poem about space.'" },
            { key: "explanation", value: "No personal data needed." },
          ],
        },
      ],
      questions: [
        { q: "What should you NEVER share with an AI?", options: ["Private info like passwords and address", "Your favourite colour", "A topic for a story", "A maths question"], answer: "Private info like passwords and address", explain: "Keep secrets safe." },
        { q: "Treat the AI like…", options: ["a stranger", "your parents", "a teacher you trust fully", "a bank vault"], answer: "a stranger", explain: "Be cautious." },
        { q: "Why avoid personal data with AI?", options: ["It may be stored or leak", "It's illegal to type", "AI can't read it", "No reason"], answer: "It may be stored or leak", explain: "Privacy risk." },
        { q: "Which is OK to share?", options: ["'Explain how rainbows work'", "'My phone number is…'", "'My sister's secret is…'", "'My address is…'"], answer: "'Explain how rainbows work'", explain: "No personal info." },
        { q: "If unsure whether to share something, you should…", options: ["not share it", "share it anyway", "share more", "share it twice"], answer: "not share it", explain: "When in doubt, leave it out." },
      ],
    },
    {
      topic: "Safe AI Use",
      title: "Bias in AI",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "AI learns from human data, so it can copy human biases. Watch for unfair or one-sided answers.",
      blocks: [
        { type: "heading", text: "Not Always Fair" },
        {
          type: "text",
          text: "AI learns from huge amounts of data created by humans. If that data carries bias — unfair views about groups of people — the AI can copy and even amplify that bias. So AI answers can sometimes be unfair, stereotyped or one-sided.\n\nWatch for bias: does an answer stereotype a group? Does it ignore some viewpoints? Always think critically. If an answer seems unfair, check other sources and question it.",
        },
        {
          type: "example",
          text: "If an AI is trained mostly on writing about male scientists, it might wrongly suggest only men do science — a biased result from biased data.",
        },
        {
          type: "keyPoints",
          items: [
            "AI learns from human data.",
            "Human data can carry bias.",
            "AI can copy/amplify unfair views.",
            "Think critically about answers.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why might AI give biased answers?" },
            { key: "option_0", value: "It learns from human data, which can carry bias" },
            { key: "option_1", value: "It hates people" },
            { key: "option_2", value: "It's a virus" },
            { key: "option_3", value: "It never does" },
            { key: "answer", value: "It learns from human data, which can carry bias" },
            { key: "explanation", value: "Bias in → bias out." },
          ],
        },
      ],
      questions: [
        { q: "Where does AI bias usually come from?", options: ["Human data it learned from", "The computer's colour", "The keyboard", "The screen size"], answer: "Human data it learned from", explain: "Bias in, bias out." },
        { q: "If an AI answer seems unfair, you should…", options: ["question it and check other sources", "trust it fully", "share it everywhere", "delete the AI"], answer: "question it and check other sources", explain: "Think critically." },
        { q: "AI can amplify bias by…", options: ["copying unfair patterns in data", "being a virus", "ignoring all data", "turning off"], answer: "copying unfair patterns in data", explain: "It learns patterns." },
        { q: "A biased answer might…", options: ["stereotype a group", "be perfectly fair always", "have no data", "be a virus"], answer: "stereotype a group", explain: "Unfair generalisation." },
        { q: "Good habit with AI answers?", options: ["Think critically about fairness", "Always agree", "Never read them", "Share without looking"], answer: "Think critically about fairness", explain: "Stay alert to bias." },
      ],
    },
    {
      topic: "Safe AI Use",
      title: "Using AI Honestly",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Use AI as a helper that you understand — not as work to copy. Be honest when AI helped.",
      blocks: [
        { type: "heading", text: "Honesty Matters" },
        {
          type: "text",
          text: "AI is a brilliant helper, but using it to do your work for you — and pretending it's your own — is dishonest and stops you learning. The point of schoolwork is to grow your brain, not to hand in someone (or something) else's thinking.\n\nGood rules: use AI to brainstorm and explain, but write things yourself; always understand what you submit; be honest when AI helped (like citing a book). Treat AI as a coach, not a replacement for your own effort.",
        },
        {
          type: "example",
          text: "Good: 'Explain fractions so I understand, then I'll do the problems myself.' Bad: 'Do my fractions homework and I'll copy it.'",
        },
        {
          type: "keyPoints",
          items: [
            "Use AI to help, not to cheat.",
            "Understand everything you submit.",
            "Write your own work.",
            "Be honest when AI helped.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is the HONEST way to use AI for homework?" },
            { key: "option_0", value: "'Explain it so I can do the work myself.'" },
            { key: "option_1", value: "'Do my homework and I'll copy it.'" },
            { key: "option_2", value: "'Write my essay and I'll say it's mine.'" },
            { key: "option_3", value: "'Give me the answers to copy.'" },
            { key: "answer", value: "'Explain it so I can do the work myself.'" },
            { key: "explanation", value: "AI as a coach, not a cheat." },
          ],
        },
      ],
      questions: [
        { q: "Best way to use AI for schoolwork?", options: ["As a coach to help you learn", "To copy answers", "To skip thinking", "To replace your brain"], answer: "As a coach to help you learn", explain: "Grow your brain." },
        { q: "Copying AI work as your own is…", options: ["dishonest", "fine", "required", "faster learning"], answer: "dishonest", explain: "It's not your work." },
        { q: "Before submitting AI-helped work, you should…", options: ["understand it fully", "delete your notes", "ignore it", "share it everywhere"], answer: "understand it fully", explain: "Own your work." },
        { q: "AI should be treated as a…", options: ["helper, not a replacement", "teacher you must obey", "virus", "password"], answer: "helper, not a replacement", explain: "You still think." },
        { q: "When AI helps with a project, you should…", options: ["be honest about it", "hide it", "lie", "delete it"], answer: "be honest about it", explain: "Like citing a source." },
      ],
    },

    // ===================== CODING BASICS (2 activity labs) =====================
    {
      topic: "Coding Basics",
      title: "Activity: Your First JavaScript",
      difficulty: "beginner",
      minutes: 12,
      points: 90,
      summary: "Write and run real JavaScript. Use variables and console.log to make the computer print messages.",
      kind: "activity",
      blocks: [
        { type: "heading", text: "Talking to the Computer" },
        {
          type: "text",
          text: "JavaScript is a real programming language used to build websites and games. Today you will write some and RUN it.\n\nTwo key ideas: a VARIABLE stores information (like a labelled box), and console.log(...) prints something to the screen. We make a variable with 'let', for example: let name = \"Hudson\";",
        },
        {
          type: "example",
          text: "let age = 11;\nconsole.log(\"I am \" + age + \" years old\");\n→ prints: I am 11 years old",
        },
        {
          type: "keyPoints",
          items: [
            "A variable stores a value: let score = 10;",
            "console.log(...) prints to the console.",
            "Text (strings) go in quotes; numbers don't.",
            "Use + to join text together.",
          ],
        },
        code({
          language: "javascript",
          instructions: "Read the code, then press Run. Change the name and number, then Run again to see what happens.",
          starter:
            'let name = "Hudson";\nlet level = 12;\nconsole.log("Hello, " + name + "!");\nconsole.log("You are level " + level);',
          challenge: "Make the console print a line that says: Next level is 13",
          expected: "Next level is 13",
        }),
      ],
      questions: [
        { q: "What does console.log do?", options: ["Prints to the console", "Deletes a file", "Saves the game", "Adds numbers only"], answer: "Prints to the console", explain: "It outputs a message." },
        { q: "Which keyword makes a variable?", options: ["let", "print", "show", "make"], answer: "let", explain: "e.g. let score = 10;" },
        { q: "How do you write text in code?", options: ["In quotes", "In brackets only", "In capitals", "With a #"], answer: "In quotes", explain: 'Strings use "quotes".' },
        { q: "A variable is like a…", options: ["labelled box that stores a value", "picture", "sound", "colour"], answer: "labelled box that stores a value", explain: "It holds information." },
        { q: "What joins two pieces of text?", options: ["+", "-", "*", "/"], answer: "+", explain: 'e.g. "a" + "b" → "ab".' },
      ],
    },
    {
      topic: "Coding Basics",
      title: "Activity: Conditions & Decisions",
      difficulty: "intermediate",
      minutes: 13,
      points: 100,
      summary: "Use if/else so your program can make decisions, just like a real game checking the rules.",
      kind: "activity",
      blocks: [
        { type: "heading", text: "Making the Computer Decide" },
        {
          type: "text",
          text: "Programs make decisions using 'if'. An if statement checks whether something is true, and only runs its code when it is. You can add 'else' for what happens otherwise.\n\nWe compare things with operators: > (greater than), < (less than), and === (equal to). For example: if (score > 100) { ... }.",
        },
        {
          type: "example",
          text: 'let score = 80;\nif (score >= 70) {\n  console.log("You passed!");\n} else {\n  console.log("Try again");\n}\n→ prints: You passed!',
        },
        {
          type: "keyPoints",
          items: [
            "if (condition) { ... } runs code only when true.",
            "else { ... } runs when the condition is false.",
            "Compare with >, <, and === (equal).",
            "Decisions are the rules of every game.",
          ],
        },
        code({
          language: "javascript",
          instructions: "Run the code. Then change the value of 'score' and Run again to see a different message.",
          starter:
            'let score = 45;\nif (score >= 50) {\n  console.log("Level complete!");\n} else {\n  console.log("Keep practising");\n}',
          challenge: "Change score so the console prints: Level complete!",
          expected: "Level complete!",
        }),
      ],
      questions: [
        { q: "An 'if' statement runs its code when the condition is…", options: ["true", "false", "empty", "a number"], answer: "true", explain: "Only true conditions run the block." },
        { q: "What runs when the condition is false?", options: ["the else block", "the if block", "nothing ever", "the title"], answer: "the else block", explain: "else handles the other case." },
        { q: "Which means 'greater than or equal to'?", options: [">=", "=>", "><", "=<"], answer: ">=", explain: "score >= 50." },
        { q: "=== is used to check if two things are…", options: ["equal", "different", "added", "bigger"], answer: "equal", explain: "Strict equality." },
        { q: "Decisions in code are important because they…", options: ["let programs follow rules", "make code longer", "slow the computer", "do nothing"], answer: "let programs follow rules", explain: "Games rely on conditions." },
      ],
    },
  ],
};

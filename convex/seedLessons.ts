import { mutation } from "./_generated/server";

/**
 * One-off seed: real text lessons + quizzes for every topic across all 8
 * subjects, so the student can start learning immediately. Idempotent — skips
 * any lesson whose title already exists under a subject. Run once:
 *   npx convex run seedLessons:seedLessons
 *
 * Videos are left empty (marked "coming soon" on the lesson page) so the parent
 * can paste a vetted YouTube URL per lesson; the text lesson + quiz are ready.
 */
export const seedLessons = mutation({
  args: {},
  handler: async (ctx) => {
    let createdLessons = 0;
    let createdQuestions = 0;

    for (const subjectBlock of CURRICULUM) {
      const subject = await ctx.db
        .query("subjects")
        .withIndex("by_slug", (q) => q.eq("slug", subjectBlock.slug))
        .unique();
      if (!subject) continue;

      // Existing lesson titles under this subject (idempotency).
      const existing = await ctx.db
        .query("lessons")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .take(200);
      const have = new Set(existing.map((l) => l.title));

      // Topic name → id map for this subject.
      const topics = await ctx.db
        .query("topics")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .take(100);
      const topicById = new Map(topics.map((t) => [t.name, t._id]));

      for (const entry of subjectBlock.lessons) {
        const topicId = topicById.get(entry.topic);
        if (!topicId || have.has(entry.lesson.title)) continue;
        const now = Date.now();
        const lessonId = await ctx.db.insert("lessons", {
          subjectId: subject._id,
          topicId,
          title: entry.lesson.title,
          slug: `${subjectBlock.slug}-${entry.lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          description: entry.lesson.notes.slice(0, 140),
          lessonNotes: entry.lesson.notes,
          videoUrl: "",
          videoProvider: "youtube",
          difficultyLevel: entry.lesson.difficulty,
          estimatedMinutes: 10,
          pointsAwarded: entry.lesson.points,
          status: "published",
          createdAt: now,
          updatedAt: now,
        });
        createdLessons += 1;

        if (entry.lesson.questions.length > 0) {
          const quizId = await ctx.db.insert("quizzes", {
            lessonId,
            subjectId: subject._id,
            topicId,
            title: `${entry.lesson.title} — Quiz`,
            type: "lesson",
            difficultyLevel: entry.lesson.difficulty,
            pointsAwarded: entry.lesson.points,
          });
          for (let qi = 0; qi < entry.lesson.questions.length; qi++) {
            const q = entry.lesson.questions[qi];
            await ctx.db.insert("quizQuestions", {
              quizId,
              questionText: q.q,
              questionType: "mcq",
              options: q.options,
              correctAnswer: q.answer,
              explanation: q.explain,
              difficultyLevel: entry.lesson.difficulty,
              order: qi,
            });
            createdQuestions += 1;
          }
        }
        have.add(entry.lesson.title);
      }
    }

    return { createdLessons, createdQuestions };
  },
});

type Q = { q: string; options: string[]; answer: string; explain: string };
type Lesson = {
  topic: string;
  lesson: {
    title: string;
    notes: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    points: number;
    questions: Q[];
  };
};
type Block = { slug: string; lessons: Lesson[] };

const CURRICULUM: Block[] = [
  {
    slug: "maths",
    lessons: [
      {
        topic: "Fractions",
        lesson: {
          title: "What Is a Fraction?",
          notes:
            "A fraction describes part of a whole. It has two numbers: the top number is the numerator (how many parts you have), and the bottom number is the denominator (how many equal parts the whole is split into).\n\nIf a pizza is cut into 8 equal slices and you eat 3, you have eaten 3/8 of the pizza. The bigger the denominator, the smaller each piece — 1/8 is smaller than 1/4.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "In the fraction 3/8, what is the denominator?", options: ["3", "8", "11", "24"], answer: "8", explain: "The bottom number (8) is the denominator — the number of equal parts the whole is split into." },
            { q: "Which is the larger piece: 1/4 or 1/8?", options: ["1/8", "1/4", "They are equal", "You cannot tell"], answer: "1/4", explain: "With a smaller denominator, each piece is larger, so 1/4 is bigger than 1/8." },
          ],
        },
      },
      {
        topic: "Ratios",
        lesson: {
          title: "Ratios in Real Life",
          notes:
            "A ratio compares two quantities. If a recipe uses 2 cups of flour for every 1 cup of sugar, the ratio of flour to sugar is 2:1.\n\nRatios stay the same when you multiply both numbers by the same amount. 2:1 is the same as 4:2 or 10:5 — the mixture keeps the same balance.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "A ratio of 3:2 means for every 3 of the first thing there are…", options: ["3 of the second", "2 of the second", "5 of the second", "1 of the second"], answer: "2 of the second", explain: "The second number tells you how many of the second thing go with each group of the first." },
            { q: "Which ratio is equal to 2:3?", options: ["4:6", "2:5", "3:2", "6:4"], answer: "4:6", explain: "Multiplying both parts by 2 gives 4:6, the same balance as 2:3." },
          ],
        },
      },
      {
        topic: "Basic Algebra",
        lesson: {
          title: "Letters Are Just Numbers",
          notes:
            "In algebra we use letters to stand for unknown numbers. If x + 5 = 12, we can find x by asking: what number plus 5 equals 12? The answer is 7, so x = 7.\n\nThe rule is simple: whatever you do to one side of the equals sign, do to the other. To solve x + 5 = 12, subtract 5 from both sides to get x on its own.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "Solve: x + 4 = 10", options: ["x = 4", "x = 6", "x = 10", "x = 14"], answer: "x = 6", explain: "Subtract 4 from both sides: 10 − 4 = 6, so x = 6." },
            { q: "If 2y = 14, what is y?", options: ["6", "7", "12", "28"], answer: "7", explain: "Divide both sides by 2: 14 ÷ 2 = 7, so y = 7." },
          ],
        },
      },
      {
        topic: "Problem Solving",
        lesson: {
          title: "Breaking Problems Into Steps",
          notes:
            "Hard word problems get easier when you break them into steps. First, read carefully and underline what you need to find. Next, note the numbers and facts. Then decide on the operation — add, subtract, multiply or divide.\n\nFinally, check your answer by asking: does this make sense? If a question asks for the number of children on a bus and you get 250, something went wrong.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "A bus has 30 seats and 18 children are on it. How many seats are empty?", options: ["12", "18", "30", "48"], answer: "12", explain: "Empty seats = total − children = 30 − 18 = 12." },
            { q: "Which step should you do FIRST in a word problem?", options: ["Guess the answer", "Read and find what you must work out", "Add all the numbers", "Write a story"], answer: "Read and find what you must work out", explain: "Understanding the question first stops you using the wrong numbers or operation." },
          ],
        },
      },
    ],
  },
  {
    slug: "english",
    lessons: [
      {
        topic: "Grammar",
        lesson: {
          title: "Nouns, Verbs and Adjectives",
          notes:
            "Every sentence is built from word types. A noun names a person, place or thing (dog, London, book). A verb is an action or being word (run, is, jumped). An adjective describes a noun (red, tall, silly).\n\nTo find the verb, ask what is happening. To find the noun, ask who or what. Adjectives usually sit just before the noun they describe.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "Which word is the verb? 'The clever fox jumped the fence.'", options: ["clever", "fox", "jumped", "fence"], answer: "jumped", explain: "'Jumped' is the action, so it is the verb." },
            { q: "Which word is an adjective? 'a tall green tree'", options: ["a", "tree", "tall", "there is none"], answer: "tall", explain: "'Tall' (and 'green') describe the noun 'tree', so they are adjectives." },
          ],
        },
      },
      {
        topic: "Sentence Structure",
        lesson: {
          title: "Subjects and Predicates",
          notes:
            "Every sentence has two main parts. The subject is who or what the sentence is about. The predicate is what is said about the subject, and it always contains the main verb.\n\nIn 'The puppy chased its tail', 'The puppy' is the subject and 'chased its tail' is the predicate. Sentences read better when the subject is clear and the predicate is not too long.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "In 'The car stopped suddenly', what is the subject?", options: ["stopped", "suddenly", "The car", "the"], answer: "The car", explain: "The subject is what the sentence is about — here, 'The car'." },
            { q: "Which part always contains the main verb?", options: ["Subject", "Predicate", "Adjective", "Title"], answer: "Predicate", explain: "The predicate tells us what the subject does or is, so it holds the main verb." },
          ],
        },
      },
      {
        topic: "Reading Comprehension",
        lesson: {
          title: "Finding the Main Idea",
          notes:
            "The main idea is what a paragraph is mostly about. To find it, ask: what one thing is the writer trying to tell me here? The other sentences give details or evidence that support it.\n\nLook for clue words. 'The most important reason…' or 'Overall…' often signal the main idea. If you can sum up the paragraph in one sentence, you have found it.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "The main idea of a paragraph is…", options: ["the first word", "what it is mostly about", "the longest sentence", "the title of the book"], answer: "what it is mostly about", explain: "The main idea is the central point; other sentences support it." },
            { q: "Which clue often signals the main idea?", options: ["'and'", "'The most important reason…'", "'the'", "'a'"], answer: "'The most important reason…'", explain: "Phrases like this usually introduce the central point." },
          ],
        },
      },
      {
        topic: "Vocabulary",
        lesson: {
          title: "Using Context Clues",
          notes:
            "When you meet a new word, the sentence around it often explains it. These are context clues. Look for a definition nearby, a synonym (word that means the same), or an example.\n\nIf you read 'the slug was torpid, barely moving at all', the words 'barely moving' tell you torpid means slow or sleepy. Good readers use context before reaching for a dictionary.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "'The ship was immense, the biggest ever built.' What does immense mean?", options: ["tiny", "huge", "sinking", "old"], answer: "huge", explain: "'The biggest ever built' is the context clue — immense means very large." },
            { q: "Context clues are found…", options: ["in a dictionary only", "in the sentence around the word", "at the end of the book", "nowhere"], answer: "in the sentence around the word", explain: "The surrounding words give hints to the meaning." },
          ],
        },
      },
      {
        topic: "Writing",
        lesson: {
          title: "Planning Before You Write",
          notes:
            "Good writing starts with a plan. Jot down your main idea, then list three points that support it. Each point becomes a short paragraph with a topic sentence first.\n\nPlanning stops you from repeating yourself and keeps your reader interested. A clear beginning, middle and end is easier to write — and easier to read — than a jumble of thoughts.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "What should you do first when writing?", options: ["Write the ending", "Plan your main idea and points", "Count the words", "Draw a picture"], answer: "Plan your main idea and points", explain: "A plan gives your writing a clear structure before you start." },
            { q: "A topic sentence usually goes…", options: ["at the start of a paragraph", "at the very end of the piece", "in the title", "nowhere"], answer: "at the start of a paragraph", explain: "The first sentence introduces what the paragraph is about." },
          ],
        },
      },
    ],
  },
  {
    slug: "science",
    lessons: [
      {
        topic: "Human Body",
        lesson: {
          title: "How the Heart Pumps Blood",
          notes:
            "Your heart is a muscle about the size of your fist. It pumps blood around your body through tubes called blood vessels. Blood carries oxygen and food to every cell and carries waste away.\n\nThe heart has two sides. The right side sends blood to the lungs to collect oxygen; the left side pumps that oxygen-rich blood to the rest of you. It beats about 100,000 times a day without you ever thinking about it.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "What does blood carry to your cells?", options: ["Only water", "Oxygen and food", "Nothing", "Bones"], answer: "Oxygen and food", explain: "Blood delivers oxygen and nutrients to cells and removes waste." },
            { q: "Where does blood go to collect oxygen?", options: ["The stomach", "The lungs", "The brain", "The feet"], answer: "The lungs", explain: "The right side of the heart pumps blood to the lungs to pick up oxygen." },
          ],
        },
      },
      {
        topic: "Electricity",
        lesson: {
          title: "Building a Simple Circuit",
          notes:
            "Electricity only flows around a complete loop called a circuit. A simple circuit needs a power source (like a battery), wires to carry the current, and something that uses the power (like a bulb).\n\nIf there is a gap anywhere in the loop, the current stops and the bulb goes out. A switch works by opening and closing that gap — off means the loop is broken, on means it is complete.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "What is needed for current to flow?", options: ["A complete circuit", "A bright bulb", "Two switches", "Sunlight"], answer: "A complete circuit", explain: "Electricity needs an unbroken loop to flow around." },
            { q: "A switch in the 'off' position…", options: ["makes the bulb brighter", "breaks the circuit", "saves battery power only", "does nothing"], answer: "breaks the circuit", explain: "Off opens a gap in the loop, so current cannot flow." },
          ],
        },
      },
      {
        topic: "States of Matter",
        lesson: {
          title: "Solids, Liquids and Gases",
          notes:
            "Everything is made of tiny particles. How those particles are arranged gives us the three states of matter. In a solid, particles are packed tightly in a fixed shape. In a liquid, they are close but can move, so a liquid takes the shape of its container. In a gas, particles zoom around and fill any space.\n\nHeating something gives the particles energy. Ice (solid) warms into water (liquid), which boils into steam (gas). Cooling reverses the journey.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "Which state has a fixed shape?", options: ["Solid", "Liquid", "Gas", "All of them"], answer: "Solid", explain: "Solid particles are locked in place, so a solid keeps its own shape." },
            { q: "What happens when you heat a liquid enough?", options: ["It freezes", "It turns into a gas", "It becomes a solid", "Nothing"], answer: "It turns into a gas", explain: "Heat gives particles enough energy to fly apart as a gas (boiling)." },
          ],
        },
      },
      {
        topic: "Forces",
        lesson: {
          title: "Push, Pull and Friction",
          notes:
            "A force is a push or a pull. Forces can make things start moving, stop, speed up, slow down or change shape. We measure force in units called newtons.\n\nFriction is a force that tries to stop things sliding past each other. Rough surfaces create more friction (good for grippy shoes), smooth surfaces create less (good for ice skating). Without friction, walking would be impossible.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "Force is measured in…", options: ["litres", "newtons", "degrees", "seconds"], answer: "newtons", explain: "The unit of force is the newton (N)." },
            { q: "Friction is a force that…", options: ["speeds things up", "opposes sliding", "creates light", "does not exist on Earth"], answer: "opposes sliding", explain: "Friction acts against surfaces sliding over each other." },
          ],
        },
      },
    ],
  },
  {
    slug: "history",
    lessons: [
      {
        topic: "World War I",
        lesson: {
          title: "The Great War Begins",
          notes:
            "World War I began in 1914 after the assassination of Archduke Franz Ferdinand in Sarajevo. Alliances pulled country after country into the fight until much of the world was at war.\n\nIt was fought in a new, terrible way: trenches. Soldiers on the Western Front lived in long muddy ditches facing each other for years. The war ended in 1918, and its harsh peace helped set the stage for World War II.",
          difficulty: "intermediate",
          points: 90,
          questions: [
            { q: "World War I began in which year?", options: ["1905", "1914", "1939", "1945"], answer: "1914", explain: "The war started in 1914 after the assassination in Sarajevo." },
            { q: "What were the long muddy ditches soldiers fought from called?", options: ["Bunkers", "Trenches", "Castles", "Foxholes only"], answer: "Trenches", explain: "Trench warfare defined the Western Front of WWI." },
          ],
        },
      },
      {
        topic: "World War II",
        lesson: {
          title: "A World at War Again",
          notes:
            "World War II lasted from 1939 to 1945 and involved more countries and people than any war before. It began when Germany invaded Poland, and Britain and France declared war in response.\n\nIt was fought across the globe — in Europe, North Africa, the Pacific and more — and ended after Germany surrendered in 1945. It is a serious subject: millions of civilians suffered, and we study it partly to remember them and to try to prevent such things happening again.",
          difficulty: "intermediate",
          points: 90,
          questions: [
            { q: "Which event is closest to the START of World War II?", options: ["Germany invaded Poland (1939)", "The Moon landing", "The Great Fire of London", "The Romans leaving Britain"], answer: "Germany invaded Poland (1939)", explain: "Germany's invasion of Poland in 1939 triggered Britain and France to declare war." },
            { q: "Why do we study WWII carefully and respectfully?", options: ["Because it was fun", "To remember those who suffered and avoid repeating it", "To learn new weapons", "We do not study it"], answer: "To remember those who suffered and avoid repeating it", explain: "Millions suffered; studying it helps us remember and work for peace." },
          ],
        },
      },
      {
        topic: "American Founding & Revolution",
        lesson: {
          title: "Why the Colonies Rebelled",
          notes:
            "In the 1700s, 13 British colonies in North America were taxed by Britain but had no say in British laws. The cry 'no taxation without representation' captured their anger.\n\nIn 1776 they declared independence, stating that all people are created equal with rights to life, liberty and the pursuit of happiness. After a long war, Britain recognised the United States as a new nation in 1783.",
          difficulty: "intermediate",
          points: 90,
          questions: [
            { q: "What did the colonists mean by 'no taxation without representation'?", options: ["They wanted to pay more tax", "They wanted a say in laws that taxed them", "They hated all laws", "They wanted Britain to rule more"], answer: "They wanted a say in laws that taxed them", explain: "They believed taxes were only fair if they had elected representatives voting on them." },
            { q: "In what year did the colonies declare independence?", options: ["1492", "1776", "1812", "1865"], answer: "1776", explain: "The Declaration of Independence was made in 1776." },
          ],
        },
      },
      {
        topic: "War of 1812",
        lesson: {
          title: "The War of 1812",
          notes:
            "The War of 1812 was fought between the United States and Britain (and its allies). Causes included British restrictions on American trade and the forcing of American sailors into the British navy.\n\nFamous moments include the burning of Washington and the battle that inspired 'The Star-Spangled Banner'. Neither side won clear victory, and the peace mostly returned things to how they had been before.",
          difficulty: "advanced",
          points: 100,
          questions: [
            { q: "The War of 1812 was mainly between which two?", options: ["USA and Britain", "France and Spain", "Mexico and Brazil", "Japan and China"], answer: "USA and Britain", explain: "It was chiefly fought between the United States and Great Britain." },
            { q: "Which national anthem was inspired by a battle in this war?", options: ["The US 'Star-Spangled Banner'", "'O Canada'", "'God Save the King'", "'La Marseillaise'"], answer: "The US 'Star-Spangled Banner'", explain: "Francis Scott Key wrote it after seeing Fort McHenry's flag survive." },
          ],
        },
      },
      {
        topic: "American Civil War",
        lesson: {
          title: "A Nation Divided",
          notes:
            "The American Civil War (1861–1865) was fought between the northern states (the Union) and the southern states (the Confederacy). A central issue was slavery — the southern states depended on it, while growing numbers in the north opposed it.\n\nPresident Abraham Lincoln led the Union through the war and issued the Emancipation Proclamation, which moved toward ending slavery. The Union's victory kept the nation united and slavery was finally abolished.",
          difficulty: "advanced",
          points: 100,
          questions: [
            { q: "Who was US President during most of the Civil War?", options: ["George Washington", "Abraham Lincoln", "John F. Kennedy", "Theodore Roosevelt"], answer: "Abraham Lincoln", explain: "Lincoln led the Union from 1861 until his death in 1865." },
            { q: "What did the Emancipation Proclamation move toward?", options: ["Starting slavery", "Ending slavery", "Higher taxes", "A new flag"], answer: "Ending slavery", explain: "It declared enslaved people in Confederate states to be free, a major step toward abolition." },
          ],
        },
      },
    ],
  },
  {
    slug: "ai-and-computer-science",
    lessons: [
      {
        topic: "Prompts",
        lesson: {
          title: "Writing Great AI Prompts",
          notes:
            "A prompt is the instruction you give an AI. The clearer and more specific you are, the better the answer. A vague prompt like 'write a story' gives a random result; a clear one like 'write a 100-word bedtime story about a brave mouse, for a 6-year-old' gives something useful.\n\nGood prompts include the role, the task, the audience and any rules. Treat the AI a bit like a helpful stranger who knows nothing about you — explain what you want.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "Which is the better prompt?", options: ["'write something'", "'write a 100-word bedtime story about a brave mouse'", "'story'", "'do it'"], answer: "'write a 100-word bedtime story about a brave mouse'", explain: "Specific task, length and topic give the AI what it needs to help." },
            { q: "A good prompt usually includes…", options: ["only one word", "task, audience and rules", "no instructions", "rude language"], answer: "task, audience and rules", explain: "Clarity about what you want and for whom produces better results." },
          ],
        },
      },
      {
        topic: "Logic",
        lesson: {
          title: "True or False Thinking",
          notes:
            "Logic is the study of correct reasoning. A statement is either true or false — 'the sky is blue' is true (usually), 'pigs can fly' is false. We can join statements with words like AND, OR and NOT.\n\n'Cold AND wet' is only true if both are true. 'Cold OR wet' is true if at least one is. Computers use this exact kind of logic to make decisions in programs.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "A statement in logic is…", options: ["either true or false", "always true", "always false", "a feeling"], answer: "either true or false", explain: "Logical statements have a truth value: true or false." },
            { q: "'Cold AND wet' is true when…", options: ["it is cold only", "it is wet only", "both cold and wet", "either one"], answer: "both cold and wet", explain: "AND needs both parts to be true at the same time." },
          ],
        },
      },
      {
        topic: "Logic Gates",
        lesson: {
          title: "AND, OR and NOT Gates",
          notes:
            "A logic gate is a tiny switch inside a computer that takes true/false inputs and gives one true/false output. An AND gate outputs true only if all inputs are true. An OR gate outputs true if any input is true. A NOT gate flips its input — true becomes false, false becomes true.\n\nMillions of these gates wired together are what let a computer do maths, store memory and run programs.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "An AND gate outputs true when…", options: ["any input is true", "all inputs are true", "no inputs are true", "always"], answer: "all inputs are true", explain: "AND requires every input to be true." },
            { q: "What does a NOT gate do?", options: ["Adds two numbers", "Flips true to false and false to true", "Stops all signals", "Makes things louder"], answer: "Flips true to false and false to true", explain: "A NOT gate inverts its single input." },
          ],
        },
      },
      {
        topic: "Binary",
        lesson: {
          title: "Counting in 1s and 0s",
          notes:
            "Computers store everything using only two digits: 1 and 0. This is called binary. Each 1 or 0 is a bit.\n\nIn our normal (decimal) counting we use ten digits, and each place is worth ten times the one before (1, 10, 100…). In binary each place is worth double (1, 2, 4, 8…). So the binary number 101 equals 4 + 0 + 1 = 5.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "How many digits does binary use?", options: ["Ten", "Two (1 and 0)", "Eight", "One hundred"], answer: "Two (1 and 0)", explain: "Binary is base-2: only 1 and 0." },
            { q: "In binary, what is 101 equal to in normal numbers?", options: ["3", "5", "101", "10"], answer: "5", explain: "Binary 101 = 4 + 0 + 1 = 5." },
          ],
        },
      },
      {
        topic: "Problem-Solving",
        lesson: {
          title: "Algorithms: Recipes for Computers",
          notes:
            "An algorithm is a step-by-step recipe for solving a problem. Making a sandwich can be an algorithm: get bread, spread butter, add filling, close, cut.\n\nComputers need algorithms to be precise and in the right order. If you swap steps or miss one out, the result changes. Good programmers break big problems into small, clear steps.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "An algorithm is…", options: ["a type of computer", "a step-by-step recipe to solve a problem", "a programming language", "a kind of bug"], answer: "a step-by-step recipe to solve a problem", explain: "Algorithms are ordered steps that solve a problem." },
            { q: "Why does order matter in an algorithm?", options: ["It does not", "Computers follow steps in order; wrong order gives wrong results", "It only matters for maths", "Order is random"], answer: "Computers follow steps in order; wrong order gives wrong results", explain: "Computers run steps in sequence, so order changes the outcome." },
          ],
        },
      },
      {
        topic: "Safe AI Use",
        lesson: {
          title: "Using AI Wisely",
          notes:
            "AI is a powerful tool, but it can be wrong. It can make up facts that sound real (called hallucinations), and it has been trained on human data, so it can be biased.\n\nGood rules: never share private information with an AI, always check important facts yourself, and never copy AI work as your own without understanding it. Use AI as a helper that checks its own answers — not as a boss you blindly trust.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "When an AI makes up a fact that sounds real, it's called a…", options: ["hallucination", "shortcut", "byte", "prompt"], answer: "hallucination", explain: "AI can confidently state false information; these are hallucinations." },
            { q: "What should you do before trusting an important AI fact?", options: ["Share it everywhere", "Check it yourself", "Nothing", "Delete it"], answer: "Check it yourself", explain: "Always verify important facts from a reliable source." },
          ],
        },
      },
    ],
  },
  {
    slug: "game-development",
    lessons: [
      {
        topic: "Game Loops",
        lesson: {
          title: "The Heartbeat of a Game",
          notes:
            "Every game runs a loop that repeats many times a second. Each time round, it does three things: read the player's input, update the game world (move characters, check collisions, count score), and draw the picture on screen.\n\nThis loop is why games feel live — the screen is constantly refreshing in response to what you do. A faster loop means smoother play.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "What are the three steps of a game loop, in order?", options: ["Draw, update, input", "Input, update, draw", "Update, draw, input", "Input, draw, update"], answer: "Input, update, draw", explain: "Read input, then update the world, then draw it." },
            { q: "A faster game loop gives…", options: ["choppier play", "smoother play", "no difference", "a lower score"], answer: "smoother play", explain: "More loops per second means smoother animation and response." },
          ],
        },
      },
      {
        topic: "Coordinates",
        lesson: {
          title: "Where Things Are: x and y",
          notes:
            "In a 2D game, every object has a position given by two numbers: x (across) and y (up/down). The point (0, 0) is usually one corner of the screen.\n\nTo move a character right, you add to x. To move it up, you add to (or sometimes subtract from) y. Coordinates let the computer know exactly where to draw everything.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "In a 2D game, a position needs how many numbers?", options: ["One", "Two (x and y)", "Four", "Ten"], answer: "Two (x and y)", explain: "2D positions use x (across) and y (up/down)." },
            { q: "To move a character to the RIGHT, you change…", options: ["y", "x", "its colour", "its name"], answer: "x", explain: "x is the horizontal (left-right) position." },
          ],
        },
      },
      {
        topic: "Game Logic",
        lesson: {
          title: "Rules and If-Statements",
          notes:
            "Game logic is the set of rules that decide what happens. It is built from if-statements: IF the player touches a coin, THEN add 1 to the score. IF the player's health reaches 0, THEN end the game.\n\nBy combining many simple rules, you create the behaviour of a whole game — enemies that chase, doors that open, levels that finish.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "An if-statement in a game is used to…", options: ["draw pictures", "make decisions based on rules", "store the score only", "play music"], answer: "make decisions based on rules", explain: "If-statements check a condition and run code when it is true." },
            { q: "Complex game behaviour comes from…", options: ["one giant rule", "many simple rules combined", "no rules", "random guessing"], answer: "many simple rules combined", explain: "Stacking simple if-statements builds rich behaviour." },
          ],
        },
      },
      {
        topic: "Coding",
        lesson: {
          title: "Variables Remember Things",
          notes:
            "A variable is a labelled box that stores a value the game can remember and change. You might have a variable called 'score' that starts at 0 and goes up when you collect a coin.\n\nVariables can hold numbers (lives = 3), text (playerName = 'Hudson'), or true/false (hasKey = true). They are how a program keeps track of what is happening.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "A variable is best described as…", options: ["a type of screen", "a labelled box that stores a value", "a kind of bug", "a sound effect"], answer: "a labelled box that stores a value", explain: "Variables store values the program can read and change." },
            { q: "Which could a variable store?", options: ["A number", "Text", "True/false", "All of these"], answer: "All of these", explain: "Variables can hold numbers, text and booleans." },
          ],
        },
      },
      {
        topic: "Character Movement",
        lesson: {
          title: "Making a Character Move",
          notes:
            "To move a character, you change its x or y a little bit every frame in the game loop. If the right arrow is pressed, add a small amount to x each loop — the character slides smoothly across.\n\nThe amount you add each frame is the speed. Bigger numbers mean faster movement. Add gravity by increasing the y-velocity a little every frame too.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "Smooth movement happens when you change position…", options: ["once only", "a little bit every frame", "never", "in big jumps"], answer: "a little bit every frame", explain: "Small updates each frame create smooth motion." },
            { q: "The amount you add to position each frame is the…", options: ["colour", "speed", "name", "score"], answer: "speed", explain: "A bigger per-frame change means a faster character." },
          ],
        },
      },
    ],
  },
  {
    slug: "homemaking",
    lessons: [
      {
        topic: "Cooking Basics",
        lesson: {
          title: "Getting Started in the Kitchen",
          notes:
            "Cooking starts with being organised. Read the whole recipe first, get out everything you need, and wash your hands. Measure carefully — especially in baking, where amounts really matter.\n\nKeep your work area tidy and stay with the food while it cooks. The more you cook, the more confident you become, and soon you can start changing recipes to suit your taste.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "What should you do BEFORE you start cooking?", options: ["Turn the heat up high", "Read the recipe and gather equipment", "Leave the room", "Skip washing hands"], answer: "Read the recipe and gather equipment", explain: "Being prepared makes cooking safer and smoother." },
            { q: "Why do measurements matter most in baking?", options: ["They do not matter", "Baking is like a science — amounts change the result", "Only for taste", "Only for colour"], answer: "Baking is like a science — amounts change the result", explain: "Baking relies on exact ratios to rise and set correctly." },
          ],
        },
      },
      {
        topic: "Kitchen Safety",
        lesson: {
          title: "Staying Safe While Cooking",
          notes:
            "The kitchen has heat, sharp things and slippery floors. A few habits keep you safe: turn pan handles inward so they cannot be knocked, use oven gloves for hot trays, and keep knives sharp (a sharp knife is safer because it slips less).\n\nIf grease catches fire, never use water — smother it with a lid. Clean spills straight away so no one slips. Always ask an adult before doing something new or risky.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "If a grease fire starts, you should NEVER use…", options: ["a lid", "water", "a fire blanket", "an adult's help"], answer: "water", explain: "Water makes grease fires spread; smother with a lid instead." },
            { q: "Why is a sharp knife often safer than a blunt one?", options: ["It is not", "It slips less because you press less", "It is hotter", "It is lighter"], answer: "It slips less because you press less", explain: "Blunt knives need more force and are more likely to slip." },
          ],
        },
      },
      {
        topic: "Recipes",
        lesson: {
          title: "Reading a Recipe",
          notes:
            "A recipe tells you what you need (ingredients) and what to do (method), usually with step-by-step instructions. 'Prep' time is how long getting ready takes; 'cook' time is how long the food is on the heat.\n\nRecipes often give the oven temperature and how many people it serves. Once you understand the layout, you can follow any recipe — and then adjust it to make it your own.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "The 'method' part of a recipe tells you…", options: ["what to buy", "what to do, step by step", "the price", "the history"], answer: "what to do, step by step", explain: "The method is the set of instructions to follow." },
            { q: "'Serves 4' means the recipe makes enough for…", options: ["1 person", "4 people", "40 people", "the dog"], answer: "4 people", explain: "'Serves' tells you how many people the quantities will feed." },
          ],
        },
      },
      {
        topic: "Cleaning Routines",
        lesson: {
          title: "Clean a Little, Often",
          notes:
            "The secret to a tidy home is cleaning a little bit often, rather than a huge clean rarely. A simple routine — wipe surfaces daily, sweep floors, do one bigger job each day — keeps mess under control.\n\nAlways put a cleaning product back in its place and never mix chemicals (some combinations give off dangerous fumes). Open a window when using strong cleaners.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "Which keeps mess under control best?", options: ["Cleaning once a year", "Cleaning a little, often", "Never cleaning", "Hiding mess in cupboards"], answer: "Cleaning a little, often", explain: "Small regular cleans stop mess building up." },
            { q: "Why should you never mix cleaning chemicals?", options: ["It is fine", "Some mixes give off dangerous fumes", "It costs money", "It smells nice"], answer: "Some mixes give off dangerous fumes", explain: "Mixing products (like bleach and ammonia) can create toxic gases." },
          ],
        },
      },
      {
        topic: "Appliance Safety",
        lesson: {
          title: "Using Appliances Safely",
          notes:
            "Appliances like ovens, hobs, toasters and microwaves make life easier but must be used carefully. Keep leads and tea towels away from heat, switch things off when you finish, and let hot things cool before touching.\n\nNever put metal in a microwave (it can cause sparks) and always use oven gloves for hot trays. If an appliance looks damaged or smells of burning, switch it off and tell an adult.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "What should NEVER go in a microwave?", options: ["Soup in a bowl", "Metal", "A mug of water", "Bread"], answer: "Metal", explain: "Metal causes sparks and can start a fire in a microwave." },
            { q: "If an appliance smells of burning, you should…", options: ["ignore it", "switch it off and tell an adult", "use it more", "put water on it"], answer: "switch it off and tell an adult", explain: "Switch off and get help — it could be unsafe." },
          ],
        },
      },
    ],
  },
  {
    slug: "building-and-construction",
    lessons: [
      {
        topic: "Blueprints",
        lesson: {
          title: "Reading a Plan",
          notes:
            "A blueprint is a detailed drawing that shows how something should be built. It has views from different angles and exact measurements so a builder can make exactly what the designer planned.\n\nSymbols stand for doors, windows, electrics and more — a bit like a secret code. Learning the common symbols lets you 'read' a plan and picture the finished building.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "A blueprint shows…", options: ["only the colours", "how something should be built, with measurements", "a photograph", "the price only"], answer: "how something should be built, with measurements", explain: "Blueprints are detailed measured plans for builders to follow." },
            { q: "Symbols on a plan are like…", options: ["a secret code for features", "decoration", "mistakes", "signatures"], answer: "a secret code for features", explain: "Symbols stand for doors, windows, electrics and so on." },
          ],
        },
      },
      {
        topic: "Scale",
        lesson: {
          title: "Drawing to Scale",
          notes:
            "Scale means shrinking real sizes by the same amount so a drawing fits on paper but keeps the right proportions. On a 1:50 drawing, 1 cm on the page stands for 50 cm in real life.\n\nScale lets builders check whether things will fit — a door, a sofa, a window — before anything is built. The key is that every part is shrunk by the same ratio.",
          difficulty: "intermediate",
          points: 80,
          questions: [
            { q: "On a 1:50 drawing, 1 cm stands for…", options: ["1 cm real", "50 cm real", "50 m real", "100 cm real"], answer: "50 cm real", explain: "1:50 means 1 unit on paper = 50 of the same units in real life." },
            { q: "Why use scale drawings?", options: ["To check fit before building", "To make things bigger", "For colour", "No reason"], answer: "To check fit before building", explain: "Scaled plans let you verify sizes fit before construction." },
          ],
        },
      },
      {
        topic: "Measuring",
        lesson: {
          title: "Measure Twice, Cut Once",
          notes:
            "'Measure twice, cut once' is the builder's golden rule: check a measurement carefully before cutting, because you cannot undo a cut. Use the right tool — a tape for long distances, a ruler for short ones.\n\nKeep your tool straight and read it at eye level to avoid parallax errors. In building, small mistakes grow, so accuracy at the start saves big problems later.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "'Measure twice, cut once' reminds you to…", options: ["rush", "check measurements before cutting", "never cut", "cut twice"], answer: "check measurements before cutting", explain: "Double-checking prevents costly mistakes." },
            { q: "Reading a tape at an angle can cause a…", options: ["parallax error", "better result", "louder sound", "free tape"], answer: "parallax error", explain: "Viewing from the side shifts the apparent reading." },
          ],
        },
      },
      {
        topic: "Construction Basics",
        lesson: {
          title: "Foundations Hold Everything Up",
          notes:
            "Every building starts with foundations — the strong base that carries its weight into the ground. A weak foundation leads to cracks, leaning and even collapse over time.\n\nFoundations are made wider than the walls above so the weight spreads out. Builders dig down to firm ground before pouring concrete. Get the base right and the rest of the build is far easier.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "Why are foundations made wider than the walls?", options: ["To use more concrete for fun", "To spread the weight", "To look pretty", "By mistake"], answer: "To spread the weight", explain: "A wider base spreads the load into the ground." },
            { q: "A weak foundation can lead to…", options: ["a perfect building", "cracks and leaning", "a cheaper build", "nothing"], answer: "cracks and leaning", explain: "Poor foundations cause structural problems over time." },
          ],
        },
      },
      {
        topic: "Hand-Tool Mechanics",
        lesson: {
          title: "The Right Tool for the Job",
          notes:
            "Each hand tool has a job it does best. A screwdriver turns screws, a hammer drives nails, a spanner tightens nuts, a saw cuts wood. Using the wrong tool damages the work and can be dangerous.\n\nLook after tools: keep blades sharp and clean, store them dry, and check handles are firm. Good tools, used correctly and cared for, last a lifetime.",
          difficulty: "beginner",
          points: 60,
          questions: [
            { q: "Which tool is best for turning a screw?", options: ["Hammer", "Screwdriver", "Saw", "Spanner"], answer: "Screwdriver", explain: "A screwdriver's tip fits the screw head to turn it." },
            { q: "Why should you keep tool blades sharp?", options: ["They look nice", "Sharp tools are safer and work better", "It does not matter", "So they are louder"], answer: "Sharp tools are safer and work better", explain: "Sharp blades cut cleanly and need less force than blunt ones." },
          ],
        },
      },
    ],
  },
];

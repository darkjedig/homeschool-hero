import type { SubjectCurriculum } from "./types";

export const homemaking: SubjectCurriculum = {
  slug: "homemaking",
  lessons: [
    // ===================== COOKING BASICS (4) =====================
    {
      topic: "Cooking Basics",
      title: "Kitchen Setup & Hand Hygiene",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Read the recipe first, gather your equipment, and wash your hands before you start cooking.",
      blocks: [
        { type: "heading", text: "Ready, Set, Cook" },
        {
          type: "text",
          text: "Good cooking starts with being organised. Read the whole recipe first so there are no surprises. Gather everything you need — ingredients and equipment — and set up a tidy workspace. This is called 'mise en place'.\n\nWash your hands with soap for 20 seconds before you start, and after handling raw meat, eggs or rubbish. Tie back long hair, roll up sleeves, and wear an apron to stay clean and safe.",
        },
        {
          type: "example",
          text: "Before cooking pancakes: read the recipe, get flour, eggs, milk, bowl, whisk and pan. Wash hands. NOW you start — calmly, with everything ready.",
        },
        {
          type: "keyPoints",
          items: [
            "Read the whole recipe first.",
            "Gather all ingredients + tools (mise en place).",
            "Wash hands for 20 seconds.",
            "Tie back hair, roll up sleeves.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What should you do BEFORE you start cooking?" },
            { key: "option_0", value: "Read the recipe and gather equipment" },
            { key: "option_1", value: "Turn the heat to maximum" },
            { key: "option_2", value: "Leave the room" },
            { key: "option_3", value: "Skip washing hands" },
            { key: "answer", value: "Read the recipe and gather equipment" },
            { key: "explanation", value: "Be prepared first." },
          ],
        },
      ],
      questions: [
        { q: "First step before cooking?", options: ["Read the recipe and gather equipment", "Turn heat to max", "Leave the room", "Skip washing"], answer: "Read the recipe and gather equipment", explain: "Be prepared." },
        { q: "How long should you wash hands?", options: ["20 seconds", "1 second", "10 minutes", "No need"], answer: "20 seconds", explain: "With soap." },
        { q: "Wash hands again after handling…", options: ["raw meat or eggs", "the recipe", "an apron", "a spoon"], answer: "raw meat or eggs", explain: "Avoid germs." },
        { q: "'Mise en place' means…", options: ["everything in its place (prep first)", "cook fast", "eat now", "clean later"], answer: "everything in its place (prep first)", explain: "Set up before cooking." },
        { q: "Long hair should be…", options: ["tied back", "loose over food", "wet", "cut"], answer: "tied back", explain: "Keep hair out of food." },
      ],
    },
    {
      topic: "Cooking Basics",
      title: "Measuring Ingredients",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Use the right measuring tools and measure precisely — especially in baking, a science of exact ratios.",
      blocks: [
        { type: "heading", text: "Measure Carefully" },
        {
          type: "text",
          text: "Measuring accurately matters — especially in baking, which is like a science. Too much flour and a cake is dry; too little and it collapses. Use dry cups for dry things, a jug for liquids, and spoons for small amounts.\n\nLevel off dry cups with the back of a knife for precision. Read liquid measures at eye level on a flat surface. We follow the recipe's units — grams, millilitres, cups, spoons — exactly.",
        },
        {
          type: "example",
          text: "For 200 g flour: scoop into the cup, level with a knife, don't pack it down. For 150 ml milk: pour into a jug, read at eye level on the counter.",
        },
        {
          type: "keyPoints",
          items: [
            "Use dry cups for dry, jug for liquids.",
            "Level dry cups with a knife.",
            "Read liquids at eye level.",
            "Baking needs exact measures.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why do measurements matter most in baking?" },
            { key: "option_0", value: "Baking is a science — ratios change the result" },
            { key: "option_1", value: "They don't matter" },
            { key: "option_2", value: "Only for taste" },
            { key: "option_3", value: "Only for colour" },
            { key: "answer", value: "Baking is a science — ratios change the result" },
            { key: "explanation", value: "Exact ratios help it rise and set." },
          ],
        },
      ],
      questions: [
        { q: "Use dry cups for…", options: ["dry ingredients", "liquids only", "hot things", "nothing"], answer: "dry ingredients", explain: "Flour, sugar, etc." },
        { q: "Level a dry cup with…", options: ["the back of a knife", "your hand", "a guess", "a lid"], answer: "the back of a knife", explain: "For precision." },
        { q: "Read liquid measures at…", options: ["eye level on a flat surface", "the top from above", "any angle", "the bottom"], answer: "eye level on a flat surface", explain: "Avoids parallax error." },
        { q: "Baking is like a science because…", options: ["ratios change the result", "it's random", "no measuring needed", "it's always fast"], answer: "ratios change the result", explain: "Chemistry of rising." },
        { q: "Too much flour makes a cake…", options: ["dry", "perfect", "soggy", "huge"], answer: "dry", explain: "Ratio matters." },
      ],
    },
    {
      topic: "Cooking Basics",
      title: "Using Heat: Boil, Simmer, Fry",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Boil (big bubbles), simmer (small gentle bubbles) and fry (hot oil or pan) are key heat methods.",
      blocks: [
        { type: "heading", text: "Three Heat Skills" },
        {
          type: "text",
          text: "Boiling means big bubbles rolling across the surface — for pasta, potatoes and eggs. Simmering means small, gentle bubbles — for soups and stews, so flavours blend without breaking food up. Frying means cooking in hot oil or a hot pan — for eggs, stir-fry, pancakes.\n\nMatch the heat to the food. High heat sears and crisps; low heat cooks gently. Never leave hot oil unattended — it can spit or, worst case, catch fire.",
        },
        {
          type: "example",
          text: "Boil: big bubbles for cooking pasta (rapid roll). Simmer: tiny bubbles for a soup (gentle). Fry: hot pan with a little oil for an egg.",
        },
        {
          type: "keyPoints",
          items: [
            "Boil = big rolling bubbles.",
            "Simmer = small gentle bubbles.",
            "Fry = hot oil/pan.",
            "Never leave hot oil alone.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Boil: big rolling bubbles (pasta, potatoes)" },
            { key: "2", value: "Simmer: small gentle bubbles (soups, stews)" },
            { key: "3", value: "Fry: hot oil or pan (eggs, stir-fry)" },
          ],
        },
      ],
      questions: [
        { q: "Big rolling bubbles mean…", options: ["boiling", "simmering", "frying", "freezing"], answer: "boiling", explain: "Rapid heat." },
        { q: "Small gentle bubbles mean…", options: ["simmering", "boiling", "frying", "burning"], answer: "simmering", explain: "Low, gentle heat." },
        { q: "Cooking in hot oil is…", options: ["frying", "boiling", "simmering", "baking"], answer: "frying", explain: "Pan + oil." },
        { q: "Never leave ___ unattended.", options: ["hot oil", "a recipe", "a spoon", "an apron"], answer: "hot oil", explain: "Fire/spit risk." },
        { q: "High heat is used to…", options: ["sear and crisp", "slow-cook always", "freeze", "cool"], answer: "sear and crisp", explain: "Browning." },
      ],
    },
    {
      topic: "Cooking Basics",
      title: "Following a Recipe",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "A recipe lists ingredients, amounts and step-by-step method. Follow the order and prep first.",
      blocks: [
        { type: "heading", text: "Step by Step" },
        {
          type: "text",
          text: "A recipe tells you what you need (ingredients with amounts) and what to do (the method) in order. 'Prep' time is how long getting ready takes; 'cook' time is how long the food is on the heat. Recipes often give oven temperature and how many people it serves.\n\nFollow the steps in order, don't skip, and prep everything first. Once you understand the layout, you can follow any recipe — and then adjust it to make it your own.",
        },
        {
          type: "example",
          text: "Recipe: 'Serves 4 · Prep 10 min · Cook 20 min.' Ingredients list exact amounts. Method: 1) heat oven, 2) mix dry, 3) add wet, 4) bake 20 min.",
        },
        {
          type: "keyPoints",
          items: [
            "Ingredients = what + how much.",
            "Method = ordered steps.",
            "Prep time vs cook time.",
            "Follow the order; prep first.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "The 'method' part of a recipe tells you…" },
            { key: "option_0", value: "what to do, step by step" },
            { key: "option_1", value: "what to buy" },
            { key: "option_2", value: "the price" },
            { key: "option_3", value: "the history" },
            { key: "answer", value: "what to do, step by step" },
            { key: "explanation", value: "The method is the instructions." },
          ],
        },
      ],
      questions: [
        { q: "'Serves 4' means…", options: ["feeds 4 people", "feeds 1", "feeds 40", "feeds the dog"], answer: "feeds 4 people", explain: "Portion count." },
        { q: "Prep time is…", options: ["getting ready time", "cooking on heat time", "eating time", "cleaning time"], answer: "getting ready time", explain: "Before cooking." },
        { q: "Cook time is…", options: ["on the heat time", "prep time", "serving time", "shopping time"], answer: "on the heat time", explain: "Active cooking." },
        { q: "The method lists…", options: ["steps in order", "the price", "the shop", "the history"], answer: "steps in order", explain: "Follow sequence." },
        { q: "Best habit before starting a recipe?", options: ["Prep everything first", "Start then hunt for tools", "Skip steps", "Guess amounts"], answer: "Prep everything first", explain: "Mise en place." },
      ],
    },

    // ===================== KITCHEN SAFETY (4) =====================
    {
      topic: "Kitchen Safety",
      title: "Knife Safety",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Keep knives sharp, cut away from yourself, curl your fingers, and never try to catch a falling knife.",
      blocks: [
        { type: "heading", text: "Sharp and Careful" },
        {
          type: "text",
          text: "Knives are a cook's most important — and most dangerous — tool. The safe grip is the 'claw': curl your fingertips under on the hand holding the food, so the blade rests against your knuckles, not your fingertips.\n\nKeep knives sharp — a sharp knife slices cleanly; a blunt one needs force and slips. Cut on a stable board, away from your body. If a knife falls, step back and let it drop — never grab for it.",
        },
        {
          type: "example",
          text: "Cutting an onion: claw grip on the onion, fingertips tucked, knife moves down and forward. Blade guides against knuckles — no sliced fingertips.",
        },
        {
          type: "keyPoints",
          items: [
            "Use the 'claw' grip (fingertips curled).",
            "Keep knives sharp.",
            "Cut away from your body.",
            "Never catch a falling knife.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why is a sharp knife often safer than a blunt one?" },
            { key: "option_0", value: "It slips less because you press less" },
            { key: "option_1", value: "It is hotter" },
            { key: "option_2", value: "It is lighter" },
            { key: "option_3", value: "It is not safer" },
            { key: "answer", value: "It slips less because you press less" },
            { key: "explanation", value: "Blunt knives need force and slip." },
          ],
        },
      ],
      questions: [
        { q: "The safe knife grip is the…", options: ["claw (fingertips curled)", "fist", "palm", "thumb grip"], answer: "claw (fingertips curled)", explain: "Tuck fingertips away." },
        { q: "A blunt knife is…", options: ["more likely to slip", "safer always", "lighter", "sharper"], answer: "more likely to slip", explain: "Needs more force." },
        { q: "If a knife falls, you should…", options: ["step back and let it drop", "grab for it", "kick it", "ignore it"], answer: "step back and let it drop", explain: "Never catch a falling knife." },
        { q: "Cut…your body.", options: ["away from", "toward", "across", "behind"], answer: "away from", explain: "Blade moves away." },
        { q: "Cut on a…", options: ["stable board", "wobbly tray", "your hand", "the counter edge"], answer: "stable board", explain: "Prevents slipping." },
      ],
    },
    {
      topic: "Kitchen Safety",
      title: "Heat & Fire Safety",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Turn pan handles inward, use oven gloves, and NEVER use water on a grease fire — smother with a lid.",
      blocks: [
        { type: "heading", text: "Hot Stuff Hurts" },
        {
          type: "text",
          text: "The kitchen is full of heat. Turn pan handles inward so they can't be knocked off the stove. Always use oven gloves for hot trays — they look innocent but burn badly. Keep tea towels and sleeves away from flames.\n\nIf grease catches fire in a pan, NEVER use water — it explodes into steam and spreads the fire. Turn off the heat and slide a lid over the pan to starve it of oxygen. If unsure, leave and call for help.",
        },
        {
          type: "example",
          text: "Grease fire: do NOT throw water. Cover with a metal lid, turn off the heat, leave it to cool. Water would splash burning oil everywhere.",
        },
        {
          type: "keyPoints",
          items: [
            "Turn pan handles inward.",
            "Use oven gloves for hot trays.",
            "NEVER water on a grease fire — use a lid.",
            "Keep cloths away from flames.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "If a grease fire starts in a pan, you should NEVER use…" },
            { key: "option_0", value: "water" },
            { key: "option_1", value: "a lid" },
            { key: "option_2", value: "a fire blanket" },
            { key: "option_3", value: "an adult's help" },
            { key: "answer", value: "water" },
            { key: "explanation", value: "Water spreads burning oil; use a lid instead." },
          ],
        },
      ],
      questions: [
        { q: "Pan handles should point…", options: ["inward", "outward", "up", "down"], answer: "inward", explain: "So they can't be knocked." },
        { q: "Use ___ for hot trays.", options: ["oven gloves", "wet cloths", "bare hands", "paper"], answer: "oven gloves", explain: "Protect from burns." },
        { q: "On a grease fire, use…", options: ["a lid to smother", "water", "flour", "nothing"], answer: "a lid to smother", explain: "Starve oxygen." },
        { q: "Water on a grease fire…", options: ["spreads the fire", "puts it out", "does nothing", "cools the pan"], answer: "spreads the fire", explain: "Steam explodes the oil." },
        { q: "Keep tea towels away from…", options: ["flames", "the fridge", "plates", "the sink"], answer: "flames", explain: "They catch fire easily." },
      ],
    },
    {
      topic: "Kitchen Safety",
      title: "Food Safety (Cross-Contamination & Storage)",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Keep raw and cooked foods apart, cook food thoroughly, and store it at safe temperatures.",
      blocks: [
        { type: "heading", text: "Don't Spread Germs" },
        {
          type: "text",
          text: "Food safety stops people getting sick. The big rule: keep raw meat (especially chicken) away from ready-to-eat foods. Use separate boards and knives for raw meat and for vegetables. Wash your hands, boards and knives after touching raw meat.\n\nCook food — especially poultry — all the way through (no pink, steaming hot). Store cold food in the fridge (below 5°C), and don't leave food sitting out for more than about two hours.",
        },
        {
          type: "example",
          text: "Cutting raw chicken on a board? Wash the board, knife and your hands before using them to chop salad. Otherwise germs spread from chicken to salad — 'cross-contamination'.",
        },
        {
          type: "keyPoints",
          items: [
            "Keep raw meat away from ready-to-eat food.",
            "Use separate boards/knives for meat.",
            "Cook food all the way through.",
            "Fridge below 5°C; don't leave food out.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Keep raw meat separate from ready-to-eat foods" },
            { key: "2", value: "Use separate boards/knives; wash hands" },
            { key: "3", value: "Cook food all the way through (steaming hot)" },
            { key: "4", value: "Store leftovers in the fridge promptly" },
          ],
        },
      ],
      questions: [
        { q: "Cross-contamination happens when…", options: ["germs spread from raw to ready-to-eat food", "food is too cold", "you cook too long", "you measure wrong"], answer: "germs spread from raw to ready-to-eat food", explain: "e.g. chicken to salad." },
        { q: "Use separate boards for…", options: ["raw meat and veg", "all foods together", "hot and cold only", "sweet and savoury"], answer: "raw meat and veg", explain: "Stop germ spread." },
        { q: "Poultry should be cooked…", options: ["all the way through (steaming hot)", "rare", "raw", "quickly only"], answer: "all the way through (steaming hot)", explain: "No pink." },
        { q: "Fridge should be below…", options: ["5°C", "0°C", "20°C", "30°C"], answer: "5°C", explain: "Slows bacteria." },
        { q: "Don't leave food out for more than about…", options: ["2 hours", "2 days", "2 minutes", "20 hours"], answer: "2 hours", explain: "Then refrigerate." },
      ],
    },
    {
      topic: "Kitchen Safety",
      title: "Preventing Falls & Burns",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Clean spills at once, walk (don't run), and let hot things cool before touching them.",
      blocks: [
        { type: "heading", text: "Slips and Scalds" },
        {
          type: "text",
          text: "Spills on the floor become slip hazards — clean them up straight away. Walk in the kitchen, never run. Open pot lids away from you so steam doesn't hit your face. Carry knives pointed down.\n\nLet hot pans, trays and food cool a little before touching. When opening the oven, stand to the side — a blast of hot air can scald. A few calm habits prevent most accidents.",
        },
        {
          type: "example",
          text: "Lifting a pan lid: tilt it so steam escapes away from your face. Taking a tray from the oven: stand to the side as you open the door, then reach in with oven gloves.",
        },
        {
          type: "keyPoints",
          items: [
            "Clean spills straight away.",
            "Walk, don't run.",
            "Open lids away from your face.",
            "Let hot things cool before touching.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "When opening a hot pan lid, tilt it…" },
            { key: "option_0", value: "away from your face (steam escapes outward)" },
            { key: "option_1", value: "toward your face" },
            { key: "option_2", value: "straight up fast" },
            { key: "option_3", value: "sideways into a wall" },
            { key: "answer", value: "away from your face (steam escapes outward)" },
            { key: "explanation", value: "Steam scalds — keep it away from your face." },
          ],
        },
      ],
      questions: [
        { q: "Spills should be…", options: ["cleaned at once", "left for later", "ignored", "wiped on clothes"], answer: "cleaned at once", explain: "Prevent slips." },
        { q: "In the kitchen you should…", options: ["walk, not run", "run", "skip", "jump"], answer: "walk, not run", explain: "Avoid slips." },
        { q: "Open pan lids…", options: ["away from your face", "toward your face", "with bare hands", "fast"], answer: "away from your face", explain: "Steam scalds." },
        { q: "Hot things should be…", options: ["allowed to cool before touching", "grabbed at once", "thrown", "ignored"], answer: "allowed to cool before touching", explain: "Avoid burns." },
        { q: "When opening the oven, stand…", options: ["to the side", "right in front", "on one foot", "on a chair"], answer: "to the side", explain: "Hot air blasts out." },
      ],
    },

    // ===================== RECIPES (4) =====================
    {
      topic: "Recipes",
      title: "Reading a Recipe",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "A recipe tells you ingredients (with amounts), method (ordered steps), prep/cook time and servings.",
      blocks: [
        { type: "heading", text: "The Recipe Map" },
        {
          type: "text",
          text: "A recipe is a map from ingredients to a finished dish. It lists the ingredients with amounts (grams, ml, cups, spoons), the equipment you'll need, and the method — the ordered steps to follow. It also shows prep time, cook time, oven temperature and how many it serves.\n\nReading the whole recipe before starting helps you spot steps that need time (rising, marinating, cooling) and gather everything. Once fluent, you can follow any recipe in the world.",
        },
        {
          type: "example",
          text: "Pancake recipe: serves 4 · prep 5 min · cook 10 min. Ingredients: 200 g flour, 2 eggs, 300 ml milk. Method: 1) whisk eggs + milk, 2) stir in flour, 3) fry ladles of batter.",
        },
        {
          type: "keyPoints",
          items: [
            "Ingredients list what + how much.",
            "Method = ordered steps.",
            "Prep/cook time + servings.",
            "Read it all before starting.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What does the method part tell you?" },
            { key: "option_0", value: "What to do, step by step" },
            { key: "option_1", value: "What to buy at the shop" },
            { key: "option_2", value: "The price" },
            { key: "option_3", value: "Who invented it" },
            { key: "answer", value: "What to do, step by step" },
            { key: "explanation", value: "The instructions." },
          ],
        },
      ],
      questions: [
        { q: "A recipe's ingredients list…", options: ["what + how much", "only names", "only prices", "the history"], answer: "what + how much", explain: "Exact amounts." },
        { q: "The method is…", options: ["ordered steps", "the shopping list", "the price", "a photo"], answer: "ordered steps", explain: "Follow in sequence." },
        { q: "'Serves 6' means…", options: ["feeds 6 people", "feeds 1", "feeds 60", "cooks for 6 hours"], answer: "feeds 6 people", explain: "Portions." },
        { q: "Before starting, you should…", options: ["read the whole recipe", "start then check", "skip steps", "double the heat"], answer: "read the whole recipe", explain: "No surprises." },
        { q: "Prep time tells you…", options: ["getting ready time", "cooking on heat time", "eating time", "cleaning time"], answer: "getting ready time", explain: "Before cooking." },
      ],
    },
    {
      topic: "Recipes",
      title: "Mise en Place (Prep First)",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "'Mise en place' means measuring and prepping all ingredients before you start cooking — calm, not chaos.",
      blocks: [
        { type: "heading", text: "Everything in Its Place" },
        {
          type: "text",
          text: "'Mise en place' (French for 'everything in its place') is the chef's habit of measuring, chopping and preparing ALL ingredients before the heat goes on. Each ingredient sits in its own little bowl, ready to tip in.\n\nWhy? Once cooking starts, things move fast. If you're still chopping garlic while the onions burn, you've lost the dish. Prepping first keeps cooking calm, orderly and successful.",
        },
        {
          type: "example",
          text: "Stir-fry mise en place: chopped veg in bowls, measured soy sauce and oil, sliced meat — all lined up. Then heat the pan and cook in minutes, adding each bowl in turn.",
        },
        {
          type: "keyPoints",
          items: [
            "'Mise en place' = prep everything first.",
            "Each ingredient in its own bowl.",
            "Cooking then stays calm and fast.",
            "Stops burning while you chop.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Read the recipe and gather ingredients" },
            { key: "2", value: "Wash, peel and chop each ingredient" },
            { key: "3", value: "Measure each into its own bowl (mise en place)" },
            { key: "4", value: "Start cooking — add bowls in order" },
          ],
        },
      ],
      questions: [
        { q: "'Mise en place' means…", options: ["everything in its place (prep first)", "cook fast", "eat cold food", "clean later"], answer: "everything in its place (prep first)", explain: "Prep before cooking." },
        { q: "Why prep first?", options: ["Cooking moves fast once heat is on", "It's slower", "It wastes food", "No reason"], answer: "Cooking moves fast once heat is on", explain: "Avoid burning." },
        { q: "Mise en place keeps cooking…", options: ["calm and orderly", "chaotic", "impossible", "cold"], answer: "calm and orderly", explain: "Bowl by bowl." },
        { q: "Each prepped ingredient goes in…", options: ["its own bowl", "one big pile", "the bin", "your pocket"], answer: "its own bowl", explain: "Ready to add." },
        { q: "Without prep, you might burn food because…", options: ["you're still chopping while it cooks", "prep doesn't matter", "the oven is off", "of mise en place"], answer: "you're still chopping while it cooks", explain: "Heat waits for no one." },
      ],
    },
    {
      topic: "Recipes",
      title: "Timing Your Dishes",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Plan so all parts of a meal are ready at the same time — start the longest-cooking dish first.",
      blocks: [
        { type: "heading", text: "All Ready Together" },
        {
          type: "text",
          text: "A good cook times things so everything is ready together — hot food, hot plates, all at once. The trick: read the cook times, then work BACKWARDS. Start the longest dish first; quicker dishes later. Keep finished items warm (low oven, covered) while you finish the rest.\n\nA simple plan: 'Rice takes 20 min, chicken 15, veg 5. Start rice, after 5 min start chicken, after 15 more start veg — all done together.'",
        },
        {
          type: "example",
          text: "Cooking pasta (10 min) and a quick sauce (5 min): boil water and start pasta; with 5 min left, start the sauce. Both ready together.",
        },
        {
          type: "keyPoints",
          items: [
            "Start the longest dish first.",
            "Work backwards from 'serve time'.",
            "Keep finished items warm.",
            "All parts ready at once.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which dish should you start FIRST?" },
            { key: "option_0", value: "The one that takes the longest to cook" },
            { key: "option_1", value: "The quickest one" },
            { key: "option_2", value: "Any order" },
            { key: "option_3", value: "None" },
            { key: "answer", value: "The one that takes the longest to cook" },
            { key: "explanation", value: "So everything finishes together." },
          ],
        },
      ],
      questions: [
        { q: "To have everything ready together, start with…", options: ["the longest-cooking dish", "the quickest dish", "dessert", "the plates only"], answer: "the longest-cooking dish", explain: "Work backwards." },
        { q: "Keep finished items…", options: ["warm (low oven, covered)", "in the fridge", "outside", "on the floor"], answer: "warm (low oven, covered)", explain: "Until serving." },
        { q: "If rice takes 20 min and veg 5, start…", options: ["rice first, veg at 15 min", "veg first", "both at once", "veg only"], answer: "rice first, veg at 15 min", explain: "Both finish at 20." },
        { q: "Planning backwards means starting from…", options: ["'serve time'", "the recipe book", "the shop", "the plates"], answer: "'serve time'", explain: "Then schedule each dish." },
        { q: "Why time dishes?", options: ["So all are ready together", "To waste food", "To burn things", "No reason"], answer: "So all are ready together", explain: "Hot and fresh." },
      ],
    },
    {
      topic: "Recipes",
      title: "Adapting & Substituting",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "You can swap ingredients (within reason) to suit taste, allergies or what's in the cupboard.",
      blocks: [
        { type: "heading", text: "Make It Your Own" },
        {
          type: "text",
          text: "Recipes are guides, not laws. Once you understand them, you can adapt: swap spices for ones you like, use milk instead of cream, add extra veg, or make it allergy-safe (e.g. gluten-free flour). Some swaps are easy; others (like eggs or baking powder in baking) need care because they change the chemistry.\n\nTaste as you cook (when safe), adjust seasoning, and note what you changed so you can repeat your wins (or fix your flops).",
        },
        {
          type: "example",
          text: "No buttermilk? Add a squeeze of lemon to normal milk and wait 5 minutes — a handy substitute. Like it spicier? Add chilli. Cooking is creative.",
        },
        {
          type: "keyPoints",
          items: [
            "Recipes are guides — adapt them.",
            "Swap for taste, allergies, what you have.",
            "Baking swaps need care (chemistry).",
            "Taste and adjust as you cook.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "When is substituting ingredients risky?" },
            { key: "option_0", value: "In baking, where chemistry depends on exact ratios" },
            { key: "option_1", value: "Always risky" },
            { key: "option_2", value: "Never risky" },
            { key: "option_3", value: "Only with salt" },
            { key: "answer", value: "In baking, where chemistry depends on exact ratios" },
            { key: "explanation", value: "Eggs, leavening, fats matter." },
          ],
        },
      ],
      questions: [
        { q: "Recipes are best seen as…", options: ["guides you can adapt", "strict laws", "guesses", "wishes"], answer: "guides you can adapt", explain: "Flexible." },
        { q: "Substituting is risky in…", options: ["baking (chemistry)", "soups always", "salads always", "no situation"], answer: "baking (chemistry)", explain: "Exact ratios." },
        { q: "A safe substitution is…", options: ["lemon + milk for buttermilk", "water for flour", "sand for sugar", "ice for oil"], answer: "lemon + milk for buttermilk", explain: "A common swap." },
        { q: "When adapting, you should…", options: ["note what you changed", "forget everything", "never taste", "double the salt"], answer: "note what you changed", explain: "Repeat wins, fix flops." },
        { q: "Good reason to substitute?", options: ["Allergies or what's in the cupboard", "To ruin the dish", "No reason", "To save time only"], answer: "Allergies or what's in the cupboard", explain: "Practical cooking." },
      ],
    },

    // ===================== CLEANING ROUTINES (4) =====================
    {
      topic: "Cleaning Routines",
      title: "Daily Cleaning Habits",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Small daily habits — wiping surfaces, washing up, putting things away — keep mess under control.",
      blocks: [
        { type: "heading", text: "A Little Every Day" },
        {
          type: "text",
          text: "The secret to a tidy home is cleaning a little bit often. A few daily habits stop mess building up: wipe kitchen and bathroom surfaces after use, wash up or load the dishwasher, put things back where they belong, and give floors a quick sweep.\n\nSpending ten focused minutes a day beats a huge, exhausting clean at the weekend. Mess is easier to prevent than to undo.",
        },
        {
          type: "example",
          text: "After cooking: wipe the counter, wash the cutting board, put ingredients away — 3 minutes. Leave it, and tomorrow's pile is twice as bad.",
        },
        {
          type: "keyPoints",
          items: [
            "Wipe surfaces after use.",
            "Wash up or load the dishwasher.",
            "Put things back in their place.",
            "Ten minutes daily beats a huge weekend clean.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What keeps mess under control best?" },
            { key: "option_0", value: "Cleaning a little, often" },
            { key: "option_1", value: "Cleaning once a year" },
            { key: "option_2", value: "Never cleaning" },
            { key: "option_3", value: "Hiding mess in cupboards" },
            { key: "answer", value: "Cleaning a little, often" },
            { key: "explanation", value: "Daily habits prevent build-up." },
          ],
        },
      ],
      questions: [
        { q: "Best cleaning approach?", options: ["A little, often", "Once a year", "Never", "Hide it"], answer: "A little, often", explain: "Prevent build-up." },
        { q: "After cooking you should…", options: ["wipe the counter + wash up", "leave it for days", "throw dishes away", "move house"], answer: "wipe the counter + wash up", explain: "Quick daily habit." },
        { q: "Putting things back where they belong…", options: ["stops mess building up", "wastes time", "is impossible", "creates mess"], answer: "stops mess building up", explain: "Everything has a home." },
        { q: "Daily cleaning takes about…", options: ["ten focused minutes", "ten hours", "no time at all", "a whole day"], answer: "ten focused minutes", explain: "Small effort." },
        { q: "Mess is easier to…", options: ["prevent than undo", "undo than prevent", "ignore", "hide"], answer: "prevent than undo", explain: "Daily habits win." },
      ],
    },
    {
      topic: "Cleaning Routines",
      title: "Room-by-Room Cleaning",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Clean room by room: kitchens (surfaces, sink, floor), bathrooms (sanitise), living areas (tidy, dust), bedrooms (bed, laundry).",
      blocks: [
        { type: "heading", text: "One Room at a Time" },
        {
          type: "text",
          text: "Tackle cleaning one room at a time so it feels manageable. Kitchen: wipe counters, clean the sink, sweep and mop the floor, empty the bin. Bathroom: sanitise the toilet, sink and bath/shower, clean the mirror, change towels. Living areas: tidy clutter, dust surfaces, vacuum. Bedrooms: make the bed, put away clothes, laundry in the basket.\n\nEach room has its own quick routine. Doing one room fully feels better than half-doing several.",
        },
        {
          type: "example",
          text: "Bathroom routine (5 min): squirt toilet cleaner, wipe sink + mirror, quick brush of toilet, rinse bath. Done. Keep cleaning products in each room for speed.",
        },
        {
          type: "keyPoints",
          items: [
            "Clean room by room.",
            "Kitchen: surfaces, sink, floor, bin.",
            "Bathroom: sanitise toilet, sink, bath.",
            "Bedrooms: bed, clothes, laundry.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Tidy clutter first (put things away)" },
            { key: "2", value: "Clean surfaces (wipe, dust, sanitise)" },
            { key: "3", value: "Clean floors last (sweep, vacuum, mop)" },
          ],
        },
      ],
      questions: [
        { q: "Best way to make cleaning manageable?", options: ["One room at a time", "All at once, randomly", "Never clean", "Only the ceiling"], answer: "One room at a time", explain: "Focus fully." },
        { q: "In the bathroom, sanitise the…", options: ["toilet, sink and bath", "ceiling only", "curtains only", "door only"], answer: "toilet, sink and bath", explain: "Germ hotspots." },
        { q: "Clean floors…", options: ["last (after tidying and surfaces)", "first", "never", "with bare hands"], answer: "last (after tidying and surfaces)", explain: "Don't re-dirty them." },
        { q: "In the bedroom, what should you do daily?", options: ["Make the bed", "Paint the walls", "Move the furniture", "Nothing"], answer: "Make the bed", explain: "Instant tidy look." },
        { q: "Keep cleaning products…", options: ["in each room for speed", "in one far cupboard", "outside", "locked away forever"], answer: "in each room for speed", explain: "Quick to grab." },
      ],
    },
    {
      topic: "Cleaning Routines",
      title: "Cleaning Products & Safety",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Use the right product for each job, never mix chemicals, and keep the room ventilated.",
      blocks: [
        { type: "heading", text: "Clean and Safe" },
        {
          type: "text",
          text: "Different jobs need different products: degreasers for kitchens, disinfectants for bathrooms, glass cleaner for mirrors. Always read the label and follow the dilution instructions. Keep products in their original bottles, clearly labelled, and away from children.\n\nNever mix cleaning chemicals — some combinations (like bleach and ammonia) release dangerous, choking gases. Open a window or run a fan when using strong products, and wear gloves.",
        },
        {
          type: "example",
          text: "Bleach + ammonia = toxic chloramine gas. Many glass cleaners contain ammonia; many toilet cleaners contain bleach. Mixing them is dangerous. Keep them separate.",
        },
        {
          type: "keyPoints",
          items: [
            "Match product to the job.",
            "Read + follow the label.",
            "NEVER mix chemicals.",
            "Ventilate and wear gloves.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why should you NEVER mix cleaning chemicals?" },
            { key: "option_0", value: "Some mixes give off dangerous fumes" },
            { key: "option_1", value: "It is fine to mix them" },
            { key: "option_2", value: "It costs money" },
            { key: "option_3", value: "It smells nice" },
            { key: "answer", value: "Some mixes give off dangerous fumes" },
            { key: "explanation", value: "e.g. bleach + ammonia = toxic gas." },
          ],
        },
      ],
      questions: [
        { q: "NEVER mix cleaning chemicals because…", options: ["some mixes give off dangerous fumes", "it's too cheap", "it cleans too well", "it's illegal"], answer: "some mixes give off dangerous fumes", explain: "Toxic gases." },
        { q: "Bleach + ammonia makes…", options: ["toxic gas", "safe soap", "water", "nothing"], answer: "toxic gas", explain: "Chloramine." },
        { q: "Use the right product for…", options: ["each job", "every job the same", "no job", "the cheapest always"], answer: "each job", explain: "Degreaser, disinfectant, glass." },
        { q: "When using strong cleaners, you should…", options: ["ventilate + wear gloves", "seal the room", "use bare hands", "hold your breath only"], answer: "ventilate + wear gloves", explain: "Protect yourself." },
        { q: "Keep products…", options: ["in original bottles, away from children", "unlabelled, anywhere", "in food jars", "outside"], answer: "in original bottles, away from children", explain: "Safety first." },
      ],
    },
    {
      topic: "Cleaning Routines",
      title: "Laundry Basics",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Sort laundry by colour and fabric, choose the right wash temperature, and dry promptly to avoid smells.",
      blocks: [
        { type: "heading", text: "Sort, Wash, Dry" },
        {
          type: "text",
          text: "Laundry has three steps: sort, wash, dry. Sort clothes by colour (darks vs lights) and fabric (delicates separate) so colours don't run and delicate fabrics don't get damaged. Check pockets and read care labels.\n\nChoose the right wash temperature: cold for darks and delicates, warm for everyday, hot for whites and heavily soiled. Don't overload the machine. After washing, dry promptly (line or tumble) so clothes don't turn musty.",
        },
        {
          type: "example",
          text: "Sort: darks (jeans, dark t-shirts) on cold; whites (shirts, socks) on warm; delicates (wool, silk) on a gentle cycle. New red top? Wash alone first — it may bleed.",
        },
        {
          type: "keyPoints",
          items: [
            "Sort by colour and fabric.",
            "Cold for darks/delicates, hot for whites.",
            "Don't overload the machine.",
            "Dry promptly to avoid musty smells.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "Darks + delicates", value: "Wash cold" },
            { key: "Everyday clothes", value: "Wash warm" },
            { key: "Whites + heavily soiled", value: "Wash hot" },
            { key: "First wash of a bright colour", value: "Wash alone (may bleed)" },
            { key: "After washing", value: "Dry promptly" },
          ],
        },
      ],
      questions: [
        { q: "Sort laundry by…", options: ["colour and fabric", "size only", "smell", "owner only"], answer: "colour and fabric", explain: "Prevent running + damage." },
        { q: "Wash darks and delicates on…", options: ["cold", "hot", "boil", "any"], answer: "cold", explain: "Protect colours + fabric." },
        { q: "Whites and very dirty items wash…", options: ["hot", "cold", "never", "with reds"], answer: "hot", explain: "Cleaner + brighter." },
        { q: "Don't…", options: ["overload the machine", "use detergent", "sort", "read labels"], answer: "overload the machine", explain: "Clothes won't clean." },
        { q: "Dry clothes promptly to avoid…", options: ["musty smells", "colours", "shrinkage", "wrinkles only"], answer: "musty smells", explain: "Don't leave damp." },
      ],
    },

    // ===================== APPLIANCE SAFETY (4) =====================
    {
      topic: "Appliance Safety",
      title: "Stove & Oven Safety",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Never leave a hot stove unattended, use oven gloves, and turn off when you finish.",
      blocks: [
        { type: "heading", text: "Hot Appliances" },
        {
          type: "text",
          text: "Stoves and ovens are the hottest things in the kitchen. Never leave the stove unattended while it's on — pans can boil dry, spill or catch fire. Turn pan handles inward. Use oven gloves for hot trays and racks; the inside of an oven looks the same hot or cold.\n\nWhen you finish, switch the stove and oven OFF. Keep flammable things — tea towels, paper, sleeves — well away from burners. Let the oven cool before wiping it.",
        },
        {
          type: "example",
          text: "Taking a tray from a 200°C oven: oven gloves on, stand to the side as you open the door, lift the tray firmly, set it on a heat-proof surface.",
        },
        {
          type: "keyPoints",
          items: [
            "Never leave a hot stove unattended.",
            "Turn pan handles inward.",
            "Always use oven gloves.",
            "Switch off when finished.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why should you never leave a hot stove unattended?" },
            { key: "option_0", value: "Pans can boil dry, spill or catch fire" },
            { key: "option_1", value: "It saves electricity" },
            { key: "option_2", value: "It's faster" },
            { key: "option_3", value: "No reason" },
            { key: "answer", value: "Pans can boil dry, spill or catch fire" },
            { key: "explanation", value: "Stay with the heat." },
          ],
        },
      ],
      questions: [
        { q: "Never leave a ___ unattended.", options: ["hot stove", "recipe", "spoon", "book"], answer: "hot stove", explain: "Fire risk." },
        { q: "Use ___ for hot trays.", options: ["oven gloves", "bare hands", "wet cloth", "paper"], answer: "oven gloves", explain: "Prevent burns." },
        { q: "When finished cooking, you should…", options: ["switch the stove/oven OFF", "leave it on", "go out", "add more heat"], answer: "switch the stove/oven OFF", explain: "Safety first." },
        { q: "Keep flammable things ___ burners.", options: ["away from", "near", "on", "above"], answer: "away from", explain: "Fire risk." },
        { q: "Pan handles should point…", options: ["inward", "outward", "up", "anywhere"], answer: "inward", explain: "So they can't be knocked." },
      ],
    },
    {
      topic: "Appliance Safety",
      title: "Microwave Safety",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Never put metal in a microwave, cover food, and let it stand — contents heat unevenly and can scald.",
      blocks: [
        { type: "heading", text: "Zap Safely" },
        {
          type: "text",
          text: "The microwave heats food fast with radio waves. NEVER put metal inside — forks, foil, metal-rimmed plates cause sparks that can start a fire. Use microwave-safe glass or plastic. Cover food with a cover or vented cling film to stop splatters.\n\nMicrowaves heat unevenly — one spoonful may be cold, another scalding. Stir food and let it 'stand' a minute before eating so heat spreads. Open covers away from your face to avoid steam burns.",
        },
        {
          type: "example",
          text: "Reheating soup: cover with a vented lid, heat 2 minutes, stir, heat another minute, stand 1 minute. Check it's evenly hot. Beware — the bowl itself can be very hot.",
        },
        {
          type: "keyPoints",
          items: [
            "NEVER put metal in a microwave.",
            "Use microwave-safe containers.",
            "Cover food to stop splatters.",
            "Stir + let stand (heats unevenly).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What should NEVER go in a microwave?" },
            { key: "option_0", value: "Metal (forks, foil, metal-rimmed plates)" },
            { key: "option_1", value: "Soup in a glass bowl" },
            { key: "option_2", value: "A mug of water" },
            { key: "option_3", value: "Bread" },
            { key: "answer", value: "Metal (forks, foil, metal-rimmed plates)" },
            { key: "explanation", value: "Metal sparks and can start a fire." },
          ],
        },
      ],
      questions: [
        { q: "Never put ___ in a microwave.", options: ["metal", "water", "soup", "bread"], answer: "metal", explain: "Sparks/fire." },
        { q: "Use ___ containers.", options: ["microwave-safe", "metal", "styrofoam always", "foil"], answer: "microwave-safe", explain: "Glass/microwave plastic." },
        { q: "Cover food to…", options: ["stop splatters", "make it hotter", "burn it", "freeze it"], answer: "stop splatters", explain: "Keep the microwave clean." },
        { q: "Microwaves heat food…", options: ["unevenly — stir and stand", "perfectly even", "not at all", "from the outside only"], answer: "unevenly — stir and stand", explain: "Hot spots scald." },
        { q: "Open covers away from your…", options: ["face", "hand", "back", "feet"], answer: "face", explain: "Steam burns." },
      ],
    },
    {
      topic: "Appliance Safety",
      title: "Small Appliances",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Keep small appliances (toasters, kettles, blenders) clean, dry, unplugged when not in use, and away from water.",
      blocks: [
        { type: "heading", text: "Toasters, Kettles, Blenders" },
        {
          type: "text",
          text: "Small appliances make life easier but need care. Keep them clean: empty the toaster crumb tray, descale the kettle, wipe blenders after use. Keep leads and plugs away from water, and unplug them when you're done or before cleaning.\n\nNever push a knife or fork into a toaster to rescue stuck bread — the live wires inside can shock you. Unplug first. Keep appliances on dry surfaces and never handle plugs with wet hands.",
        },
        {
          type: "example",
          text: "Stuck bread in a toaster? Unplug it, let it cool, then gently turn it upside down to shake out the crumbs. Never poke a fork in while it's plugged in.",
        },
        {
          type: "keyPoints",
          items: [
            "Keep small appliances clean.",
            "Keep leads/plugs away from water.",
            "Unplug before cleaning or when done.",
            "Never poke a toaster with metal while plugged in.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "To rescue stuck bread from a toaster, first you should…" },
            { key: "option_0", value: "Unplug the toaster" },
            { key: "option_1", value: "Poke a fork in" },
            { key: "option_2", value: "Pour water in" },
            { key: "option_3", value: "Shake it hard while plugged in" },
            { key: "answer", value: "Unplug the toaster" },
            { key: "explanation", value: "Live wires inside can shock." },
          ],
        },
      ],
      questions: [
        { q: "Before cleaning an appliance, you should…", options: ["unplug it", "plug it in", "wet your hands", "turn it on"], answer: "unplug it", explain: "Safety first." },
        { q: "Never poke a toaster with a fork because…", options: ["live wires can shock you", "it cleans it", "it toasts faster", "it's fine"], answer: "live wires can shock you", explain: "Unplug first." },
        { q: "Keep appliance leads away from…", options: ["water", "the ceiling", "the fridge", "books"], answer: "water", explain: "Shock risk." },
        { q: "Handle plugs with…", options: ["dry hands", "wet hands", "gloves always", "your teeth"], answer: "dry hands", explain: "Avoid shocks." },
        { q: "Empty the toaster's…", options: ["crumb tray", "glass", "lid", "buttons"], answer: "crumb tray", explain: "Prevents smells/fire." },
      ],
    },
    {
      topic: "Appliance Safety",
      title: "Home Electrical Safety",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Don't overload sockets, check for damaged leads, keep water away, and switch off if something smells of burning.",
      blocks: [
        { type: "heading", text: "Power Without Peril" },
        {
          type: "text",
          text: "Electricity powers our homes but must be treated with respect. Don't overload one socket with too many plugs — it can overheat and cause a fire. Check leads for fraying or damage; replace any that look worn. Keep water well away from anything electrical.\n\nIf an appliance smells of burning, feels too hot or gives a small shock, switch it off and unplug it at once and tell an adult. Never push things into sockets. Use a circuit breaker (RCD) for outdoor tools.",
        },
        {
          type: "example",
          text: "Don't plug a heater, a kettle and a microwave all into one extension lead — that's a fire risk. Spread them across separate sockets.",
        },
        {
          type: "keyPoints",
          items: [
            "Don't overload sockets.",
            "Check leads for damage.",
            "Keep water away from electricals.",
            "Switch off + unplug if smoking/hot.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "If an appliance smells of burning, you should…" },
            { key: "option_0", value: "switch it off and unplug it, tell an adult" },
            { key: "option_1", value: "keep using it" },
            { key: "option_2", value: "pour water on it" },
            { key: "option_3", value: "ignore it" },
            { key: "answer", value: "switch it off and unplug it, tell an adult" },
            { key: "explanation", value: "Could be unsafe." },
          ],
        },
      ],
      questions: [
        { q: "Don't ___ a socket.", options: ["overload", "use", "switch off", "look at"], answer: "overload", explain: "Fire risk." },
        { q: "Check leads for…", options: ["fraying/damage", "colour", "length only", "smell"], answer: "fraying/damage", explain: "Replace worn ones." },
        { q: "Keep ___ away from electricals.", options: ["water", "books", "food", "clocks"], answer: "water", explain: "Shock risk." },
        { q: "If something smokes or shocks, …", options: ["switch off + unplug", "use it more", "put water on it", "ignore it"], answer: "switch off + unplug", explain: "Then get help." },
        { q: "Plugging a heater, kettle and microwave into one extension lead is…", options: ["a fire risk (overload)", "safe", "required", "free electricity"], answer: "a fire risk (overload)", explain: "Spread the load." },
      ],
    },
  ],
};

import type { SubjectCurriculum } from "./types";

export const english: SubjectCurriculum = {
  slug: "english",
  lessons: [
    // ===================== GRAMMAR (5) =====================
    {
      topic: "Grammar",
      title: "Nouns",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "A noun names a person, place, thing or idea. Common nouns are general; proper nouns name specific ones and use capital letters.",
      blocks: [
        { type: "heading", text: "Naming Words" },
        {
          type: "text",
          text: "A noun is a word that names a person, place, thing or idea. 'Teacher', 'London', 'book' and 'happiness' are all nouns. Without nouns, sentences would have nothing to be about!\n\nThere are two main kinds. Common nouns name general things (dog, city, river) and use lowercase letters. Proper nouns name specific people, places or brands (Rover, Paris, River Thames) and always start with a capital letter.",
        },
        {
          type: "example",
          text: "In 'Mia walked to the park', 'Mia' is a proper noun (specific person, capital M) and 'park' is a common noun (general place, lowercase).",
        },
        {
          type: "keyPoints",
          items: [
            "Nouns name people, places, things or ideas.",
            "Common nouns are general (lowercase).",
            "Proper nouns are specific (capital letter).",
            "A sentence usually contains at least one noun.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which word is a proper noun? 'the clever fox met Badger.'" },
            { key: "option_0", value: "Badger" },
            { key: "option_1", value: "the" },
            { key: "option_2", value: "clever" },
            { key: "option_3", value: "met" },
            { key: "answer", value: "Badger" },
            { key: "explanation", value: "'Badger' names a specific character and has a capital letter." },
          ],
        },
      ],
      questions: [
        { q: "Which is a noun?", options: ["run", "quickly", "garden", "blue"], answer: "garden", explain: "A garden is a thing." },
        { q: "Which is a PROPER noun?", options: ["city", "London", "place", "town"], answer: "London", explain: "London names a specific place with a capital." },
        { q: "'Happiness' is which kind of noun?", options: ["Idea (abstract)", "Person", "Place", "Not a noun"], answer: "Idea (abstract)", explain: "It names a feeling/idea." },
        { q: "Common nouns are written with…", options: ["lowercase letters", "ALL CAPS", "capital letters", "numbers"], answer: "lowercase letters", explain: "Common nouns are general, so lowercase." },
        { q: "In 'The cat slept', the noun is…", options: ["cat", "the", "slept", "none"], answer: "cat", explain: "A cat is a thing." },
      ],
    },
    {
      topic: "Grammar",
      title: "Verbs & Tenses",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "A verb is an action or being word. Tenses (past, present, future) show WHEN it happens.",
      blocks: [
        { type: "heading", text: "Doing and Being Words" },
        {
          type: "text",
          text: "A verb is a doing or being word. Action verbs show action: run, jump, write. Being verbs (like is, was, seem) connect the subject to a description. Every sentence needs a verb to be complete.\n\nTense tells us WHEN. Past tense: 'I walked.' Present tense: 'I walk.' Future tense: 'I will walk.' Changing the verb ending (or adding 'will') moves the action in time.",
        },
        {
          type: "example",
          text: "The verb 'jump': past = jumped, present = jump/jumps, future = will jump. 'She jumped' (past), 'She jumps' (present), 'She will jump' (future).",
        },
        {
          type: "keyPoints",
          items: [
            "Verbs show action or being.",
            "Every complete sentence has a verb.",
            "Past = happened, present = happening, future = will happen.",
            "Verb endings (−ed, −s) show tense.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is the verb? 'The dog barked loudly.'" },
            { key: "option_0", value: "barked" },
            { key: "option_1", value: "dog" },
            { key: "option_2", value: "loudly" },
            { key: "option_3", value: "the" },
            { key: "answer", value: "barked" },
            { key: "explanation", value: "'Barked' is the action." },
          ],
        },
      ],
      questions: [
        { q: "Which is a verb?", options: ["happy", "ran", "soft", "tree"], answer: "ran", explain: "It is an action." },
        { q: "'She will dance.' Which tense?", options: ["Future", "Past", "Present", "None"], answer: "Future", explain: "'Will' signals the future." },
        { q: "Past tense of 'walk'?", options: ["walked", "walking", "walks", "will walk"], answer: "walked", explain: "Add −ed for regular past." },
        { q: "Which is a BEING verb?", options: ["is", "jump", "shout", "carry"], answer: "is", explain: "'Is' connects subject to description." },
        { q: "Present tense of 'played' (he ___)?", options: ["plays", "played", "will play", "playing"], answer: "plays", explain: "He plays — present." },
      ],
    },
    {
      topic: "Grammar",
      title: "Adjectives & Adverbs",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Adjectives describe nouns; adverbs describe verbs (and often end in −ly).",
      blocks: [
        { type: "heading", text: "Describing Words" },
        {
          type: "text",
          text: "Adjectives describe nouns — they tell us what kind, how many, which one. 'The tall, green tree' uses two adjectives: tall and green. Adjectives make writing vivid and specific.\n\nAdverbs describe verbs — they tell us how, when or where something happens. 'She ran quickly' — 'quickly' describes how she ran. Many adverbs end in −ly, but not all (fast, well, soon).",
        },
        {
          type: "example",
          text: "'The slow turtle crawled silently.' Adjective 'slow' describes the turtle (noun); adverb 'silently' describes crawled (verb).",
        },
        {
          type: "keyPoints",
          items: [
            "Adjectives describe nouns.",
            "Adverbs describe verbs (often end in −ly).",
            "Adjectives usually sit before the noun.",
            "Both make writing more descriptive.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which word is an adverb? 'He sang loudly.'" },
            { key: "option_0", value: "loudly" },
            { key: "option_1", value: "sang" },
            { key: "option_2", value: "He" },
            { key: "option_3", value: "song" },
            { key: "answer", value: "loudly" },
            { key: "explanation", value: "'Loudly' describes how he sang (the verb)." },
          ],
        },
      ],
      questions: [
        { q: "Which is an adjective?", options: ["fluffy", "ran", "quickly", "under"], answer: "fluffy", explain: "It describes a noun." },
        { q: "Which is an adverb?", options: ["happily", "cake", "big", "jump"], answer: "happily", explain: "Describes a verb, ends in −ly." },
        { q: "In 'the red car', 'red' is a/an…", options: ["adjective", "noun", "verb", "adverb"], answer: "adjective", explain: "Describes the noun 'car'." },
        { q: "Adverbs usually describe…", options: ["verbs", "nouns only", "the writer", "nothing"], answer: "verbs", explain: "Adverbs tell how/when/where an action happens." },
        { q: "Improve: 'The dog barked.' Add a describing word.", options: ["The loud dog barked fiercely.", "The of dog barked.", "The dog barked barked.", "Dog dog barked."], answer: "The loud dog barked fiercely.", explain: "Adds adjective + adverb for detail." },
      ],
    },
    {
      topic: "Grammar",
      title: "Pronouns",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Pronouns replace nouns so we don't repeat them: he, she, it, they, we.",
      blocks: [
        { type: "heading", text: "Shortcut Words" },
        {
          type: "text",
          text: "A pronoun takes the place of a noun so we don't repeat it. Instead of saying 'Mia left because Mia was tired', we say 'Mia left because she was tired.' 'She' is the pronoun.\n\nCommon pronouns: I, you, he, she, it, we, they, me, him, her, us, them. The noun a pronoun replaces is called its antecedent.",
        },
        {
          type: "example",
          text: "'The boys put on their coats because they were cold.' 'Their' and 'they' are pronouns replacing 'the boys'.",
        },
        {
          type: "keyPoints",
          items: [
            "Pronouns replace nouns.",
            "He, she, it, they, we, you, I are pronouns.",
            "They stop us repeating nouns.",
            "The replaced noun is the antecedent.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is a pronoun? 'Tom said he was ready.'" },
            { key: "option_0", value: "he" },
            { key: "option_1", value: "Tom" },
            { key: "option_2", value: "said" },
            { key: "option_3", value: "ready" },
            { key: "answer", value: "he" },
            { key: "explanation", value: "'He' replaces 'Tom'." },
          ],
        },
      ],
      questions: [
        { q: "Which is a pronoun?", options: ["they", "apple", "run", "blue"], answer: "they", explain: "It replaces a noun." },
        { q: "Replace the noun: 'Sarah lost Sarah's pen.'", options: ["Sarah lost her pen.", "Sarah lost pen pen.", "Sarah Sarah lost pen.", "Lost Sarah pen."], answer: "Sarah lost her pen.", explain: "'Her' replaces the repeated name." },
        { q: "Why use pronouns?", options: ["To avoid repeating nouns", "To make sentences longer", "To remove verbs", "They are required by law"], answer: "To avoid repeating nouns", explain: "Pronouns are shortcuts." },
        { q: "Which set are ALL pronouns?", options: ["he, she, it", "cat, dog, fish", "run, jump, hop", "red, blue, green"], answer: "he, she, it", explain: "These replace nouns." },
        { q: "'The team won. ___ was thrilled.' Best pronoun?", options: ["It", "Banana", "Quickly", "The"], answer: "It", explain: "'It' refers to the team." },
      ],
    },
    {
      topic: "Grammar",
      title: "Prepositions & Conjunctions",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Prepositions show place/time relationships (in, on, under); conjunctions join words or clauses (and, but, because).",
      blocks: [
        { type: "heading", text: "Glue Words" },
        {
          type: "text",
          text: "Prepositions show where or when something is, in relation to something else: in, on, under, beside, before, after. 'The cat is ON the mat' shows the cat's place.\n\nConjunctions are joining words. They glue words, phrases or whole clauses together: and, but, or, because, so, although. 'I went out BUT it rained' joins two ideas with a contrast.",
        },
        {
          type: "example",
          text: "'The book is UNDER the table BECAUSE it fell.' UNDER is a preposition (place); BECAUSE is a conjunction (reason).",
        },
        {
          type: "keyPoints",
          items: [
            "Prepositions show place/time (in, on, under).",
            "Conjunctions join (and, but, or, because).",
            "Prepositions usually come before a noun.",
            "Conjunctions can link whole sentences.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "in / on / under / beside", value: "Prepositions (place)" },
            { key: "before / after / during", value: "Prepositions (time)" },
            { key: "and / but / or", value: "Conjunctions (joining)" },
            { key: "because / so / although", value: "Conjunctions (clauses)" },
          ],
        },
      ],
      questions: [
        { q: "Which is a preposition? 'The cat sat on the chair.'", options: ["on", "sat", "cat", "chair"], answer: "on", explain: "Shows place." },
        { q: "Which is a conjunction?", options: ["because", "table", "happy", "run"], answer: "because", explain: "It joins clauses." },
        { q: "'I was tired ___ I went to bed.' Best word?", options: ["so", "under", "the", "blue"], answer: "so", explain: "'So' shows the result." },
        { q: "Prepositions usually show…", options: ["place or time relationships", "actions", "possession", "questions"], answer: "place or time relationships", explain: "Like in, on, under, before." },
        { q: "'The mouse hid UNDER the box.' UNDER is a…", options: ["preposition", "noun", "verb", "adverb"], answer: "preposition", explain: "Shows where the mouse is." },
      ],
    },

    // ===================== SENTENCE STRUCTURE (4) =====================
    {
      topic: "Sentence Structure",
      title: "Subjects & Predicates",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Every sentence has a subject (who/what it's about) and a predicate (what it says about the subject), which always contains the main verb.",
      blocks: [
        { type: "heading", text: "Two Halves of a Sentence" },
        {
          type: "text",
          text: "Every sentence splits into two halves. The subject is who or what the sentence is about. The predicate is what is said about the subject, and it always contains the main verb.\n\nIn 'The puppy chased its tail', 'The puppy' is the subject and 'chased its tail' is the predicate. Sentences read better when the subject is clear and the predicate is not too long.",
        },
        {
          type: "example",
          text: "'My older brother | drives a red car.' Subject = 'My older brother'. Predicate = 'drives a red car' (verb: drives).",
        },
        {
          type: "keyPoints",
          items: [
            "Subject = who/what the sentence is about.",
            "Predicate = what is said about the subject.",
            "The predicate always holds the main verb.",
            "A sentence is incomplete without both.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "In 'The car stopped suddenly', what is the subject?" },
            { key: "option_0", value: "The car" },
            { key: "option_1", value: "stopped" },
            { key: "option_2", value: "suddenly" },
            { key: "option_3", value: "the" },
            { key: "answer", value: "The car" },
            { key: "explanation", value: "The sentence is about the car." },
          ],
        },
      ],
      questions: [
        { q: "Which part always contains the main verb?", options: ["Predicate", "Subject", "Title", "Noun"], answer: "Predicate", explain: "The predicate tells what the subject does." },
        { q: "Subject of: 'The birds sang loudly.'", options: ["The birds", "sang", "loudly", "the"], answer: "The birds", explain: "The sentence is about the birds." },
        { q: "Predicate of: 'Tom | ate an apple.'", options: ["ate an apple", "Tom", "an", "apple"], answer: "ate an apple", explain: "It tells what Tom did." },
        { q: "Which is missing a predicate?", options: ["The big dog", "The big dog barked", "The big dog ran home", "The dog slept"], answer: "The big dog", explain: "No verb — incomplete." },
        { q: "Identify the verb in the predicate: 'She wrote a letter.'", options: ["wrote", "She", "letter", "a"], answer: "wrote", explain: "The predicate's main verb." },
      ],
    },
    {
      topic: "Sentence Structure",
      title: "Statements, Questions, Commands & Exclamations",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Sentences have four jobs: state a fact, ask, command, or exclaim — each with its own punctuation.",
      blocks: [
        { type: "heading", text: "Four Types of Sentence" },
        {
          type: "text",
          text: "Sentences do different jobs. A STATEMENT tells something and ends with a full stop: 'The sun is hot.' A QUESTION asks something and ends with a question mark: 'Is the sun hot?' A COMMAND gives an order: 'Close the door.' An EXCLAMATION shows strong feeling and ends with '!': 'What a huge sun!'\n\nPunctuation is the clue: .  ?  ! and the word order tell you which type it is.",
        },
        {
          type: "example",
          text: "'Leave now!' = command + exclamation. 'Do you like cake?' = question. 'I like cake.' = statement.",
        },
        {
          type: "keyPoints",
          items: [
            "Statement → states a fact, ends with .",
            "Question → asks, ends with ?",
            "Command → orders (often starts with a verb).",
            "Exclamation → strong feeling, ends with !",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "'Where is the key?' What type of sentence?" },
            { key: "option_0", value: "Question" },
            { key: "option_1", value: "Statement" },
            { key: "option_2", value: "Command" },
            { key: "option_3", value: "Exclamation" },
            { key: "answer", value: "Question" },
            { key: "explanation", value: "It asks and ends with ?" },
          ],
        },
      ],
      questions: [
        { q: "'Open the window.' What type?", options: ["Command", "Question", "Statement", "Exclamation"], answer: "Command", explain: "It gives an order." },
        { q: "Which ends with a question mark?", options: ["Are you ready?", "I am ready.", "Get ready!", "Ready."], answer: "Are you ready?", explain: "Questions end with ?" },
        { q: "'What a beautiful day!' is a/an…", options: ["Exclamation", "Question", "Command", "Statement"], answer: "Exclamation", explain: "Strong feeling + !." },
        { q: "Which is a STATEMENT?", options: ["The sky is blue.", "Is the sky blue?", "Look at the sky!", "Sky the blue?"], answer: "The sky is blue.", explain: "States a fact, ends with ." },
        { q: "Commands often begin with a…", options: ["verb", "question mark", "noun only", "full stop"], answer: "verb", explain: "e.g. 'Close the door.'" },
      ],
    },
    {
      topic: "Sentence Structure",
      title: "Simple & Compound Sentences",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "A simple sentence has one clause; a compound sentence joins two clauses with words like and, but, or.",
      blocks: [
        { type: "heading", text: "Building Bigger Sentences" },
        {
          type: "text",
          text: "A simple sentence has one subject and one verb (one clause): 'The dog barked.' A compound sentence joins two complete clauses with a joining word (conjunction) like and, but, or, so: 'The dog barked, and the cat ran.'\n\nEach half of a compound sentence could stand alone as a sentence. The comma before the joining word helps the reader pause.",
        },
        {
          type: "example",
          text: "Simple: 'I was hungry.' Compound: 'I was hungry, so I made a sandwich.' Two clauses joined by 'so'.",
        },
        {
          type: "keyPoints",
          items: [
            "Simple sentence = one clause.",
            "Compound = two clauses joined by and/but/or/so.",
            "Each clause in a compound could stand alone.",
            "Use a comma before the joining word.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is a COMPOUND sentence?" },
            { key: "option_0", value: "I ran, but I was late." },
            { key: "option_1", value: "I ran quickly." },
            { key: "option_2", value: "Running is fun." },
            { key: "option_3", value: "I like to run." },
            { key: "answer", value: "I ran, but I was late." },
            { key: "explanation", value: "Two clauses joined by 'but'." },
          ],
        },
      ],
      questions: [
        { q: "Which is a SIMPLE sentence?", options: ["The bird sang.", "The bird sang, and I listened.", "Although tired, he ran.", "Because it rained, we left."], answer: "The bird sang.", explain: "One clause only." },
        { q: "Join with a conjunction: 'I was tired. I kept going.'", options: ["I was tired, but I kept going.", "I was tired I kept going.", "Tired kept going.", "I was tired but."], answer: "I was tired, but I kept going.", explain: "'But' joins the two clauses." },
        { q: "Compound sentences use words like…", options: ["and, but, or, so", "in, on, under", "he, she, it", "red, blue, green"], answer: "and, but, or, so", explain: "These conjunctions join clauses." },
        { q: "How many clauses in a simple sentence?", options: ["One", "Two", "Three", "Zero"], answer: "One", explain: "Simple = one clause." },
        { q: "'She laughed, and he smiled.' The comma goes…", options: ["before 'and'", "after 'and'", "nowhere", "at the very start"], answer: "before 'and'", explain: "Comma before the joining word." },
      ],
    },
    {
      topic: "Sentence Structure",
      title: "Complex Sentences (Clauses)",
      difficulty: "beginner",
      minutes: 14,
      points: 80,
      summary: "A complex sentence joins a main clause with a subordinate clause (which can't stand alone), using words like because, although, when.",
      blocks: [
        { type: "heading", text: "Main + Subordinate" },
        {
          type: "text",
          text: "A complex sentence has two kinds of clause. A main clause makes sense on its own: 'I went home.' A subordinate clause does not make sense alone: 'because I was tired.' Together: 'I went home because I was tired.'\n\nSubordinate clauses start with words like because, although, when, if, since, while. If the subordinate clause comes first, use a comma: 'Because I was tired, I went home.'",
        },
        {
          type: "example",
          text: "'When the bell rang, the class filed out.' Subordinate clause first ('When the bell rang'), main clause second ('the class filed out'), comma between.",
        },
        {
          type: "keyPoints",
          items: [
            "Main clause = can stand alone.",
            "Subordinate clause = cannot stand alone.",
            "Subordinators: because, although, when, if, since.",
            "Comma if the subordinate clause comes first.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is a COMPLEX sentence?" },
            { key: "option_0", value: "I stayed in because it rained." },
            { key: "option_1", value: "I stayed in." },
            { key: "option_2", value: "I stayed in, and I read." },
            { key: "option_3", value: "Stay inside!" },
            { key: "answer", value: "I stayed in because it rained." },
            { key: "explanation", value: "Main clause + subordinate 'because it rained'." },
          ],
        },
      ],
      questions: [
        { q: "Which is a subordinate clause?", options: ["because it rained", "I went home", "She laughed", "The dog barked"], answer: "because it rained", explain: "It cannot stand alone." },
        { q: "Which starts a subordinate clause?", options: ["because", "and", "but", "or"], answer: "because", explain: "'Because' subordinates." },
        { q: "'Although it was late, he kept reading.' Comma because…", options: ["subordinate clause comes first", "it is a question", "there is no verb", "it ends with !"], answer: "subordinate clause comes first", explain: "Comma after a leading subordinate clause." },
        { q: "A main clause can…", options: ["stand alone as a sentence", "never have a verb", "only be one word", "end with a hyphen"], answer: "stand alone as a sentence", explain: "Main clauses are complete." },
        { q: "Which is complex?", options: ["If you go, I will too.", "Go now.", "I went, and I saw.", "Run!"], answer: "If you go, I will too.", explain: "Subordinate 'If you go' + main 'I will too'." },
      ],
    },

    // ===================== READING COMPREHENSION (5) =====================
    {
      topic: "Reading Comprehension",
      title: "Finding the Main Idea",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "The main idea is what a paragraph is mostly about; the other sentences give supporting details.",
      blocks: [
        { type: "heading", text: "The Heart of the Paragraph" },
        {
          type: "text",
          text: "The main idea is what a paragraph or passage is mostly about. The other sentences give details, examples or evidence that support it. To find the main idea, ask: what one thing is the writer trying to tell me here?\n\nClue words often signal it: 'The most important reason…', 'Overall…', 'In short…'. If you can sum up the paragraph in one sentence, you have found the main idea.",
        },
        {
          type: "example",
          text: "Paragraph: 'Bees are vital for farming. They pollinate crops like apples and almonds. Without bees, many foods would disappear.' Main idea: Bees are essential to growing our food.",
        },
        {
          type: "keyPoints",
          items: [
            "Main idea = what the text is MOSTLY about.",
            "Other sentences are supporting details.",
            "Look for clue words: 'overall', 'most important'.",
            "Sum it up in one sentence.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Main idea of a paragraph is…" },
            { key: "option_0", value: "what it is mostly about" },
            { key: "option_1", value: "the first word" },
            { key: "option_2", value: "the longest sentence" },
            { key: "option_3", value: "the title of the book" },
            { key: "answer", value: "what it is mostly about" },
            { key: "explanation", value: "The central point; details support it." },
          ],
        },
      ],
      questions: [
        { q: "The main idea is…", options: ["the central point", "the first word", "a supporting detail", "the page number"], answer: "the central point", explain: "It is the heart of the text." },
        { q: "Which clue often signals the main idea?", options: ["'The most important reason…'", "'and'", "'the'", "'a'"], answer: "'The most important reason…'", explain: "Such phrases introduce the central point." },
        { q: "Other sentences in the paragraph are usually…", options: ["supporting details", "main ideas", "questions", "titles"], answer: "supporting details", explain: "They back up the main idea." },
        { q: "Best way to check you found the main idea?", options: ["Sum the paragraph in one sentence", "Count the words", "Read the page number", "Skip the paragraph"], answer: "Sum the paragraph in one sentence", explain: "If you can, you've got it." },
        { q: "'Bats sleep by day and hunt by night.' This sentence is mostly about…", options: ["bats' daily routine", "the weather", "birds", "dinosaurs"], answer: "bats' daily routine", explain: "The main idea is bats' day/night habits." },
      ],
    },
    {
      topic: "Reading Comprehension",
      title: "Supporting Details",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Supporting details are facts, examples or reasons that back up the main idea.",
      blocks: [
        { type: "heading", text: "Proving the Point" },
        {
          type: "text",
          text: "Supporting details are the proof. They give facts, examples, statistics or reasons that make the main idea believable and interesting. A strong paragraph has a clear main idea plus several strong details.\n\nWhen you read, ask: which sentence is the main idea, and which ones support it? Spotting details helps you remember and explain what you read.",
        },
        {
          type: "example",
          text: "Main idea: 'Exercise is good for you.' Details: 'It strengthens your heart. It boosts your mood. It helps you sleep.' Each detail backs the main idea.",
        },
        {
          type: "keyPoints",
          items: [
            "Details back up the main idea.",
            "They can be facts, examples, stats or reasons.",
            "Strong writing has clear details.",
            "Details make ideas believable.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Main idea: 'Owls are expert hunters.' Which is a supporting detail?" },
            { key: "option_0", value: "They can fly silently to surprise prey." },
            { key: "option_1", value: "Owls are birds." },
            { key: "option_2", value: "I like animals." },
            { key: "option_3", value: "The end." },
            { key: "answer", value: "They can fly silently to surprise prey." },
            { key: "explanation", value: "This fact supports their hunting skill." },
          ],
        },
      ],
      questions: [
        { q: "Supporting details do what?", options: ["Back up the main idea", "Replace the title", "Confuse readers", "End the story"], answer: "Back up the main idea", explain: "They give proof." },
        { q: "Which could be a supporting detail?", options: ["A statistic", "A full stop", "A title page", "A chapter number"], answer: "A statistic", explain: "Numbers/facts support claims." },
        { q: "Main idea: 'Rainforests are rich habitats.' Best detail?", options: ["They hold millions of species.", "Rain is wet.", "I went once.", "Forests are big."], answer: "They hold millions of species.", explain: "Specific evidence for 'rich'." },
        { q: "Details make a main idea more…", options: ["believable and interesting", "wrong", "invisible", "short"], answer: "believable and interesting", explain: "Proof strengthens ideas." },
        { q: "Weak writing often lacks…", options: ["supporting details", "nouns", "full stops", "subjects"], answer: "supporting details", explain: "Vague claims lack proof." },
      ],
    },
    {
      topic: "Reading Comprehension",
      title: "Making Inferences",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "An inference is a smart guess using clues in the text plus what you already know.",
      blocks: [
        { type: "heading", text: "Reading Between the Lines" },
        {
          type: "text",
          text: "Sometimes a writer does not say something directly — they leave clues. An inference is a conclusion you draw from text clues + your own knowledge. 'Sam grabbed an umbrella and sighed at the grey sky.' The text never says 'rain', but you infer it.\n\nGood readers infer feelings, settings, motives and what might happen next. Always point to the clue that supports your inference.",
        },
        {
          type: "example",
          text: "'Lia slammed her book, crossed her arms, and glared.' Inference: Lia is angry. Clues: slamming, crossed arms, glaring.",
        },
        {
          type: "keyPoints",
          items: [
            "Inference = text clues + what you know.",
            "Writers imply; readers infer.",
            "Point to the clue that supports your idea.",
            "Inferences are smart guesses, not wild ones.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "'Tom shivered and rubbed his hands.' What can you infer?" },
            { key: "option_0", value: "Tom is cold" },
            { key: "option_1", value: "Tom is angry" },
            { key: "option_2", value: "Tom is asleep" },
            { key: "option_3", value: "Tom is hungry" },
            { key: "answer", value: "Tom is cold" },
            { key: "explanation", value: "Shivering + rubbing hands are cold-clues." },
          ],
        },
      ],
      questions: [
        { q: "An inference uses…", options: ["text clues + your knowledge", "only guesses", "only the title", "nothing"], answer: "text clues + your knowledge", explain: "Combine clues with what you know." },
        { q: "'She wiped a tear and smiled bravely.' Infer her feeling.", options: ["Sad but trying to be strong", "Angry", "Bored", "Asleep"], answer: "Sad but trying to be strong", explain: "Tear + brave smile." },
        { q: "Writers imply; readers…", options: ["infer", "ignore", "erase", "shout"], answer: "infer", explain: "Readers draw the conclusion." },
        { q: "A good inference is supported by…", options: ["a clue in the text", "a random guess", "the page number", "the cover price"], answer: "a clue in the text", explain: "Always cite the evidence." },
        { q: "'The pavement glistened and smelled fresh.' Infer the weather.", options: ["It just rained", "It is snowing", "It is sunny", "It is windy"], answer: "It just rained", explain: "Wet pavement + fresh smell." },
      ],
    },
    {
      topic: "Reading Comprehension",
      title: "Fact vs Opinion",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "A fact can be proven true or false; an opinion is a belief or feeling that cannot be proven.",
      blocks: [
        { type: "heading", text: "True or Just Believed?" },
        {
          type: "text",
          text: "A fact is a statement that can be proven true or false with evidence: 'Water boils at 100°C at sea level.' An opinion is a belief, feeling or judgement that cannot be proven: 'Pizza is the tastiest food.'\n\nOpinion words give it away: best, worst, beautiful, should, believe. Facts stay neutral and checkable. Knowing the difference stops us being misled.",
        },
        {
          type: "example",
          text: "Fact: 'Mount Everest is the tallest mountain above sea level.' Opinion: 'Mount Everest is the most beautiful mountain.'",
        },
        {
          type: "keyPoints",
          items: [
            "Fact = can be proven.",
            "Opinion = a belief or feeling.",
            "Opinion words: best, worst, should, beautiful.",
            "Facts use neutral, checkable language.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is an OPINION?" },
            { key: "option_0", value: "Ice cream is the best dessert." },
            { key: "option_1", value: "Water freezes at 0°C." },
            { key: "option_2", value: "Paris is in France." },
            { key: "option_3", value: "A week has 7 days." },
            { key: "answer", value: "Ice cream is the best dessert." },
            { key: "explanation", value: "'Best' is a judgement — cannot be proven." },
          ],
        },
      ],
      questions: [
        { q: "Which is a FACT?", options: ["The Earth orbits the Sun.", "Sunsets are gorgeous.", "Chocolate is yucky.", "Maths is the best subject."], answer: "The Earth orbits the Sun.", explain: "Provable by astronomy." },
        { q: "Which is an OPINION?", options: ["Summer is the most fun season.", "Summer follows spring.", "Summer has 3 months in places.", "Temperatures rise in summer."], answer: "Summer is the most fun season.", explain: "'Most fun' is a judgement." },
        { q: "Opinion clue words include…", options: ["best, worst, should", "in, on, under", "he, she, it", "add, subtract"], answer: "best, worst, should", explain: "Judgement words." },
        { q: "A fact can be…", options: ["proven true or false", "felt only", "ignored", "an emotion"], answer: "proven true or false", explain: "Facts are checkable." },
        { q: "'Dogs make the best pets.' This is…", options: ["opinion", "fact", "command", "question"], answer: "opinion", explain: "'Best' is a judgement." },
      ],
    },
    {
      topic: "Reading Comprehension",
      title: "Author's Purpose",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Authors write to persuade, inform, or entertain (PIE). Spotting the purpose helps you read smart.",
      blocks: [
        { type: "heading", text: "Why Did They Write This?" },
        {
          type: "text",
          text: "Every writer has a purpose. Remember PIE: Persuade (make you think/act a certain way), Inform (give facts), Entertain (tell a fun story). Ads usually persuade; textbooks inform; novels entertain.\n\nAsking 'why did they write this?' helps you judge a text. A persuasive piece may bend the facts; an informative one should stay neutral; an entertaining one cares about your enjoyment.",
        },
        {
          type: "example",
          text: "A recipe 'how to bake bread' = inform. A poster 'Buy CoolCola — the tastiest!' = persuade. A comic about a superhero = entertain.",
        },
        {
          type: "keyPoints",
          items: [
            "P = Persuade (change minds).",
            "I = Inform (give facts).",
            "E = Entertain (tell a story).",
            "Some texts mix purposes.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "P — Persuade: convince the reader" },
            { key: "2", value: "I — Inform: share facts" },
            { key: "3", value: "E — Entertain: tell an enjoyable story" },
          ],
        },
      ],
      questions: [
        { q: "A advert saying 'Vote for me!' is mainly to…", options: ["Persuade", "Inform", "Entertain", "Question"], answer: "Persuade", explain: "It tries to change your actions." },
        { q: "A news report on a storm is mainly to…", options: ["Inform", "Persuade", "Entertain", "Confuse"], answer: "Inform", explain: "It gives facts about the storm." },
        { q: "A funny comic's purpose is to…", options: ["Entertain", "Inform", "Persuade", "Teach maths"], answer: "Entertain", explain: "Comics aim to amuse." },
        { q: "PIE stands for…", options: ["Persuade, Inform, Entertain", "Print, Ink, Erase", "Pen, Ink, Eraser", "Play, Invent, Eat"], answer: "Persuade, Inform, Entertain", explain: "The three main purposes." },
        { q: "A textbook chapter is mainly to…", options: ["Inform", "Persuade", "Entertain", "Advertise"], answer: "Inform", explain: "Textbooks teach facts." },
      ],
    },

    // ===================== VOCABULARY (4) =====================
    {
      topic: "Vocabulary",
      title: "Context Clues",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Use the words around a new word to figure out its meaning without a dictionary.",
      blocks: [
        { type: "heading", text: "Be a Word Detective" },
        {
          type: "text",
          text: "When you meet a new word, the sentence around it often explains it. These are context clues. Look for a definition nearby, a synonym (word that means the same), an antonym (opposite), or an example.\n\n'The slug was torpid, barely moving at all' — 'barely moving' tells you torpid means slow or sleepy. Good readers use context before reaching for a dictionary.",
        },
        {
          type: "example",
          text: "'The ship was immense, the biggest ever built.' 'The biggest ever built' is the context clue — immense means very large.",
        },
        {
          type: "keyPoints",
          items: [
            "Context = the words around a new word.",
            "Look for definitions, synonyms, antonyms.",
            "Examples ('such as…') are clues too.",
            "Use context before the dictionary.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "'The feast was enormous, the biggest meal I'd seen.' Enormous means?" },
            { key: "option_0", value: "Huge" },
            { key: "option_1", value: "Tiny" },
            { key: "option_2", value: "Tasty" },
            { key: "option_3", value: "Cold" },
            { key: "answer", value: "Huge" },
            { key: "explanation", value: "'Biggest meal' is the clue." },
          ],
        },
      ],
      questions: [
        { q: "'It was sweltering, so hot we melted.' Sweltering means?", options: ["Very hot", "Very cold", "Wet", "Loud"], answer: "Very hot", explain: "'So hot' is the clue." },
        { q: "Context clues are found…", options: ["around the word", "in another country", "never", "only in dictionaries"], answer: "around the word", explain: "Surrounding words give hints." },
        { q: "'He was generous, unlike his stingy brother.' Stingy means?", options: ["Not generous", "Very kind", "Tall", "Fast"], answer: "Not generous", explain: "Antonym clue: 'unlike generous'." },
        { q: "A synonym clue gives a word that…", options: ["means the same", "means the opposite", "rhymes", "is shorter"], answer: "means the same", explain: "Synonyms share meaning." },
        { q: "Best first move with a new word?", options: ["Read the sentence around it", "Skip the page", "Close the book", "Guess blindly"], answer: "Read the sentence around it", explain: "Context comes first." },
      ],
    },
    {
      topic: "Vocabulary",
      title: "Synonyms & Antonyms",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Synonyms mean the same (big/large); antonyms mean the opposite (big/small).",
      blocks: [
        { type: "heading", text: "Same and Opposite" },
        {
          type: "text",
          text: "A synonym is a word that means the same (or nearly the same) as another word: big/large/huge. An antonym means the opposite: hot/cold, light/dark.\n\nUsing synonyms avoids repeating words and makes writing shine. Knowing antonyms sharpens the exact meaning of a word by contrast.",
        },
        {
          type: "example",
          text: "Synonyms for 'happy': joyful, glad, delighted. Antonym of 'happy': sad. Swap 'happy' for 'joyful' to vary your writing.",
        },
        {
          type: "keyPoints",
          items: [
            "Synonyms mean the same.",
            "Antonyms mean the opposite.",
            "Synonyms avoid repetition.",
            "Antonyms sharpen meaning by contrast.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "Synonym of 'big'", value: "large / huge" },
            { key: "Antonym of 'hot'", value: "cold" },
            { key: "Synonym of 'fast'", value: "quick / rapid" },
            { key: "Antonym of 'light' (weight)", value: "heavy" },
            { key: "Synonym of 'smart'", value: "clever / bright" },
          ],
        },
      ],
      questions: [
        { q: "Which is a synonym for 'cold'?", options: ["Chilly", "Hot", "Warm", "Boiling"], answer: "Chilly", explain: "Means the same." },
        { q: "Antonym of 'ancient'?", options: ["Modern", "Old", "Aged", "Antique"], answer: "Modern", explain: "Opposite in time." },
        { q: "Synonyms help writers…", options: ["avoid repeating words", "add spelling mistakes", "remove verbs", "shorten sentences"], answer: "avoid repeating words", explain: "Variety improves writing." },
        { q: "Which pair are ANTONYMS?", options: ["generous / stingy", "big / large", "fast / quick", "smart / clever"], answer: "generous / stingy", explain: "Opposites." },
        { q: "Synonym of 'difficult'?", options: ["Hard", "Easy", "Soft", "Slow"], answer: "Hard", explain: "Same meaning." },
      ],
    },
    {
      topic: "Vocabulary",
      title: "Prefixes & Suffixes",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "A prefix goes at the start of a word (un-, re-); a suffix goes at the end (-ful, -less) to change its meaning.",
      blocks: [
        { type: "heading", text: "Word Building Blocks" },
        {
          type: "text",
          text: "A prefix is a group of letters added to the START of a word to change its meaning: un- means 'not' (happy → unhappy), re- means 'again' (do → redo). A suffix goes at the END: -ful means 'full of' (hope → hopeful), -less means 'without' (hope → hopeless).\n\nKnowing common prefixes and suffixes lets you unlock hundreds of new words without memorising each one.",
        },
        {
          type: "example",
          text: "Base word 'care'. +ful = careful (full of care). +less = careless (without care). re+care... but better: 'use' → reuse (use again), useless (without use).",
        },
        {
          type: "keyPoints",
          items: [
            "Prefix = start of word (un-, re-, pre-).",
            "Suffix = end of word (-ful, -less, -ly).",
            "un- = not, re- = again.",
            "-ful = full of, -less = without.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What does 'unhappy' mean?" },
            { key: "option_0", value: "Not happy" },
            { key: "option_1", value: "Very happy" },
            { key: "option_2", value: "Happy again" },
            { key: "option_3", value: "Without happy" },
            { key: "answer", value: "Not happy" },
            { key: "explanation", value: "un- = not." },
          ],
        },
      ],
      questions: [
        { q: "Prefix re- means…", options: ["again", "not", "before", "without"], answer: "again", explain: "e.g. redo = do again." },
        { q: "'Careless' means…", options: ["without care", "full of care", "care again", "care before"], answer: "without care", explain: "-less = without." },
        { q: "Which is a SUFFIX?", options: ["-ful", "un-", "re-", "pre-"], answer: "-ful", explain: "Suffixes go at the end." },
        { q: "'Redo' = …", options: ["do again", "not do", "do before", "do without"], answer: "do again", explain: "re- = again." },
        { q: "'Hopeful' = …", options: ["full of hope", "without hope", "hope again", "not hope"], answer: "full of hope", explain: "-ful = full of." },
      ],
    },
    {
      topic: "Vocabulary",
      title: "Homophones & Multiple-Meaning Words",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Homophones sound the same but differ in spelling/meaning (there/their/they're); multiple-meaning words have several definitions.",
      blocks: [
        { type: "heading", text: "Sound Alike, Mean Different" },
        {
          type: "text",
          text: "Homophones are words that sound the same but have different spellings and meanings: there (place), their (belonging), they're (they are). Choosing the right one makes your writing clear.\n\nSome words are multiple-meaning: 'bat' can be an animal or sports equipment; 'bark' is a tree's covering or a dog's sound. Use context to pick the right meaning.",
        },
        {
          type: "example",
          text: "'Their dog is over there, they're so happy.' Their = belonging; there = place; they're = they are.",
        },
        {
          type: "keyPoints",
          items: [
            "Homophones sound the same, differ in meaning.",
            "there = place, their = belonging, they're = they are.",
            "Multiple-meaning words have several definitions.",
            "Context picks the correct meaning.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is correct? '___ going to the park.'" },
            { key: "option_0", value: "They're" },
            { key: "option_1", value: "Their" },
            { key: "option_2", value: "There" },
            { key: "option_3", value: "Theirs" },
            { key: "answer", value: "They're" },
            { key: "explanation", value: "They're = they are." },
          ],
        },
      ],
      questions: [
        { q: "Pick the correct: 'Leave the bags over ___.'", options: ["there", "their", "they're", "theirs"], answer: "there", explain: "Place." },
        { q: "'___ books are new.'", options: ["Their", "There", "They're", "Theirs"], answer: "Their", explain: "Belonging." },
        { q: "Which is a multiple-meaning word?", options: ["bat", "blue (always)", "the", "and"], answer: "bat", explain: "Animal or equipment." },
        { q: "Homophones sound…", options: ["the same", "different", "loud", "quiet"], answer: "the same", explain: "Same sound, different meaning." },
        { q: "'I can ___ a bird. (see/sea)' Correct word?", options: ["see", "sea", "seas", "sees"], answer: "see", explain: "See = with your eyes." },
      ],
    },

    // ===================== WRITING (4) =====================
    {
      topic: "Writing",
      title: "Planning & Paragraphs",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Plan your main idea and supporting points first; build each point into its own paragraph with a topic sentence.",
      blocks: [
        { type: "heading", text: "Plan Before You Write" },
        {
          type: "text",
          text: "Good writing starts with a plan. Jot down your main idea, then list three points that support it. Each point becomes a short paragraph that opens with a topic sentence.\n\nPlanning stops you repeating yourself and keeps your reader interested. A clear beginning, middle and end is easier to write — and easier to read — than a jumble of thoughts.",
        },
        {
          type: "example",
          text: "Topic: 'Why I love football.' Plan: 1) It's fun. 2) It keeps me fit. 3) I love my team. Each becomes a paragraph.",
        },
        {
          type: "keyPoints",
          items: [
            "Plan your main idea + 3 points.",
            "One paragraph per point.",
            "Each paragraph starts with a topic sentence.",
            "Order: beginning, middle, end.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Plan your main idea and points" },
            { key: "2", value: "Write a topic sentence per paragraph" },
            { key: "3", value: "Add supporting details" },
            { key: "4", value: "Write a strong ending" },
          ],
        },
      ],
      questions: [
        { q: "First step in writing?", options: ["Plan your main idea and points", "Write the ending", "Count words", "Draw a picture"], answer: "Plan your main idea and points", explain: "Planning gives structure." },
        { q: "Each paragraph should…", options: ["cover one main point", "repeat the title", "have no full stops", "be one word"], answer: "cover one main point", explain: "One idea per paragraph." },
        { q: "A topic sentence usually goes…", options: ["at the start of a paragraph", "in the title", "at the very end of the piece", "nowhere"], answer: "at the start of a paragraph", explain: "It introduces the paragraph's idea." },
        { q: "Planning helps you avoid…", options: ["repeating yourself", "using paragraphs", "spelling", "reading"], answer: "repeating yourself", explain: "A plan keeps ideas distinct." },
        { q: "A clear piece has a beginning, a middle and a/an…", options: ["end", "title page", "index", "quiz"], answer: "end", explain: "Three clear parts." },
      ],
    },
    {
      topic: "Writing",
      title: "Strong Topic Sentences",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "A topic sentence states the main idea of a paragraph and grabs the reader's attention.",
      blocks: [
        { type: "heading", text: "Lead With Your Best Foot" },
        {
          type: "text",
          text: "A topic sentence is the first sentence of a paragraph and tells the reader what the paragraph is about. A strong one is clear, specific and interesting — it makes the reader want more.\n\nWeak: 'I will talk about dogs.' Strong: 'Dogs have helped humans for thousands of years.' The strong version gives a clear idea, not just an announcement.",
        },
        {
          type: "example",
          text: "Weak: 'This paragraph is about space.' Strong: 'Space is so silent that nothing can carry sound.' The strong one states a fascinating idea.",
        },
        {
          type: "keyPoints",
          items: [
            "Topic sentence = first sentence of a paragraph.",
            "It states the paragraph's main idea.",
            "Be specific, not just 'I will talk about…'.",
            "Hook the reader's interest.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which is the STRONGEST topic sentence?" },
            { key: "option_0", value: "Bees pollinate a third of the food we eat." },
            { key: "option_1", value: "I am going to write about bees." },
            { key: "option_2", value: "Bees are bugs." },
            { key: "option_3", value: "This paragraph is bees." },
            { key: "answer", value: "Bees pollinate a third of the food we eat." },
            { key: "explanation", value: "Clear, specific and interesting." },
          ],
        },
      ],
      questions: [
        { q: "A topic sentence usually appears…", options: ["at the start of a paragraph", "in the middle", "at the end only", "never"], answer: "at the start of a paragraph", explain: "It leads the paragraph." },
        { q: "Which is strongest?", options: ["Sharks have rows of sharp teeth that regrow.", "I will talk about sharks.", "Sharks are fish.", "This is sharks."], answer: "Sharks have rows of sharp teeth that regrow.", explain: "Specific and interesting." },
        { q: "Weak topic sentences often start with…", options: ["'I will talk about…'", "a strong fact", "a question hook", "a vivid image"], answer: "'I will talk about…'", explain: "Announcing is weak." },
        { q: "A topic sentence states the paragraph's…", options: ["main idea", "spelling", "title page", "font"], answer: "main idea", explain: "It is the paragraph's heart." },
        { q: "Strong topic sentences are…", options: ["clear, specific, interesting", "long and boring", "always questions", "two words"], answer: "clear, specific, interesting", explain: "All three qualities." },
      ],
    },
    {
      topic: "Writing",
      title: "Descriptive Writing",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "Use the five senses, strong adjectives and 'show, don't tell' to paint pictures with words.",
      blocks: [
        { type: "heading", text: "Show, Don't Tell" },
        {
          type: "text",
          text: "Descriptive writing paints a picture in the reader's mind. Use the five senses (sight, sound, smell, taste, touch), vivid adjectives and precise verbs. 'Show, don't tell': instead of 'It was cold', write 'My breath hung in the icy air.'\n\nStrong description chooses the best detail, not every detail. One perfect image beats a list of ordinary ones.",
        },
        {
          type: "example",
          text: "Tell: 'The market was busy.' Show: 'Stalls overflowed with gold oranges; vendors shouted prices over the clatter of carts.'",
        },
        {
          type: "keyPoints",
          items: [
            "Use the five senses.",
            "Pick vivid adjectives and precise verbs.",
            "'Show, don't tell'.",
            "Choose the BEST detail, not all details.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which 'shows' rather than 'tells'?" },
            { key: "option_0", value: "Her hands shook and her voice cracked." },
            { key: "option_1", value: "She was nervous." },
            { key: "option_2", value: "Nervousness happened." },
            { key: "option_3", value: "She felt a feeling." },
            { key: "answer", value: "Her hands shook and her voice cracked." },
            { key: "explanation", value: "It shows the nervousness with images." },
          ],
        },
      ],
      questions: [
        { q: "Good description uses the…", options: ["five senses", "one sense", "no senses", "only sight"], answer: "five senses", explain: "Sight, sound, smell, taste, touch." },
        { q: "'Show, don't tell' means…", options: ["use images, not labels", "draw pictures", "say the feeling's name", "skip details"], answer: "use images, not labels", explain: "Paint the picture." },
        { q: "Which is most descriptive?", options: ["The old house groaned in the wind.", "The house was old.", "A house.", "Houses exist."], answer: "The old house groaned in the wind.", explain: "Sound + personification." },
        { q: "Best description chooses…", options: ["the best detail", "every detail", "no detail", "the longest word"], answer: "the best detail", explain: "Quality over quantity." },
        { q: "'The cake smelled of warm cinnamon.' Which sense?", options: ["Smell", "Sight", "Touch", "Sound"], answer: "Smell", explain: "Cinnamon aroma." },
      ],
    },
    {
      topic: "Writing",
      title: "Narrative Story Structure",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "Most stories follow a shape: opening, build-up, problem (climax), resolution, ending.",
      blocks: [
        { type: "heading", text: "The Shape of a Story" },
        {
          type: "text",
          text: "Most stories have a structure. The OPENING introduces the characters and setting. The BUILD-UP develops events. The PROBLEM (or climax) is the exciting moment of trouble. The RESOLUTION solves it, and the ENDING wraps things up.\n\nFollowing this shape keeps a story exciting and complete. Without a problem, nothing happens; without a resolution, the reader feels cheated.",
        },
        {
          type: "example",
          text: "Opening: 'Mia found a map.' Build-up: 'She followed it into the woods.' Problem: 'A wolf blocked the path!' Resolution: 'She outsmarted it with a trail of berries.' Ending: 'She reached the treasure at dusk.'",
        },
        {
          type: "keyPoints",
          items: [
            "Opening = characters + setting.",
            "Build-up = events develop.",
            "Problem = the climax/trouble.",
            "Resolution + Ending = solve and wrap up.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Opening: introduce characters and setting" },
            { key: "2", value: "Build-up: events develop" },
            { key: "3", value: "Problem: the climax" },
            { key: "4", value: "Resolution: solve it" },
            { key: "5", value: "Ending: wrap up" },
          ],
        },
      ],
      questions: [
        { q: "Which comes FIRST in a story?", options: ["Opening", "Problem", "Resolution", "Ending"], answer: "Opening", explain: "Introduce characters + setting." },
        { q: "The exciting moment of trouble is the…", options: ["Problem (climax)", "Opening", "Ending", "Title"], answer: "Problem (climax)", explain: "The peak tension." },
        { q: "Without a resolution, the reader feels…", options: ["cheated", "bored only", "asleep", "happy"], answer: "cheated", explain: "Stories need solutions." },
        { q: "The opening introduces…", options: ["characters and setting", "the solution", "the climax", "the credits"], answer: "characters and setting", explain: "It sets the scene." },
        { q: "Order: opening, build-up, problem, resolution, …", options: ["ending", "title", "preface", "index"], answer: "ending", explain: "The ending wraps up." },
      ],
    },
  ],
};

import type { SubjectCurriculum } from "./types";
import { sim } from "./types";

export const science: SubjectCurriculum = {
  slug: "science",
  lessons: [
    // ===================== HUMAN BODY (5) =====================
    {
      topic: "Human Body",
      title: "The Heart & Blood",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "The heart is a muscle that pumps blood around the body through tubes called blood vessels, delivering oxygen and food to cells.",
      blocks: [
        { type: "heading", text: "Your Body's Pump" },
        {
          type: "text",
          text: "Your heart is a muscle about the size of your fist. It pumps blood around your body through tubes called blood vessels. Blood carries oxygen and food to every cell and carries waste away.\n\nThe heart has two sides. The right side sends blood to the lungs to collect oxygen; the left side pumps that oxygen-rich blood to the rest of you. It beats about 100,000 times a day without you ever thinking about it.",
        },
        {
          type: "example",
          text: "Trace the journey: body → right heart → lungs (pick up O₂) → left heart → body (deliver O₂). One full loop is called circulation.",
        },
        {
          type: "keyPoints",
          items: [
            "The heart is a muscle that pumps blood.",
            "Blood vessels are the tubes (arteries, veins).",
            "Blood carries oxygen and food to cells.",
            "Right heart → lungs; left heart → body.",
          ],
        },
        sim("heart", "How the Heart Pumps Blood"),
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What does blood carry TO your cells?" },
            { key: "option_0", value: "Oxygen and food" },
            { key: "option_1", value: "Only water" },
            { key: "option_2", value: "Nothing" },
            { key: "option_3", value: "Bones" },
            { key: "answer", value: "Oxygen and food" },
            { key: "explanation", value: "Blood delivers oxygen and nutrients, and removes waste." },
          ],
        },
      ],
      questions: [
        { q: "The heart is a…", options: ["muscle", "bone", "blood vessel", "nerve"], answer: "muscle", explain: "It is cardiac muscle." },
        { q: "Where does blood go to collect oxygen?", options: ["The lungs", "The stomach", "The brain", "The feet"], answer: "The lungs", explain: "The right heart sends blood to the lungs." },
        { q: "Blood vessels are…", options: ["tubes that carry blood", "bones", "muscles", "nerves"], answer: "tubes that carry blood", explain: "Arteries and veins." },
        { q: "Which side pumps oxygen-rich blood to the body?", options: ["Left", "Right", "Top", "Bottom"], answer: "Left", explain: "The left side handles oxygen-rich blood." },
        { q: "About how many times does the heart beat per day?", options: ["100,000", "100", "10", "1 million times a minute"], answer: "100,000", explain: "Roughly 100,000 beats/day." },
      ],
    },
    {
      topic: "Human Body",
      title: "The Lungs & Breathing",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "The lungs take in oxygen from the air and remove carbon dioxide, in a cycle called respiration.",
      blocks: [
        { type: "heading", text: "In With the Good, Out With the Bad" },
        {
          type: "text",
          text: "You breathe in to bring air into your lungs. The lungs pass oxygen into your blood and take carbon dioxide (a waste gas) out. When you breathe out, the carbon dioxide leaves your body.\n\nAir enters through your nose or mouth, travels down the windpipe (trachea), and into the lungs. Tiny air sacs called alveoli are where the swap of gases happens.",
        },
        {
          type: "example",
          text: "Breathe in → O₂ enters blood. Blood delivers O₂ to cells. Cells make CO₂ as waste. CO₂ returns to lungs. Breathe out → CO₂ leaves.",
        },
        {
          type: "keyPoints",
          items: [
            "Lungs take in O₂, remove CO₂.",
            "Air travels: nose/mouth → trachea → lungs.",
            "Alveoli are the tiny air sacs.",
            "Breathing in + out = respiration cycle.",
          ],
        },
        sim("lungs", "Breathing Simulator"),
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What gas do you breathe OUT?" },
            { key: "option_0", value: "Carbon dioxide" },
            { key: "option_1", value: "Oxygen" },
            { key: "option_2", value: "Helium" },
            { key: "option_3", value: "Nitrogen only" },
            { key: "answer", value: "Carbon dioxide" },
            { key: "explanation", value: "CO₂ is the waste gas you exhale." },
          ],
        },
      ],
      questions: [
        { q: "Which gas do you breathe IN mostly to use?", options: ["Oxygen", "Carbon dioxide", "Helium", "Smoke"], answer: "Oxygen", explain: "O₂ is what cells need." },
        { q: "The tube air travels down is the…", options: ["trachea (windpipe)", "spine", "vein", "tongue"], answer: "trachea (windpipe)", explain: "Then into the lungs." },
        { q: "Tiny air sacs in the lungs are called…", options: ["alveoli", "neurons", "cells", "vessels"], answer: "alveoli", explain: "Gas swap happens there." },
        { q: "What waste gas leaves when you exhale?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: "Carbon dioxide", explain: "Cells produce CO₂." },
        { q: "Lungs swap gases with the…", options: ["blood", "bones", "muscles", "teeth"], answer: "blood", explain: "O₂ in, CO₂ out." },
      ],
    },
    {
      topic: "Human Body",
      title: "Bones & Muscles",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Bones form the skeleton that holds you up; muscles pull on bones to create movement.",
      blocks: [
        { type: "heading", text: "Frame and Movers" },
        {
          type: "text",
          text: "Your skeleton is made of 206 bones that give your body shape, protect organs and let you move. The skull protects the brain; the ribcage shields the heart and lungs.\n\nMuscles attach to bones and pull them to create movement. They work in pairs: when one contracts (shortens), the other relaxes. You have over 600 muscles, including the ones you control (skeletal) and ones that work on their own, like the heart.",
        },
        {
          type: "example",
          text: "To bend your elbow: the biceps contract (shorten) while the triceps relax. To straighten, the triceps contract and the biceps relax.",
        },
        {
          type: "keyPoints",
          items: [
            "Adult skeleton = 206 bones.",
            "Bones give shape and protect organs.",
            "Muscles pull bones to move them.",
            "Muscles work in opposing pairs.",
          ],
        },
        sim("skeleton", "Bones & Muscles in Motion"),
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "Protects the brain", value: "Skull" },
            { key: "Shields heart and lungs", value: "Ribcage" },
            { key: "Number of bones (adult)", value: "206" },
            { key: "How muscles move bones", value: "By pulling (contracting)" },
          ],
        },
      ],
      questions: [
        { q: "How many bones in an adult skeleton?", options: ["206", "100", "50", "Over 1000"], answer: "206", explain: "Adults have 206." },
        { q: "Which protects the brain?", options: ["Skull", "Ribcage", "Spine", "Pelvis"], answer: "Skull", explain: "The skull encases the brain." },
        { q: "Muscles move bones by…", options: ["pulling", "pushing only", "melting", "growing"], answer: "pulling", explain: "They contract and pull." },
        { q: "The ribcage protects the…", options: ["heart and lungs", "brain", "feet", "teeth"], answer: "heart and lungs", explain: "It cages the chest." },
        { q: "Muscles often work in…", options: ["opposing pairs", "threes", "singles only", "hundreds"], answer: "opposing pairs", explain: "One contracts, one relaxes." },
      ],
    },
    {
      topic: "Human Body",
      title: "The Digestive System",
      difficulty: "beginner",
      minutes: 14,
      points: 80,
      summary: "Digestion breaks food into nutrients the body can use, passing it through mouth, stomach and intestines.",
      blocks: [
        { type: "heading", text: "Food's Journey" },
        {
          type: "text",
          text: "Digestion is how your body breaks food into nutrients it can use. It starts in the mouth, where teeth grind food and saliva begins to break it down. The food travels down the gullet to the stomach, where acids turn it into a mush.\n\nNext, the small intestine absorbs the nutrients into the blood. The large intestine takes back water, and what is left leaves the body as waste.",
        },
        {
          type: "example",
          text: "Eat an apple → mouth chews + saliva → stomach acid breaks it down → small intestine absorbs sugars → large intestine reclaims water → waste exits.",
        },
        {
          type: "keyPoints",
          items: [
            "Mouth: teeth + saliva start digestion.",
            "Stomach: acid breaks food into mush.",
            "Small intestine: absorbs nutrients.",
            "Large intestine: reclaims water.",
          ],
        },
        sim("digestive", "Food's Journey"),
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Mouth: chew and mix with saliva" },
            { key: "2", value: "Stomach: acid breaks food down" },
            { key: "3", value: "Small intestine: absorb nutrients" },
            { key: "4", value: "Large intestine: reclaim water" },
          ],
        },
      ],
      questions: [
        { q: "Where does digestion begin?", options: ["The mouth", "The stomach", "The lungs", "The brain"], answer: "The mouth", explain: "Teeth + saliva start it." },
        { q: "Which organ absorbs nutrients into the blood?", options: ["Small intestine", "Lungs", "Heart", "Brain"], answer: "Small intestine", explain: "Nutrients enter the blood here." },
        { q: "The stomach uses…to break down food.", options: ["acid", "bones", "air", "light"], answer: "acid", explain: "Stomach acid." },
        { q: "What does the large intestine mainly do?", options: ["Reclaims water", "Pumps blood", "Stores memories", "Makes bones"], answer: "Reclaims water", explain: "It reabsorbs water." },
        { q: "Order: mouth, stomach, small intestine, …", options: ["large intestine", "lungs", "heart", "brain"], answer: "large intestine", explain: "Last major stop." },
      ],
    },
    {
      topic: "Human Body",
      title: "The Brain & Nerves",
      difficulty: "beginner",
      minutes: 14,
      points: 80,
      summary: "The brain is the body's control centre; nerves carry messages between the brain and the rest of the body.",
      blocks: [
        { type: "heading", text: "Command Central" },
        {
          type: "text",
          text: "Your brain is the control centre of your body. It thinks, stores memories, controls movement and keeps your organs working — all without you noticing. The spinal cord runs down your back and carries messages between the brain and body.\n\nNerves branch out to every part of you. They carry signals at incredible speeds: when you touch something hot, a nerve flashes a message to the brain, which sends back 'move your hand!' — all in a split second.",
        },
        {
          type: "example",
          text: "Touch a hot pan: nerves in your fingers send a pain signal up the spinal cord to the brain. The brain sends back 'pull away!' — and you do, almost instantly.",
        },
        {
          type: "keyPoints",
          items: [
            "Brain = the body's control centre.",
            "Spinal cord carries messages.",
            "Nerves branch throughout the body.",
            "Signals travel extremely fast.",
          ],
        },
        sim("brain", "Nerve Signal Reflex"),
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What carries messages between brain and body?" },
            { key: "option_0", value: "Nerves (and spinal cord)" },
            { key: "option_1", value: "Blood vessels" },
            { key: "option_2", value: "Bones" },
            { key: "option_3", value: "Muscles" },
            { key: "answer", value: "Nerves (and spinal cord)" },
            { key: "explanation", value: "Nerves are the body's wiring." },
          ],
        },
      ],
      questions: [
        { q: "The body's control centre is the…", options: ["brain", "heart", "lungs", "stomach"], answer: "brain", explain: "It runs everything." },
        { q: "The spinal cord runs down your…", options: ["back", "arm", "leg only", "neck only"], answer: "back", explain: "Inside the spine." },
        { q: "Nerves carry…", options: ["messages", "blood", "acid", "bones"], answer: "messages", explain: "Electrical signals." },
        { q: "Touching something hot triggers a…", options: ["fast reflex", "slow heartbeat", "deep sleep", "meal"], answer: "fast reflex", explain: "Nerves flash messages fast." },
        { q: "The brain stores…", options: ["memories", "blood", "acid", "water"], answer: "memories", explain: "And controls thought." },
      ],
    },

    // ===================== ELECTRICITY (5) =====================
    {
      topic: "Electricity",
      title: "What Is Electricity?",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Electricity is the flow of tiny particles called electrons through a material, carrying energy.",
      blocks: [
        { type: "heading", text: "The Flow of Electrons" },
        {
          type: "text",
          text: "Electricity is the flow of tiny particles called electrons. Everything is made of atoms, and electrons are part of atoms. When electrons move in the same direction, we get an electric current — a flow of energy we can use.\n\nWe measure current in amps (A), the push that drives it in volts (V), and how much a material resists it in ohms (Ω). Electricity powers lights, phones and machines.",
        },
        {
          type: "example",
          text: "A battery provides the push (voltage) that drives electrons through a wire. The moving electrons are the current that lights a bulb.",
        },
        {
          type: "keyPoints",
          items: [
            "Electricity = flow of electrons.",
            "Current measured in amps (A).",
            "Voltage (push) measured in volts (V).",
            "Resistance measured in ohms (Ω).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What tiny moving particles make an electric current?" },
            { key: "option_0", value: "Electrons" },
            { key: "option_1", value: "Atoms" },
            { key: "option_2", value: "Drops of water" },
            { key: "option_3", value: "Light beams" },
            { key: "answer", value: "Electrons" },
            { key: "explanation", value: "Moving electrons = current." },
          ],
        },
      ],
      questions: [
        { q: "Electric current is the flow of…", options: ["electrons", "water", "air", "heat"], answer: "electrons", explain: "Electrons moving together." },
        { q: "Voltage is measured in…", options: ["volts (V)", "amps", "ohms", "watts"], answer: "volts (V)", explain: "The 'push'." },
        { q: "Current is measured in…", options: ["amps (A)", "volts", "metres", "grams"], answer: "amps (A)", explain: "Rate of flow." },
        { q: "Electrons are part of…", options: ["atoms", "water", "sunlight", "sound"], answer: "atoms", explain: "They orbit the nucleus." },
        { q: "Resistance is measured in…", options: ["ohms (Ω)", "volts", "amps", "newtons"], answer: "ohms (Ω)", explain: "How much a material resists flow." },
      ],
    },
    {
      topic: "Electricity",
      title: "Simple Circuits",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Electricity only flows around a complete loop (a circuit) made of a power source, wires and a component.",
      blocks: [
        { type: "heading", text: "Close the Loop" },
        {
          type: "text",
          text: "Electricity only flows around a complete loop called a circuit. A simple circuit needs a power source (like a battery), wires to carry the current, and something that uses the power (like a bulb).\n\nIf there is a gap anywhere in the loop, the current stops and the bulb goes out. A switch works by opening and closing that gap — off means the loop is broken, on means it is complete.",
        },
        {
          type: "example",
          text: "Battery → wire → bulb → wire → back to battery. A complete loop. Flip a switch to open a gap → bulb off. Close it → bulb on.",
        },
        {
          type: "keyPoints",
          items: [
            "A circuit must be a complete loop.",
            "Needs power source + wires + component.",
            "A gap stops the current.",
            "Switches open/close the loop.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is needed for current to flow?" },
            { key: "option_0", value: "A complete circuit" },
            { key: "option_1", value: "A bright bulb" },
            { key: "option_2", value: "Two switches" },
            { key: "option_3", value: "Sunlight" },
            { key: "answer", value: "A complete circuit" },
            { key: "explanation", value: "Electricity needs an unbroken loop." },
          ],
        },
      ],
      questions: [
        { q: "A circuit must be a…", options: ["complete loop", "open line", "single wire", "broken path"], answer: "complete loop", explain: "Unbroken path." },
        { q: "A switch in the OFF position…", options: ["breaks the circuit", "brightens the bulb", "does nothing", "saves battery only"], answer: "breaks the circuit", explain: "It opens a gap." },
        { q: "Which is NOT needed in a simple circuit?", options: ["A magnet", "A power source", "Wires", "A component (e.g. bulb)"], answer: "A magnet", explain: "Not required." },
        { q: "If a wire is cut, the bulb will…", options: ["go out", "get brighter", "explode", "stay the same"], answer: "go out", explain: "The loop is broken." },
        { q: "A battery provides the…", options: ["push (voltage)", "light", "sound", "heat only"], answer: "push (voltage)", explain: "It drives the current." },
      ],
    },
    {
      topic: "Electricity",
      title: "Conductors & Insulators",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Conductors let electricity flow easily (metals); insulators block it (plastic, rubber, wood).",
      blocks: [
        { type: "heading", text: "Let It Flow or Stop It" },
        {
          type: "text",
          text: "A conductor is a material that lets electricity flow through it easily. Most metals are good conductors — that is why wires are made of copper. An insulator is a material that does not let electricity flow; plastic, rubber, glass and wood are insulators.\n\nThis is why wires are copper (conductor) on the inside and plastic (insulator) on the outside: the copper carries the current, and the plastic keeps it safely away from you.",
        },
        {
          type: "example",
          text: "Test items in a circuit: a metal paperclip → bulb lights (conductor). A plastic ruler → bulb stays dark (insulator).",
        },
        {
          type: "keyPoints",
          items: [
            "Conductors let electricity flow (metals).",
            "Insulators block electricity (plastic, rubber).",
            "Wires: copper core + plastic coat.",
            "Insulators protect us from shocks.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "Copper", value: "Conductor" },
            { key: "Plastic", value: "Insulator" },
            { key: "Rubber", value: "Insulator" },
            { key: "Gold", value: "Conductor" },
            { key: "Glass", value: "Insulator" },
          ],
        },
      ],
      questions: [
        { q: "Which is a good conductor?", options: ["Copper", "Rubber", "Plastic", "Wood"], answer: "Copper", explain: "Metals conduct." },
        { q: "Which is an insulator?", options: ["Plastic", "Iron", "Copper", "Gold"], answer: "Plastic", explain: "It blocks current." },
        { q: "Why are wires coated in plastic?", options: ["To keep us safe from shocks", "To look pretty", "To conduct better", "No reason"], answer: "To keep us safe from shocks", explain: "Plastic insulates." },
        { q: "Most conductors are…", options: ["metals", "plastics", "gases", "woods"], answer: "metals", explain: "Metals conduct well." },
        { q: "If you test wood in a circuit, the bulb will…", options: ["stay dark (insulator)", "shine brightly", "explode", "change colour"], answer: "stay dark (insulator)", explain: "Wood blocks current." },
      ],
    },
    {
      topic: "Electricity",
      title: "Switches & Circuit Diagrams",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Switches open and close circuits; circuit diagrams use symbols to draw circuits clearly.",
      blocks: [
        { type: "heading", text: "Drawing the Plan" },
        {
          type: "text",
          text: "A switch is a device that opens or closes a gap in a circuit. Closed (on) = complete loop, current flows. Open (off) = gap, no current. Switches let us control electricity safely.\n\nA circuit diagram uses standard symbols to draw circuits clearly. A battery is a set of long/short lines, a bulb is a circle with an X, wires are straight lines. Symbols make diagrams easy for anyone to read.",
        },
        {
          type: "example",
          text: "A circuit diagram: battery symbol → wire → bulb symbol → switch symbol → back to battery. If the switch is drawn open, the bulb is off.",
        },
        {
          type: "keyPoints",
          items: [
            "Switches open/close a circuit.",
            "Closed = on (current flows); open = off.",
            "Circuit diagrams use symbols.",
            "Standard symbols help everyone read them.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "A switch that is OPEN means…" },
            { key: "option_0", value: "the circuit is off (no current)" },
            { key: "option_1", value: "the bulb is brightest" },
            { key: "option_2", value: "current flows freely" },
            { key: "option_3", value: "the battery charges" },
            { key: "answer", value: "the circuit is off (no current)" },
            { key: "explanation", value: "Open = gap = no current." },
          ],
        },
      ],
      questions: [
        { q: "Closed switch = …", options: ["on (current flows)", "off", "exploding", "charging"], answer: "on (current flows)", explain: "Loop complete." },
        { q: "Open switch = …", options: ["off (no current)", "on", "brighter", "faster"], answer: "off (no current)", explain: "Gap in loop." },
        { q: "Circuit diagrams use…", options: ["standard symbols", "photographs", "colours only", "random shapes"], answer: "standard symbols", explain: "Clear and universal." },
        { q: "Wires in a circuit diagram are drawn as…", options: ["straight lines", "clouds", "spirals only", "photos"], answer: "straight lines", explain: "Simple lines." },
        { q: "Why use symbols in circuit diagrams?", options: ["So anyone can read them", "To use more ink", "To confuse readers", "They look nice only"], answer: "So anyone can read them", explain: "Standard = universal." },
      ],
    },
    {
      topic: "Electricity",
      title: "Electrical Safety",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Electricity can be dangerous: keep water away, never poke sockets, and check for damaged cables.",
      blocks: [
        { type: "heading", text: "Stay Safe" },
        {
          type: "text",
          text: "Electricity is useful but can be dangerous. Never poke objects into sockets, keep electrical things away from water (water + electricity can cause a deadly shock), and never use a device with a frayed or damaged cable.\n\nIf something overheats, smokes or smells of burning, switch it off and unplug it at once and tell an adult. Always switch off before unplugging.",
        },
        {
          type: "example",
          text: "Using a hairdryer in a wet bathroom is dangerous — water conducts electricity and can carry a shock through you. Always dry your hands before touching switches.",
        },
        {
          type: "keyPoints",
          items: [
            "Keep electricity away from water.",
            "Never poke sockets.",
            "Check cables for damage.",
            "Switch off and unplug if smoking/burning.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why is water dangerous near electricity?" },
            { key: "option_0", value: "Water can conduct a shock through you" },
            { key: "option_1", value: "Water puts out the current" },
            { key: "option_2", value: "Water makes devices faster" },
            { key: "option_3", value: "Water is not dangerous at all" },
            { key: "answer", value: "Water can conduct a shock through you" },
            { key: "explanation", value: "Water conducts electricity → shock risk." },
          ],
        },
      ],
      questions: [
        { q: "Before touching a switch, you should…", options: ["dry your hands", "wet your hands", "use a metal fork", "stand in water"], answer: "dry your hands", explain: "Water + electricity = danger." },
        { q: "A cable is frayed. You should…", options: ["not use it; tell an adult", "use it anyway", "tape it with any tape", "chew it"], answer: "not use it; tell an adult", explain: "Damaged cables are unsafe." },
        { q: "If a device smokes, you should…", options: ["switch off and unplug", "use it more", "pour water on it", "ignore it"], answer: "switch off and unplug", explain: "Switch off first." },
        { q: "Never poke objects into…", options: ["sockets", "books", "food", "cushions"], answer: "sockets", explain: "Risk of shock." },
        { q: "Water and electricity are…", options: ["a dangerous mix", "a great team", "always safe", "the same thing"], answer: "a dangerous mix", explain: "Water conducts current." },
      ],
    },

    // ===================== STATES OF MATTER (5) =====================
    {
      topic: "States of Matter",
      title: "Solids, Liquids & Gases",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Everything is one of three states: solids hold a fixed shape, liquids take a container's shape, gases fill any space.",
      blocks: [
        { type: "heading", text: "Three States" },
        {
          type: "text",
          text: "Everything around you is a solid, a liquid or a gas. In a solid, particles are packed tightly in a fixed shape (like ice). In a liquid, particles are close but can move, so a liquid takes the shape of its container (like water). In a gas, particles zoom around and fill any space (like steam).\n\nThe state depends on how the particles are arranged and how much they can move.",
        },
        {
          type: "example",
          text: "Water is the same substance in three states: ice (solid), water (liquid), steam (gas). Only the particle arrangement changes.",
        },
        {
          type: "keyPoints",
          items: [
            "Solid: fixed shape, fixed volume.",
            "Liquid: takes container's shape, fixed volume.",
            "Gas: fills any space, no fixed shape/volume.",
            "Same substance can be all three (water).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which state has a FIXED shape?" },
            { key: "option_0", value: "Solid" },
            { key: "option_1", value: "Liquid" },
            { key: "option_2", value: "Gas" },
            { key: "option_3", value: "All of them" },
            { key: "answer", value: "Solid" },
            { key: "explanation", value: "Solid particles are locked in place." },
          ],
        },
      ],
      questions: [
        { q: "Which takes the shape of its container?", options: ["Liquid", "Solid", "Gas only", "None"], answer: "Liquid", explain: "Liquids flow to fit." },
        { q: "Which fills ANY space?", options: ["Gas", "Solid", "Liquid", "Metal"], answer: "Gas", explain: "Gas particles spread out." },
        { q: "Ice is which state?", options: ["Solid", "Liquid", "Gas", "None"], answer: "Solid", explain: "Fixed shape." },
        { q: "Particles are packed tightly in a…", options: ["solid", "liquid", "gas", "vacuum"], answer: "solid", explain: "Locked in place." },
        { q: "Water, ice and steam are…", options: ["the same substance in 3 states", "different substances", "elements", "mixtures"], answer: "the same substance in 3 states", explain: "H₂O in solid/liquid/gas." },
      ],
    },
    {
      topic: "States of Matter",
      title: "Particle Theory",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Everything is made of tiny particles whose arrangement and movement decide the state of matter.",
      blocks: [
        { type: "heading", text: "Tiny Building Blocks" },
        {
          type: "text",
          text: "Everything is made of tiny particles too small to see. How these particles are arranged and how they move decides whether something is a solid, liquid or gas.\n\nIn solids, particles are held tightly in rows and only vibrate. In liquids, they are touching but can slide past each other. In gases, they are far apart and whizz around freely. Heating gives particles more energy to move.",
        },
        {
          type: "example",
          text: "Imagine particles as people: in a solid they stand in formation; in a liquid they walk around holding hands; in a gas they run freely across a field.",
        },
        {
          type: "keyPoints",
          items: [
            "All matter is made of tiny particles.",
            "Solid particles vibrate in place.",
            "Liquid particles slide past each other.",
            "Gas particles move freely and fast.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "In a solid, particles mostly…" },
            { key: "option_0", value: "vibrate in place" },
            { key: "option_1", value: "fly around freely" },
            { key: "option_2", value: "slide past each other" },
            { key: "option_3", value: "disappear" },
            { key: "answer", value: "vibrate in place" },
            { key: "explanation", value: "They are locked but jiggle." },
          ],
        },
      ],
      questions: [
        { q: "Everything is made of…", options: ["tiny particles", "water only", "light", "sound"], answer: "tiny particles", explain: "Too small to see." },
        { q: "Gas particles move…", options: ["freely and fast", "in fixed rows", "not at all", "in circles only"], answer: "freely and fast", explain: "Far apart, high energy." },
        { q: "Heating gives particles…", options: ["more energy to move", "less energy", "a fixed shape", "a smell"], answer: "more energy to move", explain: "Heat = more movement." },
        { q: "Liquid particles can…", options: ["slide past each other", "fly away", "freeze instantly", "disappear"], answer: "slide past each other", explain: "Touching but mobile." },
        { q: "Which has particles closest together?", options: ["Solid", "Liquid", "Gas", "Vacuum"], answer: "Solid", explain: "Tightly packed." },
      ],
    },
    {
      topic: "States of Matter",
      title: "Melting & Freezing",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Melting is solid → liquid when heated; freezing is liquid → solid when cooled. They reverse each other.",
      blocks: [
        { type: "heading", text: "Solid ↔ Liquid" },
        {
          type: "text",
          text: "Melting happens when a solid is heated enough to become a liquid. Ice melts into water at 0°C. The heat gives particles energy to break free of their fixed places and slide around.\n\nFreezing is the opposite: a liquid cooled enough becomes a solid. Water freezes into ice at 0°C. Melting and freezing happen at the same temperature for a substance — they are reverse processes.",
        },
        {
          type: "example",
          text: "An ice cube on a warm counter melts (0°C+). Put water in the freezer and it freezes into ice (below 0°C).",
        },
        {
          type: "keyPoints",
          items: [
            "Melting: solid → liquid (heated).",
            "Freezing: liquid → solid (cooled).",
            "Water melts/freezes at 0°C.",
            "They are reverse processes.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Water freezes into ice at what temperature (°C)?" },
            { key: "option_0", value: "0°C" },
            { key: "option_1", value: "100°C" },
            { key: "option_2", value: "50°C" },
            { key: "option_3", value: "−50°C" },
            { key: "answer", value: "0°C" },
            { key: "explanation", value: "Water freezes and ice melts at 0°C." },
          ],
        },
      ],
      questions: [
        { q: "Melting is: solid → …", options: ["liquid", "gas", "powder", "vapour"], answer: "liquid", explain: "Heat breaks the bonds." },
        { q: "Freezing is: liquid → …", options: ["solid", "gas", "liquid", "plasma"], answer: "solid", explain: "Cooling locks particles." },
        { q: "Ice melts at…", options: ["0°C", "100°C", "50°C", "−10°C"], answer: "0°C", explain: "Same as freezing point." },
        { q: "Melting and freezing are…", options: ["reverse processes", "the same thing", "unrelated", "impossible"], answer: "reverse processes", explain: "One undoes the other." },
        { q: "When heated, particles get…", options: ["more energy", "less energy", "frozen", "heavier"], answer: "more energy", explain: "Energy lets them move." },
      ],
    },
    {
      topic: "States of Matter",
      title: "Boiling, Evaporation & Condensation",
      difficulty: "beginner",
      minutes: 14,
      points: 80,
      summary: "Boiling is liquid → gas throughout (at 100°C for water); evaporation is a slow surface change; condensation is gas → liquid.",
      blocks: [
        { type: "heading", text: "Liquid ↔ Gas" },
        {
          type: "text",
          text: "Boiling is when a liquid turns into a gas quickly throughout the whole liquid. Water boils at 100°C, turning into steam. Evaporation is slower and happens only at the surface — a puddle dries up even on a mild day.\n\nCondensation is the reverse: a gas cools and turns back into liquid droplets. That is why a cold glass gets wet on the outside on a warm day — water vapour in the air condenses on it.",
        },
        {
          type: "example",
          text: "Boil a kettle → steam (boiling). A puddle shrinks over a day (evaporation). A cold can sweats (condensation).",
        },
        {
          type: "keyPoints",
          items: [
            "Boiling: liquid → gas, fast, at boiling point.",
            "Evaporation: liquid → gas, slow, at surface.",
            "Condensation: gas → liquid (cooling).",
            "Water boils at 100°C.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Heat water in a kettle (liquid)" },
            { key: "2", value: "Water boils at 100°C → steam (gas)" },
            { key: "3", value: "Steam hits a cool window" },
            { key: "4", value: "Condensation → water droplets (liquid)" },
          ],
        },
      ],
      questions: [
        { q: "Water boils at…", options: ["100°C", "0°C", "50°C", "200°C"], answer: "100°C", explain: "Boiling point of water." },
        { q: "A puddle slowly drying is…", options: ["evaporation", "boiling", "freezing", "melting"], answer: "evaporation", explain: "Slow surface change." },
        { q: "A cold glass getting wet outside shows…", options: ["condensation", "melting", "boiling", "freezing"], answer: "condensation", explain: "Gas → liquid droplets." },
        { q: "Boiling happens…", options: ["throughout the liquid", "only at the surface", "only in the dark", "only in ice"], answer: "throughout the liquid", explain: "All at once at boiling point." },
        { q: "Condensation is gas → …", options: ["liquid", "solid", "plasma", "ice"], answer: "liquid", explain: "Cooling gas to liquid." },
      ],
    },
    {
      topic: "States of Matter",
      title: "The Water Cycle",
      difficulty: "beginner",
      minutes: 14,
      points: 80,
      summary: "Water continuously moves between ground, sky and back: evaporation, condensation (clouds), precipitation, collection.",
      blocks: [
        { type: "heading", text: "Water on the Move" },
        {
          type: "text",
          text: "Earth's water is constantly recycled in the water cycle. The sun heats water in seas, lakes and rivers; it evaporates into water vapour (a gas). High up, the vapour cools and condenses into tiny droplets that form clouds.\n\nWhen the droplets get heavy enough, they fall as precipitation (rain, snow). The water collects in rivers and seas — and the cycle begins again. Water is never wasted; it just moves.",
        },
        {
          type: "example",
          text: "Sun heats the sea → water vapour rises → clouds form → rain falls → river flows to sea → repeat.",
        },
        {
          type: "keyPoints",
          items: [
            "Evaporation: water → vapour (sun heat).",
            "Condensation: vapour → clouds.",
            "Precipitation: rain/snow falls.",
            "Collection: rivers/seas gather water.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Evaporation: sun heats seas → vapour rises" },
            { key: "2", value: "Condensation: vapour forms clouds" },
            { key: "3", value: "Precipitation: rain/snow falls" },
            { key: "4", value: "Collection: water flows back to seas" },
          ],
        },
      ],
      questions: [
        { q: "What heats water to start the cycle?", options: ["The Sun", "The Moon", "The wind only", "Cities"], answer: "The Sun", explain: "Solar energy drives evaporation." },
        { q: "Clouds form by…", options: ["condensation", "evaporation", "melting", "freezing"], answer: "condensation", explain: "Vapour cools to droplets." },
        { q: "Rain falling is called…", options: ["precipitation", "evaporation", "condensation", "collection"], answer: "precipitation", explain: "Falling water." },
        { q: "Water in seas turning to vapour is…", options: ["evaporation", "condensation", "precipitation", "freezing"], answer: "evaporation", explain: "Liquid to gas." },
        { q: "The water cycle is…", options: ["continuous/recycled", "one-off", "impossible", "random"], answer: "continuous/recycled", explain: "Water loops forever." },
      ],
    },

    // ===================== FORCES (5) =====================
    {
      topic: "Forces",
      title: "Push & Pull",
      difficulty: "intermediate",
      minutes: 10,
      points: 70,
      summary: "A force is a push or a pull that can change how something moves or its shape; measured in newtons.",
      blocks: [
        { type: "heading", text: "Pushes and Pulls" },
        {
          type: "text",
          text: "A force is a push or a pull. Forces can make things start moving, stop, speed up, slow down, change direction or change shape. You push a swing to start it; you pull a drawer to open it.\n\nWe measure force in units called newtons (N), named after Sir Isaac Newton. Forces act in pairs and always have a direction.",
        },
        {
          type: "example",
          text: "Kicking a ball applies a push force: the ball speeds up in the direction of the kick. A bigger force = a bigger change.",
        },
        {
          type: "keyPoints",
          items: [
            "A force is a push or a pull.",
            "Forces change motion or shape.",
            "Force is measured in newtons (N).",
            "Forces have a size and direction.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Force is measured in…" },
            { key: "option_0", value: "newtons (N)" },
            { key: "option_1", value: "litres" },
            { key: "option_2", value: "degrees" },
            { key: "option_3", value: "seconds" },
            { key: "answer", value: "newtons (N)" },
            { key: "explanation", value: "Named after Isaac Newton." },
          ],
        },
      ],
      questions: [
        { q: "A force can be a push or a…", options: ["pull", "smell", "colour", "sound"], answer: "pull", explain: "Two kinds." },
        { q: "Force is measured in…", options: ["newtons", "litres", "grams only", "metres"], answer: "newtons", explain: "Unit: N." },
        { q: "Forces can change an object's…", options: ["motion or shape", "colour", "smell", "price"], answer: "motion or shape", explain: "Speed, direction, shape." },
        { q: "A bigger push makes a ball…", options: ["speed up more", "slow down", "change colour", "disappear"], answer: "speed up more", explain: "Bigger force = bigger change." },
        { q: "Newtons are named after…", options: ["Isaac Newton", "Albert Einstein", "Galileo", "Darwin"], answer: "Isaac Newton", explain: "He studied forces." },
      ],
    },
    {
      topic: "Forces",
      title: "Gravity",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Gravity is a pulling force that draws objects toward each other; on Earth it pulls everything down at the same rate.",
      blocks: [
        { type: "heading", text: "What Goes Up…" },
        {
          type: "text",
          text: "Gravity is a pulling force that attracts objects toward each other. The more mass an object has, the stronger its gravity. Earth's huge mass pulls everything on it toward the ground — that is why dropped things fall.\n\nNear Earth's surface, gravity accelerates falling objects at the same rate (ignoring air). A heavy ball and a light ball dropped together hit the ground at the same time!",
        },
        {
          type: "example",
          text: "Throw a ball up → gravity slows it, stops it, then pulls it back down. On the Moon (less mass), the same jump goes much higher because gravity is weaker.",
        },
        {
          type: "keyPoints",
          items: [
            "Gravity is a pulling force.",
            "More mass = stronger gravity.",
            "Earth's gravity pulls things down.",
            "Falling objects accelerate the same (no air).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Why do objects fall toward Earth?" },
            { key: "option_0", value: "Earth's mass creates a pulling force (gravity)" },
            { key: "option_1", value: "Air pushes them down" },
            { key: "option_2", value: "Magnets pull them" },
            { key: "option_3", value: "They choose to fall" },
            { key: "answer", value: "Earth's mass creates a pulling force (gravity)" },
            { key: "explanation", value: "Gravity pulls toward Earth's centre." },
          ],
        },
      ],
      questions: [
        { q: "Gravity is a force that…", options: ["pulls", "pushes", "lights", "cools"], answer: "pulls", explain: "It attracts." },
        { q: "More mass means…", options: ["stronger gravity", "weaker gravity", "no gravity", "blue gravity"], answer: "stronger gravity", explain: "Mass → gravity." },
        { q: "On the Moon, you can jump higher because…", options: ["gravity is weaker", "gravity is stronger", "there's no air resistance only", "you're lighter in mass"], answer: "gravity is weaker", explain: "Moon has less mass." },
        { q: "Dropped together (no air), a heavy and light ball…", options: ["hit the ground together", "heavy one lands first", "light one lands first", "they float"], answer: "hit the ground together", explain: "Same acceleration." },
        { q: "Gravity pulls objects toward…", options: ["Earth's centre", "the sky", "the Sun only", "the Moon only"], answer: "Earth's centre", explain: "Down = toward centre." },
      ],
    },
    {
      topic: "Forces",
      title: "Friction",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Friction is a force that opposes sliding between surfaces; rough = more friction, smooth = less.",
      blocks: [
        { type: "heading", text: "The Force That Slows Sliding" },
        {
          type: "text",
          text: "Friction is a force that tries to stop things sliding past each other. Rough surfaces create more friction (good for grippy shoes), smooth surfaces create less (good for ice skating). Without friction, walking would be impossible — you would slip everywhere.\n\nFriction can be useful (brakes slow a bike) or a nuisance (it heats up moving parts). Oil and grease are lubricants that reduce friction in machines.",
        },
        {
          type: "example",
          text: "Rub your hands together hard — they get warm. That heat is friction turning movement into thermal energy. Soap/water on a slide reduces friction so you slide faster.",
        },
        {
          type: "keyPoints",
          items: [
            "Friction opposes sliding.",
            "Rough surfaces = more friction.",
            "Smooth surfaces = less friction.",
            "Lubricants (oil) reduce friction.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Friction is a force that…" },
            { key: "option_0", value: "opposes sliding between surfaces" },
            { key: "option_1", value: "speeds things up" },
            { key: "option_2", value: "creates light" },
            { key: "option_3", value: "does not exist on Earth" },
            { key: "answer", value: "opposes sliding between surfaces" },
            { key: "explanation", value: "It acts against sliding." },
          ],
        },
      ],
      questions: [
        { q: "Rough surfaces create…", options: ["more friction", "less friction", "no friction", "light"], answer: "more friction", explain: "Bumps catch." },
        { q: "Oil reduces friction by acting as a…", options: ["lubricant", "brake", "magnet", "fuel"], answer: "lubricant", explain: "It smooths surfaces." },
        { q: "Without friction, walking would be…", options: ["impossible", "faster", "louder", "brighter"], answer: "impossible", explain: "You'd slip." },
        { q: "Rubbing hands together makes them warm because…", options: ["friction turns movement into heat", "of gravity", "of magnetism", "they're wet"], answer: "friction turns movement into heat", explain: "Energy converts." },
        { q: "Which has the LEAST friction?", options: ["Ice", "Sandpaper", "Carpet", "Rubber"], answer: "Ice", explain: "Very smooth." },
      ],
    },
    {
      topic: "Forces",
      title: "Balanced & Unbalanced Forces",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "Balanced forces cause no change in motion; unbalanced forces make things speed up, slow down or change direction.",
      blocks: [
        { type: "heading", text: "Tug of War" },
        {
          type: "text",
          text: "When forces on an object are balanced (equal and opposite), the object's motion does not change. A book on a table stays still: gravity pulls down, the table pushes up equally — balanced.\n\nWhen forces are unbalanced, the object changes motion: it speeds up, slows down or changes direction. A bike speeds up when your pedalling (forward force) is bigger than friction and air resistance (backward forces).",
        },
        {
          type: "example",
          text: "Tug of war: both sides pull equally → rope stays still (balanced). One side pulls harder → rope moves that way (unbalanced).",
        },
        {
          type: "keyPoints",
          items: [
            "Balanced forces → no change in motion.",
            "Unbalanced forces → motion changes.",
            "Bigger force wins, the object accelerates.",
            "Stationary objects have balanced forces.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "A book sits still on a table. The forces are…" },
            { key: "option_0", value: "balanced" },
            { key: "option_1", value: "unbalanced" },
            { key: "option_2", value: "zero" },
            { key: "option_3", value: "invisible" },
            { key: "answer", value: "balanced" },
            { key: "explanation", value: "Gravity down = table up equally." },
          ],
        },
      ],
      questions: [
        { q: "Balanced forces cause…", options: ["no change in motion", "speeding up", "slowing down", "turning"], answer: "no change in motion", explain: "Equal and opposite." },
        { q: "Unbalanced forces cause…", options: ["a change in motion", "stillness", "silence", "nothing"], answer: "a change in motion", explain: "Speed/dir change." },
        { q: "A bike speeds up when pedalling force is…", options: ["bigger than friction + air", "smaller than friction", "zero", "balanced"], answer: "bigger than friction + air", explain: "Unbalanced forward." },
        { q: "A book resting on a table shows…", options: ["balanced forces", "unbalanced forces", "no forces", "only gravity"], answer: "balanced forces", explain: "Gravity = table push." },
        { q: "In a tug of war, the rope moves when forces are…", options: ["unbalanced", "balanced", "zero", "equal"], answer: "unbalanced", explain: "One side pulls harder." },
      ],
    },
    {
      topic: "Forces",
      title: "Magnetism",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Magnets attract some metals (iron, nickel) and have two poles: opposite poles attract, like poles repel.",
      blocks: [
        { type: "heading", text: "Invisible Attraction" },
        {
          type: "text",
          text: "A magnet is an object that produces an invisible force called magnetism. Magnets attract certain metals — especially iron, nickel and cobalt. They do not attract plastic, wood or paper.\n\nEvery magnet has two ends called poles: a north pole and a south pole. Opposite poles attract each other (N + S pull together). Like poles repel — push apart — each other (N pushes N, S pushes S).",
        },
        {
          type: "example",
          text: "Hold two magnets' north poles together → they push apart. Flip one → north meets south → they snap together.",
        },
        {
          type: "keyPoints",
          items: [
            "Magnets attract iron, nickel, cobalt.",
            "Two poles: north (N) and south (S).",
            "Opposite poles attract.",
            "Like poles repel.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "Metals magnets attract", value: "Iron, nickel, cobalt" },
            { key: "N + S poles", value: "Attract" },
            { key: "N + N poles", value: "Repel (push apart)" },
            { key: "S + S poles", value: "Repel (push apart)" },
            { key: "Earth acts like a…", value: "Giant magnet" },
          ],
        },
      ],
      questions: [
        { q: "Which metal does a magnet attract?", options: ["Iron", "Aluminium", "Copper (weakly/no)", "Plastic"], answer: "Iron", explain: "Iron is magnetic." },
        { q: "Opposite poles (N + S)…", options: ["attract", "repel", "do nothing", "explode"], answer: "attract", explain: "Pull together." },
        { q: "Like poles (N + N)…", options: ["repel", "attract", "stick", "do nothing"], answer: "repel", explain: "Push apart." },
        { q: "A magnet has how many poles?", options: ["Two (N and S)", "One", "Four", "None"], answer: "Two (N and S)", explain: "Always a pair." },
        { q: "Which does a magnet NOT attract?", options: ["Plastic", "Iron", "Nickel", "Cobalt"], answer: "Plastic", explain: "Non-magnetic." },
      ],
    },

    // ===================== SCIENCE SIMULATIONS (2 activity labs) =====================
    {
      topic: "Electricity",
      title: "Activity: Build a Circuit",
      difficulty: "intermediate",
      minutes: 12,
      points: 90,
      summary: "Experiment with a simple circuit: add batteries and flip the switch to see how the bulb's brightness changes.",
      kind: "activity",
      blocks: [
        { type: "heading", text: "Make the Bulb Shine" },
        {
          type: "text",
          text: "A circuit is a complete loop that lets electricity flow. It needs a power source (a battery), wires, and something to power (a bulb). If there is a gap — like an open switch — the electricity cannot flow and the bulb stays off.\n\nMore batteries provide more voltage (push), which makes the bulb shine brighter. Use the simulation below to test this yourself.",
        },
        {
          type: "example",
          text: "Switch open = gap in the loop = no flow = bulb OFF. Switch closed with 3 batteries = strong flow = very bright bulb.",
        },
        {
          type: "keyPoints",
          items: [
            "A circuit must be a complete loop.",
            "An open switch breaks the loop (bulb off).",
            "More batteries = more voltage = brighter bulb.",
            "Battery, wires, and bulb work together.",
          ],
        },
        sim("circuit", "Circuit Simulator"),
      ],
      questions: [
        { q: "For a bulb to light, the circuit must be…", options: ["a complete loop", "broken", "very long", "made of plastic"], answer: "a complete loop", explain: "Electricity needs a full path." },
        { q: "An open switch makes the bulb…", options: ["turn off", "brighter", "explode", "change colour"], answer: "turn off", explain: "It breaks the loop." },
        { q: "Adding more batteries makes the bulb…", options: ["brighter", "dimmer", "switch off", "bigger"], answer: "brighter", explain: "More voltage = more brightness." },
        { q: "What provides the power in a circuit?", options: ["The battery", "The bulb", "The wire only", "The switch"], answer: "The battery", explain: "Batteries are the power source." },
        { q: "Voltage is like the…", options: ["push that drives the current", "colour of the wire", "length of the circuit", "weight of the bulb"], answer: "push that drives the current", explain: "More push = brighter bulb." },
      ],
    },
    {
      topic: "States of Matter",
      title: "Activity: Heat & States of Matter",
      difficulty: "beginner",
      minutes: 12,
      points: 90,
      summary: "Use the temperature slider to watch particles change between solid, liquid, and gas.",
      kind: "activity",
      blocks: [
        { type: "heading", text: "Watch Particles Move" },
        {
          type: "text",
          text: "Everything is made of tiny particles. How much energy they have decides the state of matter. In a SOLID, particles are packed tightly and only vibrate. In a LIQUID, they are close but can slide past each other. In a GAS, they have lots of energy and spread far apart, moving fast.\n\nAdding heat gives particles more energy. Drag the temperature slider in the simulation to melt a solid into a liquid, then boil it into a gas.",
        },
        {
          type: "example",
          text: "Ice (solid) + heat → water (liquid) + more heat → steam (gas). Cooling reverses it.",
        },
        {
          type: "keyPoints",
          items: [
            "Solids: particles packed, only vibrating.",
            "Liquids: particles close but sliding.",
            "Gases: particles spread out, moving fast.",
            "Heat adds energy and changes the state.",
          ],
        },
        sim("particles", "Particle Simulator"),
      ],
      questions: [
        { q: "In a solid, particles…", options: ["are packed and vibrate", "spread far apart", "disappear", "move very fast"], answer: "are packed and vibrate", explain: "Solids hold their shape." },
        { q: "Adding heat gives particles more…", options: ["energy", "colour", "weight", "names"], answer: "energy", explain: "Energy speeds them up." },
        { q: "In a gas, particles are…", options: ["spread out and fast", "packed tightly", "frozen still", "in a neat grid"], answer: "spread out and fast", explain: "Gases fill their container." },
        { q: "Ice melting into water is a change from…", options: ["solid to liquid", "gas to solid", "liquid to gas", "gas to liquid"], answer: "solid to liquid", explain: "Heating a solid melts it." },
        { q: "Which state lets particles slide past each other?", options: ["Liquid", "Solid", "None", "Only gas"], answer: "Liquid", explain: "Liquids flow and take a container's shape." },
      ],
    },
  ],
};

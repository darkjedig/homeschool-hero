import type { SubjectCurriculum } from "./types";

export const maths: SubjectCurriculum = {
  slug: "maths",
  lessons: [
    // ===================== FRACTIONS (6) =====================
    {
      topic: "Fractions",
      title: "What Is a Fraction?",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary:
        "A fraction describes part of a whole using two numbers: the numerator on top and the denominator on the bottom.",
      blocks: [
        { type: "heading", text: "Parts of a Whole" },
        {
          type: "text",
          text: "A fraction describes part of a whole. It has two numbers separated by a line. The top number is the numerator — how many parts you have. The bottom number is the denominator — how many equal parts the whole is split into.\n\nIf a pizza is cut into 8 equal slices and you eat 3, you have eaten 3/8 of the pizza. The bigger the denominator, the smaller each piece: 1/8 is smaller than 1/4.",
        },
        {
          type: "example",
          text: "In the fraction 3/8: the numerator is 3 (slices eaten) and the denominator is 8 (total slices). So 3/8 of the pizza is gone.",
        },
        {
          type: "keyPoints",
          items: [
            "Numerator = top number (parts you have).",
            "Denominator = bottom number (equal parts in the whole).",
            "The whole must be split into EQUAL parts.",
            "Bigger denominator → smaller each piece.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "In 3/8, which number is the denominator?" },
            { key: "option_0", value: "3" },
            { key: "option_1", value: "8" },
            { key: "option_2", value: "11" },
            { key: "option_3", value: "24" },
            { key: "answer", value: "8" },
            { key: "explanation", value: "The bottom number (8) is the denominator — the number of equal parts in the whole." },
          ],
        },
      ],
      questions: [
        { q: "What do we call the TOP number of a fraction?", options: ["Denominator", "Numerator", "Multiplier", "Fraction bar"], answer: "Numerator", explain: "The top number is the numerator." },
        { q: "In 3/8, what is the denominator?", options: ["3", "8", "11", "5"], answer: "8", explain: "The bottom number (8) is the denominator." },
        { q: "Which is the smaller piece: 1/4 or 1/8?", options: ["1/4", "1/8", "They are equal", "Cannot tell"], answer: "1/8", explain: "A bigger denominator means smaller pieces." },
        { q: "A chocolate bar has 6 equal pieces. You eat 2. What fraction have you eaten?", options: ["2/6", "6/2", "2/8", "1/2"], answer: "2/6", explain: "2 parts eaten out of 6 equal parts." },
        { q: "Which fraction means 'one out of three equal parts'?", options: ["3/1", "1/3", "2/3", "3/3"], answer: "1/3", explain: "Numerator 1, denominator 3." },
      ],
    },
    {
      topic: "Fractions",
      title: "Fractions of Shapes & Number Lines",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Fractions can be shown by shading shapes and by marking equal jumps on a number line.",
      blocks: [
        { type: "heading", text: "Showing Fractions Visually" },
        {
          type: "text",
          text: "We can show fractions in two powerful ways. First, with shapes: split a shape into equal parts and shade some of them. If 3 of 5 equal stripes are shaded, that is 3/5.\n\nSecond, with a number line: cut the gap between 0 and 1 into equal jumps. Each jump is one part. The second mark after 0 on a line split into quarters is 2/4.",
        },
        {
          type: "example",
          text: "Draw a bar, split it into 4 equal parts, shade 3. The shaded amount is 3/4. On a number line from 0 to 1 split into 4 jumps, the marks land on 1/4, 2/4, 3/4, then 4/4 = 1.",
        },
        {
          type: "keyPoints",
          items: [
            "Shape parts must be EQUAL in size.",
            "Numerator = parts shaded/pointed to.",
            "Denominator = total equal parts.",
            "On a number line, each jump = one part.",
          ],
        },
        {
          type: "interactive",
          variant: "flashcards",
          data: [
            { key: "3 out of 4 parts shaded = ?", value: "3/4" },
            { key: "5 out of 8 parts shaded = ?", value: "5/8" },
            { key: "1 out of 2 parts shaded = ?", value: "1/2" },
            { key: "2 out of 6 parts shaded = ?", value: "2/6 (= 1/3)" },
          ],
        },
      ],
      questions: [
        { q: "A rectangle is split into 5 equal parts and 2 are shaded. What fraction is shaded?", options: ["2/5", "5/2", "2/3", "3/5"], answer: "2/5", explain: "2 shaded parts out of 5 total." },
        { q: "On a number line 0→1 split into 4 jumps, what is the first mark after 0?", options: ["1/2", "1/4", "1/3", "2/4"], answer: "1/4", explain: "Each jump is one quarter." },
        { q: "A circle is split into 3 unequal pieces. Can we write a fair fraction?", options: ["Yes, any way", "No — parts must be equal", "Only if it is a half", "Only if shaded"], answer: "No — parts must be equal", explain: "Fractions need EQUAL parts." },
        { q: "Which shaded fraction equals 1 whole?", options: ["3/3", "1/3", "2/3", "0/3"], answer: "3/3", explain: "When all parts are shaded, it equals one whole." },
        { q: "A bar of 6 equal parts has 6 shaded. As a fraction that is…", options: ["6/6 = 1", "1/6", "6/1", "0/6"], answer: "6/6 = 1", explain: "All parts shaded = one whole." },
      ],
    },
    {
      topic: "Fractions",
      title: "Equivalent Fractions",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Equivalent fractions look different but name the same amount. Multiply or divide top and bottom by the same number.",
      blocks: [
        { type: "heading", text: "Same Amount, Different Numbers" },
        {
          type: "text",
          text: "Equivalent fractions are fractions that name the same amount, like 1/2 and 2/4. If you shade them, the same amount is coloured.\n\nThe rule: multiply (or divide) the numerator AND the denominator by the same number, and the fraction keeps the same value. 1/2 × 2/2 = 2/4. 3/4 × 3/3 = 9/12.",
        },
        {
          type: "example",
          text: "Find a fraction equal to 1/2 with denominator 8. Multiply top and bottom by 4: 1×4 / 2×4 = 4/8. So 1/2 = 4/8.",
        },
        {
          type: "keyPoints",
          items: [
            "Equivalent fractions are equal in value.",
            "Multiply top AND bottom by the same number.",
            "Divide top AND bottom by the same number to simplify.",
            "Multiplying by 2/2 or 3/3 etc. = multiplying by 1.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which fraction is equivalent to 1/2?" },
            { key: "option_0", value: "2/4" },
            { key: "option_1", value: "1/3" },
            { key: "option_2", value: "3/5" },
            { key: "option_3", value: "2/3" },
            { key: "answer", value: "2/4" },
            { key: "explanation", value: "1/2 × 2/2 = 2/4, the same value." },
          ],
        },
      ],
      questions: [
        { q: "Which is equivalent to 1/2?", options: ["2/4", "2/3", "1/4", "3/5"], answer: "2/4", explain: "1×2 / 2×2 = 2/4." },
        { q: "Find the missing number: 1/3 = ?/9", options: ["2", "3", "6", "9"], answer: "3", explain: "Multiply top by 3: 1×3 = 3." },
        { q: "Which is equivalent to 2/5?", options: ["4/10", "2/10", "4/5", "5/10"], answer: "4/10", explain: "Multiply both by 2." },
        { q: "Simplify 6/8 by dividing both by 2.", options: ["2/4", "3/4", "3/8", "1/2"], answer: "3/4", explain: "6÷2 / 8÷2 = 3/4." },
        { q: "Why does multiplying top and bottom by 3 keep the value the same?", options: ["It is adding", "Multiplying by 3/3 = multiplying by 1", "It makes it bigger", "It halves it"], answer: "Multiplying by 3/3 = multiplying by 1", explain: "3/3 = 1, so the value is unchanged." },
      ],
    },
    {
      topic: "Fractions",
      title: "Comparing & Ordering Fractions",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "To compare fractions with different denominators, rewrite them with the same denominator, then compare numerators.",
      blocks: [
        { type: "heading", text: "Who Has More?" },
        {
          type: "text",
          text: "When fractions have the SAME denominator, the bigger numerator wins: 5/8 is bigger than 3/8. When denominators are different, it is trickier: 3/4 vs 2/3.\n\nThe trick is to rewrite both with the same denominator (a common denominator). For 3/4 and 2/3, use 12: 3/4 = 9/12 and 2/3 = 8/12. Now compare: 9/12 > 8/12, so 3/4 is bigger.",
        },
        {
          type: "example",
          text: "Order 1/2, 1/3, 1/4 from smallest to largest. Same numerator (1), so the biggest denominator is the smallest piece: 1/4 < 1/3 < 1/2.",
        },
        {
          type: "keyPoints",
          items: [
            "Same denominator → compare numerators.",
            "Same numerator → bigger denominator is smaller.",
            "Different denominators → make them the same.",
            "A common denominator makes any fractions comparable.",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "1/4 (smallest)" },
            { key: "2", value: "1/3" },
            { key: "3", value: "1/2" },
            { key: "4", value: "3/4 (largest)" },
          ],
        },
      ],
      questions: [
        { q: "Which is larger: 5/9 or 7/9?", options: ["5/9", "7/9", "They are equal", "Cannot tell"], answer: "7/9", explain: "Same denominator, bigger numerator wins." },
        { q: "Which is larger: 1/4 or 1/6?", options: ["1/4", "1/6", "Equal", "Cannot tell"], answer: "1/4", explain: "Same numerator, smaller denominator = bigger piece." },
        { q: "Compare 2/3 and 3/4 using denominator 12. Which is bigger?", options: ["2/3 (=8/12)", "3/4 (=9/12)", "Equal", "Cannot tell"], answer: "3/4 (=9/12)", explain: "2/3=8/12, 3/4=9/12, so 3/4 is bigger." },
        { q: "Order from smallest: 1/2, 1/8, 1/4.", options: ["1/8, 1/4, 1/2", "1/2, 1/4, 1/8", "1/4, 1/8, 1/2", "1/8, 1/2, 1/4"], answer: "1/8, 1/4, 1/2", explain: "Bigger denominators = smaller pieces." },
        { q: "Why rewrite fractions with a common denominator?", options: ["To make them bigger", "So each piece is the same size to compare", "To add letters", "It is required by law"], answer: "So each piece is the same size to compare", explain: "Equal-sized pieces let us compare numerators fairly." },
      ],
    },
    {
      topic: "Fractions",
      title: "Adding & Subtracting Fractions",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "When denominators match, add or subtract the numerators and keep the denominator the same.",
      blocks: [
        { type: "heading", text: "Same Denominator? Easy" },
        {
          type: "text",
          text: "When two fractions share the same denominator, adding or subtracting is simple: do the maths on the top numbers only, and keep the bottom number the same.\n\n2/7 + 3/7 = 5/7. You had 2 sevenths, added 3 more sevenths, so now you have 5 sevenths. The denominator does not change because the piece size has not changed.",
        },
        {
          type: "example",
          text: "Subtract: 7/9 − 4/9 = 3/9. The denominators match, so subtract numerators: 7 − 4 = 3. (3/9 simplifies to 1/3.)",
        },
        {
          type: "keyPoints",
          items: [
            "Denominators must match before adding.",
            "Add or subtract numerators only.",
            "Keep the denominator the same.",
            "Different denominators → make them the same first.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is 2/9 + 4/9?" },
            { key: "option_0", value: "6/18" },
            { key: "option_1", value: "6/9" },
            { key: "option_2", value: "8/9" },
            { key: "option_3", value: "2/9" },
            { key: "answer", value: "6/9" },
            { key: "explanation", value: "Add numerators (2+4=6), keep the denominator 9." },
          ],
        },
      ],
      questions: [
        { q: "What is 1/5 + 2/5?", options: ["3/10", "3/5", "2/5", "3/25"], answer: "3/5", explain: "1+2=3, denominator stays 5." },
        { q: "What is 7/8 − 3/8?", options: ["4/8", "4/16", "10/8", "4/0"], answer: "4/8", explain: "7−3=4, denominator stays 8." },
        { q: "Before adding fractions you must make sure…", options: ["the numerators are equal", "the denominators are the same", "the numbers are big", "there is a whole number"], answer: "the denominators are the same", explain: "Matching denominators means same-sized pieces." },
        { q: "What is 3/10 + 4/10 + 1/10?", options: ["8/10", "8/30", "7/10", "3/10"], answer: "8/10", explain: "3+4+1=8, denominator stays 10." },
        { q: "Simplify your answer: 6/8 − 2/8", options: ["4/8 (= 1/2)", "4/16", "8/8", "4/0"], answer: "4/8 (= 1/2)", explain: "6−2=4 → 4/8, which simplifies to 1/2." },
      ],
    },
    {
      topic: "Fractions",
      title: "Fractions of an Amount",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "To find a fraction of an amount, divide by the denominator, then multiply by the numerator.",
      blocks: [
        { type: "heading", text: "A Real-Life Superpower" },
        {
          type: "text",
          text: "Finding a fraction of an amount is one of the most useful maths skills. The method has two steps. Step 1: DIVIDE the amount by the denominator (this finds one part). Step 2: MULTIPLY that by the numerator (this finds how many parts you want).\n\nTo find 3/4 of 20: first divide 20 by 4 to get 5 (one quarter). Then multiply by 3 to get 15. So 3/4 of 20 = 15.",
        },
        {
          type: "example",
          text: "Find 2/5 of 40. Divide 40 by 5 = 8 (one fifth). Multiply by 2 = 16. So 2/5 of 40 is 16.",
        },
        {
          type: "keyPoints",
          items: [
            "Divide by the denominator → one part.",
            "Multiply by the numerator → the parts you want.",
            "Of usually means × (3/4 of 20 = 3/4 × 20).",
            "Check: the answer is never bigger than the whole.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is 1/2 of 30?" },
            { key: "option_0", value: "10" },
            { key: "option_1", value: "15" },
            { key: "option_2", value: "20" },
            { key: "option_3", value: "60" },
            { key: "answer", value: "15" },
            { key: "explanation", value: "Divide 30 by 2 = 15." },
          ],
        },
      ],
      questions: [
        { q: "What is 1/4 of 20?", options: ["4", "5", "10", "16"], answer: "5", explain: "20 ÷ 4 = 5." },
        { q: "What is 3/5 of 25?", options: ["5", "10", "15", "20"], answer: "15", explain: "25 ÷ 5 = 5, then 5 × 3 = 15." },
        { q: "What is 2/3 of 18?", options: ["6", "9", "12", "18"], answer: "12", explain: "18 ÷ 3 = 6, then 6 × 2 = 12." },
        { q: "First step to find 3/8 of 40?", options: ["Multiply 40 by 3", "Divide 40 by 8", "Add 8 and 40", "Subtract 3"], answer: "Divide 40 by 8", explain: "Divide by the denominator first to find one part." },
        { q: "A class of 30 children: 2/3 are girls. How many girls?", options: ["10", "15", "20", "23"], answer: "20", explain: "30 ÷ 3 = 10, × 2 = 20." },
      ],
    },

    // ===================== RATIOS (4) =====================
    {
      topic: "Ratios",
      title: "What Is a Ratio?",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "A ratio compares two or more quantities using a colon, like 2:1 for flour to sugar.",
      blocks: [
        { type: "heading", text: "Comparing Quantities" },
        {
          type: "text",
          text: "A ratio compares two (or more) quantities. If a recipe uses 2 cups of flour for every 1 cup of sugar, the ratio of flour to sugar is 2:1 (read 'two to one'). Order matters: flour to sugar is 2:1, but sugar to flour is 1:2.\n\nRatios are everywhere — map scales, mixing paint, sharing sweets. They tell us how quantities keep their balance.",
        },
        {
          type: "example",
          text: "In a fruit bowl there are 4 apples and 6 bananas. The ratio of apples to bananas is 4:6. We can simplify it (divide both by 2) to 2:3.",
        },
        {
          type: "keyPoints",
          items: [
            "A ratio compares quantities with a colon (:).",
            "Order matters: 2:1 is not the same as 1:2.",
            "Ratios can be simplified like fractions.",
            "The units must match (cups:cups, not cups:grams).",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "A bowl has 3 apples and 9 bananas. Ratio of apples to bananas?" },
            { key: "option_0", value: "3:9 (simplifies to 1:3)" },
            { key: "option_1", value: "9:3" },
            { key: "option_2", value: "3:12" },
            { key: "option_3", value: "1:1" },
            { key: "answer", value: "3:9 (simplifies to 1:3)" },
            { key: "explanation", value: "3 apples : 9 bananas; divide both by 3 to get 1:3." },
          ],
        },
      ],
      questions: [
        { q: "A recipe uses 3 cups flour to 1 cup sugar. Flour:sugar ratio?", options: ["1:3", "3:1", "3:3", "2:1"], answer: "3:1", explain: "Flour first (3), sugar second (1)." },
        { q: "5 red beads and 10 blue. Simplified ratio red:blue?", options: ["1:2", "2:1", "5:10", "1:1"], answer: "1:2", explain: "Divide both by 5." },
        { q: "Does order matter in a ratio?", options: ["No", "Yes", "Only for big numbers", "Only for halves"], answer: "Yes", explain: "2:1 and 1:2 are different ratios." },
        { q: "There are 6 cats and 2 dogs. Ratio of cats to dogs?", options: ["6:2", "2:6", "6:8", "1:6"], answer: "6:2", explain: "Cats (6) first, dogs (2) second." },
        { q: "Simplify the ratio 10:15.", options: ["2:3", "3:2", "5:3", "1:2"], answer: "2:3", explain: "Divide both by 5." },
      ],
    },
    {
      topic: "Ratios",
      title: "Equivalent Ratios (Scaling)",
      difficulty: "beginner",
      minutes: 10,
      points: 60,
      summary: "Multiply or divide both parts of a ratio by the same number to keep it equivalent.",
      blocks: [
        { type: "heading", text: "Same Balance, Bigger Numbers" },
        {
          type: "text",
          text: "Equivalent ratios keep the same balance but use bigger (or smaller) numbers. Just like fractions, you multiply or divide BOTH parts of the ratio by the same number.\n\n2:1 is the same as 4:2, 6:3 or 10:5. A recipe at 2:1 flour:sugar can be doubled to 4:2 or tripled to 6:3, and the mixture keeps the same balance.",
        },
        {
          type: "example",
          text: "Is 6:4 equivalent to 3:2? Divide 6 and 4 by 2 → 3:2. Yes, they are equivalent.",
        },
        {
          type: "keyPoints",
          items: [
            "Multiply both parts by the same number.",
            "Divide both parts by the same number to simplify.",
            "Equivalent ratios keep the same balance.",
            "A ratio table lists many equivalents in one go.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Which ratio is equivalent to 2:3?" },
            { key: "option_0", value: "4:6" },
            { key: "option_1", value: "2:5" },
            { key: "option_2", value: "3:2" },
            { key: "option_3", value: "6:4" },
            { key: "answer", value: "4:6" },
            { key: "explanation", value: "Multiply both parts by 2: 2×2=4, 3×2=6." },
          ],
        },
      ],
      questions: [
        { q: "Which is equivalent to 5:2?", options: ["10:4", "5:4", "2:5", "10:2"], answer: "10:4", explain: "Multiply both by 2." },
        { q: "Simplify 12:8.", options: ["3:2", "2:3", "4:3", "6:4"], answer: "3:2", explain: "Divide both by 4." },
        { q: "3:1 doubled is…", options: ["6:2", "3:2", "4:2", "6:1"], answer: "6:2", explain: "Multiply both by 2." },
        { q: "Are 9:6 and 3:2 equivalent?", options: ["Yes", "No", "Only if added", "Cannot tell"], answer: "Yes", explain: "9:6 ÷ 3 = 3:2." },
        { q: "A squash mix is 1:4 (cordial:water). To make 5 times as much, use…", options: ["5:20", "1:20", "5:4", "5:5"], answer: "5:20", explain: "Multiply both parts by 5." },
      ],
    },
    {
      topic: "Ratios",
      title: "Sharing in a Ratio",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "To share a total in a ratio, add the parts to find one part's value, then multiply.",
      blocks: [
        { type: "heading", text: "Sharing Fairly (But Not Equally)" },
        {
          type: "text",
          text: "Sometimes we share an amount following a ratio, not equally. The method: count the total parts, divide the amount by the total parts to find one part, then multiply by each side of the ratio.\n\nShare 40 sweets between Alice and Ben in the ratio 3:1. Total parts = 3 + 1 = 4. One part = 40 ÷ 4 = 10. Alice gets 3 × 10 = 30, Ben gets 1 × 10 = 10.",
        },
        {
          type: "example",
          text: "Share £50 in the ratio 2:3. Total parts = 5. One part = £50 ÷ 5 = £10. First share = 2 × £10 = £20. Second share = 3 × £10 = £30. Check: 20 + 30 = 50. ✓",
        },
        {
          type: "keyPoints",
          items: [
            "Add the ratio parts to find the TOTAL parts.",
            "Divide the amount by total parts → value of 1 part.",
            "Multiply 1 part by each side of the ratio.",
            "Check: the shares must add up to the original amount.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Share 20 in the ratio 1:1. How much is each share?" },
            { key: "option_0", value: "10 and 10" },
            { key: "option_1", value: "15 and 5" },
            { key: "option_2", value: "12 and 8" },
            { key: "option_3", value: "20 and 0" },
            { key: "answer", value: "10 and 10" },
            { key: "explanation", value: "1+1 = 2 parts. 20 ÷ 2 = 10 each." },
          ],
        },
      ],
      questions: [
        { q: "Share 30 in the ratio 2:1.", options: ["20 and 10", "15 and 15", "10 and 20", "25 and 5"], answer: "20 and 10", explain: "3 parts, 1 part = 10 → 20 and 10." },
        { q: "Share £40 in the ratio 3:1.", options: ["£30 and £10", "£20 and £20", "£10 and £30", "£35 and £5"], answer: "£30 and £10", explain: "4 parts, 1 part = £10." },
        { q: "Share 24 in the ratio 1:2:3. Total parts = ?", options: ["6", "5", "3", "12"], answer: "6", explain: "1+2+3 = 6." },
        { q: "Share 24 in the ratio 1:2:3. The largest share is…", options: ["4", "8", "12", "6"], answer: "12", explain: "1 part = 4; largest = 3×4 = 12." },
        { q: "First step when sharing an amount in a ratio?", options: ["Add the ratio to find total parts", "Multiply the ratio", "Subtract the amount", "Guess"], answer: "Add the ratio to find total parts", explain: "Total parts tells us the value of one part." },
      ],
    },
    {
      topic: "Ratios",
      title: "Ratio Word Problems",
      difficulty: "beginner",
      minutes: 12,
      points: 70,
      summary: "Spot the ratio, scale it up or down to match the total, and solve real-life problems step by step.",
      blocks: [
        { type: "heading", text: "Ratios in Real Life" },
        {
          type: "text",
          text: "Ratio word problems appear in recipes, shopping, maps and more. Read carefully, spot the ratio, then work out one part before scaling.\n\nThe trick is to find the value of ONE part first. Once you know what one part is worth, every other amount falls out by multiplying.",
        },
        {
          type: "example",
          text: "A map scale is 1 cm : 5 km. On the map two towns are 4 cm apart. Real distance = 4 × 5 km = 20 km.",
        },
        {
          type: "keyPoints",
          items: [
            "Underline the ratio and the total/amount.",
            "Find one part first.",
            "Scale the ratio to match the question.",
            "Check the answer makes sense.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Map scale 1 cm = 5 km. Two towns 3 cm apart. Real distance?" },
            { key: "option_0", value: "15 km" },
            { key: "option_1", value: "8 km" },
            { key: "option_2", value: "3 km" },
            { key: "option_3", value: "30 km" },
            { key: "answer", value: "15 km" },
            { key: "explanation", value: "3 × 5 = 15 km." },
          ],
        },
      ],
      questions: [
        { q: "Cordial:water is 1:4. How much water for 50 ml cordial?", options: ["200 ml", "50 ml", "100 ml", "250 ml"], answer: "200 ml", explain: "Water = 4 × cordial = 4 × 50 = 200." },
        { q: "Map scale 1 cm : 10 km. 6 cm on map = ?", options: ["60 km", "16 km", "6 km", "600 km"], answer: "60 km", explain: "6 × 10 = 60." },
        { q: "Flour:sugar 2:1. 300 g flour — how much sugar?", options: ["150 g", "300 g", "600 g", "100 g"], answer: "150 g", explain: "Sugar = half the flour = 150 g." },
        { q: "Ratio of boys:girls 3:2, 15 boys. How many girls?", options: ["10", "15", "20", "5"], answer: "10", explain: "1 part = 5 boys, girls = 2 × 5 = 10." },
        { q: "Best first step in any ratio word problem?", options: ["Find the value of one part", "Add everything", "Multiply randomly", "Skip it"], answer: "Find the value of one part", explain: "One part unlocks all the other amounts." },
      ],
    },

    // ===================== BASIC ALGEBRA (5) =====================
    {
      topic: "Basic Algebra",
      title: "Variables & Expressions",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "A variable is a letter that stands for an unknown number; an expression combines variables and numbers.",
      blocks: [
        { type: "heading", text: "Letters for Numbers" },
        {
          type: "text",
          text: "In algebra we use letters to stand for unknown numbers — these are called variables. An expression is a mix of numbers and variables with maths operations, like 3x + 2 or 5y − 7. We do not yet have an equals sign.\n\nThe expression 3x means '3 times x'. If x = 4, then 3x = 3 × 4 = 12. Substituting a value for the variable lets us evaluate the expression.",
        },
        {
          type: "example",
          text: "Evaluate 2x + 5 when x = 6. Substitute: 2 × 6 + 5 = 12 + 5 = 17.",
        },
        {
          type: "keyPoints",
          items: [
            "A variable (letter) stands for an unknown number.",
            "3x means 3 × x (the multiply sign is hidden).",
            "An expression has no equals sign.",
            "Substitute a value to evaluate the expression.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "What is 4x when x = 3?" },
            { key: "option_0", value: "7" },
            { key: "option_1", value: "12" },
            { key: "option_2", value: "4" },
            { key: "option_3", value: "43" },
            { key: "answer", value: "12" },
            { key: "explanation", value: "4 × 3 = 12." },
          ],
        },
      ],
      questions: [
        { q: "Evaluate 5x when x = 2.", options: ["10", "7", "25", "52"], answer: "10", explain: "5 × 2 = 10." },
        { q: "Evaluate 3y + 1 when y = 4.", options: ["12", "13", "7", "34"], answer: "13", explain: "3×4 + 1 = 13." },
        { q: "What does '7a' mean?", options: ["7 plus a", "7 times a", "7 minus a", "7 to the power a"], answer: "7 times a", explain: "Hidden multiply sign." },
        { q: "Which is an expression (not equation)?", options: ["3x + 2", "x = 5", "2 = 2", "y − 1 = 9"], answer: "3x + 2", explain: "No equals sign → expression." },
        { q: "Evaluate 10 − 2x when x = 3.", options: ["4", "6", "8", "14"], answer: "4", explain: "10 − 2×3 = 10 − 6 = 4." },
      ],
    },
    {
      topic: "Basic Algebra",
      title: "Writing Expressions",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Turn word phrases into algebra by letting a letter stand for the unknown number.",
      blocks: [
        { type: "heading", text: "Words to Algebra" },
        {
          type: "text",
          text: "We can turn English phrases into algebraic expressions. 'A number plus 4' becomes n + 4. 'Three times a number' becomes 3n. 'A number subtracted from 10' becomes 10 − n (order matters!).\n\nChoose any letter for the unknown — n and x are most common. Read carefully, especially phrases like 'less than' which swap the order.",
        },
        {
          type: "example",
          text: "'5 less than a number' → n − 5. 'A number less than 5' → 5 − n. The words before 'than' tell you what to subtract FROM.",
        },
        {
          type: "keyPoints",
          items: [
            "Let a letter (n, x) be the unknown number.",
            "'plus' → +, 'minus/less' → −, 'times/product' → ×, 'of' → ×.",
            "'A less than B' → B − A (order swaps).",
            "Read each phrase slowly before writing.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Write '3 more than a number n'." },
            { key: "option_0", value: "n + 3" },
            { key: "option_1", value: "3 − n" },
            { key: "option_2", value: "3n" },
            { key: "option_3", value: "n − 3" },
            { key: "answer", value: "n + 3" },
            { key: "explanation", value: "'More than' = add: n + 3." },
          ],
        },
      ],
      questions: [
        { q: "'Twice a number' is…", options: ["2n", "n + 2", "n − 2", "n/2"], answer: "2n", explain: "Twice = 2 times." },
        { q: "'5 less than n' is…", options: ["n − 5", "5 − n", "5n", "n + 5"], answer: "n − 5", explain: "Take 5 from the number." },
        { q: "'10 minus a number' is…", options: ["10 − n", "n − 10", "10n", "n + 10"], answer: "10 − n", explain: "10 is the start, subtract the number." },
        { q: "'The product of 4 and n' is…", options: ["4n", "4 + n", "4 − n", "n/4"], answer: "4n", explain: "Product = multiply." },
        { q: "'A number divided by 3' is…", options: ["n/3", "3/n", "3n", "n − 3"], answer: "n/3", explain: "Divide the number by 3." },
      ],
    },
    {
      topic: "Basic Algebra",
      title: "One-step Equations (Add & Subtract)",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Solve x + a = b by doing the opposite to both sides: subtract a to get x alone.",
      blocks: [
        { type: "heading", text: "The Golden Rule of Equations" },
        {
          type: "text",
          text: "An equation has an equals sign and says two things are the same. To solve for x, we want x alone on one side. The golden rule: whatever you do to one side, do to the other — this keeps it balanced.\n\nFor x + 5 = 12, do the OPPOSITE of adding 5: subtract 5 from both sides. x + 5 − 5 = 12 − 5, so x = 7.",
        },
        {
          type: "example",
          text: "Solve y − 4 = 10. The opposite of subtracting 4 is adding 4. Add 4 to both sides: y = 10 + 4 = 14.",
        },
        {
          type: "keyPoints",
          items: [
            "Do the same to BOTH sides.",
            "Use the OPPOSITE operation to undo.",
            "Addition ↔ subtraction.",
            "Check by substituting your answer back in.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Solve: x + 6 = 15" },
            { key: "option_0", value: "x = 9" },
            { key: "option_1", value: "x = 21" },
            { key: "option_2", value: "x = 6" },
            { key: "option_3", value: "x = 15" },
            { key: "answer", value: "x = 9" },
            { key: "explanation", value: "Subtract 6 from both sides: 15 − 6 = 9." },
          ],
        },
      ],
      questions: [
        { q: "Solve x + 4 = 10.", options: ["x = 6", "x = 14", "x = 4", "x = 40"], answer: "x = 6", explain: "10 − 4 = 6." },
        { q: "Solve y − 3 = 7.", options: ["y = 4", "y = 10", "y = 21", "y = 3"], answer: "y = 10", explain: "7 + 3 = 10." },
        { q: "Solve x + 9 = 9.", options: ["x = 0", "x = 9", "x = 18", "x = 1"], answer: "x = 0", explain: "9 − 9 = 0." },
        { q: "What is the opposite of adding 7?", options: ["Subtracting 7", "Adding 7", "Multiplying 7", "Dividing 7"], answer: "Subtracting 7", explain: "Subtraction undoes addition." },
        { q: "Solve w − 12 = 8.", options: ["w = 20", "w = 4", "w = 96", "w = −4"], answer: "w = 20", explain: "8 + 12 = 20." },
      ],
    },
    {
      topic: "Basic Algebra",
      title: "One-step Equations (Multiply & Divide)",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Solve 2x = 14 by dividing both sides by 2; solve x/3 = 5 by multiplying both sides by 3.",
      blocks: [
        { type: "heading", text: "Undoing Multiply and Divide" },
        {
          type: "text",
          text: "When the variable is multiplied or divided by a number, undo it with the opposite. To solve 2x = 14, divide both sides by 2: x = 7. To solve x/3 = 5, multiply both sides by 3: x = 15.\n\nThe golden rule still holds: whatever you do to one side, do to the other. Multiplication ↔ division are opposites, just like addition ↔ subtraction.",
        },
        {
          type: "example",
          text: "Solve 5x = 40. Divide both sides by 5: x = 40/5 = 8. Check: 5 × 8 = 40. ✓",
        },
        {
          type: "keyPoints",
          items: [
            "Multiply ↔ divide are opposites.",
            "2x = 14 → divide both sides by 2.",
            "x/3 = 5 → multiply both sides by 3.",
            "Always check your answer by substituting.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Solve: 3x = 21" },
            { key: "option_0", value: "x = 7" },
            { key: "option_1", value: "x = 18" },
            { key: "option_2", value: "x = 24" },
            { key: "option_3", value: "x = 63" },
            { key: "answer", value: "x = 7" },
            { key: "explanation", value: "Divide both sides by 3: 21 ÷ 3 = 7." },
          ],
        },
      ],
      questions: [
        { q: "Solve 2x = 14.", options: ["x = 7", "x = 12", "x = 28", "x = 16"], answer: "x = 7", explain: "14 ÷ 2 = 7." },
        { q: "Solve x/4 = 6.", options: ["x = 24", "x = 2", "x = 10", "x = 1.5"], answer: "x = 24", explain: "6 × 4 = 24." },
        { q: "Solve 10x = 90.", options: ["x = 9", "x = 100", "x = 80", "x = 900"], answer: "x = 9", explain: "90 ÷ 10 = 9." },
        { q: "What undoes multiplying by 5?", options: ["Dividing by 5", "Adding 5", "Multiplying by 5", "Subtracting 5"], answer: "Dividing by 5", explain: "Division undoes multiplication." },
        { q: "Solve x/2 = 11.", options: ["x = 22", "x = 5.5", "x = 13", "x = 9"], answer: "x = 22", explain: "11 × 2 = 22." },
      ],
    },
    {
      topic: "Basic Algebra",
      title: "Two-step Equations",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "Solve 2x + 3 = 11 in two steps: undo addition first, then undo multiplication.",
      blocks: [
        { type: "heading", text: "Two Steps to Freedom" },
        {
          type: "text",
          text: "A two-step equation needs two opposite moves. Solve 2x + 3 = 11: first undo the +3 by subtracting 3 from both sides → 2x = 8. Then undo the ×2 by dividing both sides by 2 → x = 4.\n\nOrder matters: deal with the add/subtract FIRST (the step touching the variable), then the multiply/divide. Always finish by checking: 2(4) + 3 = 8 + 3 = 11. ✓",
        },
        {
          type: "example",
          text: "Solve 3x − 5 = 16. Add 5 to both sides → 3x = 21. Divide both sides by 3 → x = 7.",
        },
        {
          type: "keyPoints",
          items: [
            "Undo add/subtract first.",
            "Then undo multiply/divide.",
            "Keep both sides balanced each step.",
            "Check by substituting your final answer.",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Solve: 2x + 3 = 11. First step?" },
            { key: "option_0", value: "Subtract 3 from both sides (2x = 8)" },
            { key: "option_1", value: "Divide both sides by 2" },
            { key: "option_2", value: "Add 3 to both sides" },
            { key: "option_3", value: "Multiply by 11" },
            { key: "answer", value: "Subtract 3 from both sides (2x = 8)" },
            { key: "explanation", value: "Undo the +3 first, then divide by 2 → x = 4." },
          ],
        },
      ],
      questions: [
        { q: "Solve 2x + 1 = 9.", options: ["x = 4", "x = 5", "x = 8", "x = 10"], answer: "x = 4", explain: "9−1=8, 8÷2=4." },
        { q: "Solve 3x − 6 = 12.", options: ["x = 6", "x = 2", "x = 18", "x = 9"], answer: "x = 6", explain: "12+6=18, 18÷3=6." },
        { q: "Solve 4x + 2 = 18.", options: ["x = 4", "x = 5", "x = 8", "x = 16"], answer: "x = 4", explain: "18−2=16, 16÷4=4." },
        { q: "First step to solve 5x − 3 = 22?", options: ["Add 3 to both sides", "Divide by 5", "Subtract 22", "Multiply by 3"], answer: "Add 3 to both sides", explain: "Undo the −3 first." },
        { q: "Solve 2(x + 3) = 14. (Hint: divide first!)", options: ["x = 4", "x = 11", "x = 2", "x = 8"], answer: "x = 4", explain: "Divide by 2 → x+3 = 7 → x = 4." },
      ],
    },

    // ===================== PROBLEM SOLVING (4) =====================
    {
      topic: "Problem Solving",
      title: "The 4-Step Plan",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Use Read, Plan, Solve, Check to turn messy word problems into clear steps.",
      blocks: [
        { type: "heading", text: "A Method That Always Works" },
        {
          type: "text",
          text: "Good problem-solvers follow a plan. The four steps are: 1) READ — understand what is asked. 2) PLAN — choose the operation(s). 3) SOLVE — do the maths. 4) CHECK — does the answer make sense?\n\nMost mistakes happen because students rush into SOLVE before READ. Slow down at the start: underline the question and the numbers that matter.",
        },
        {
          type: "example",
          text: "'12 biscuits shared between 4 children, then 2 are eaten. How many left?' READ: find biscuits left. PLAN: divide 12 by 4, then subtract 2. SOLVE: 12÷4 = 3, 3−2 = 1. CHECK: 1 biscuit each left — reasonable.",
        },
        {
          type: "keyPoints",
          items: [
            "READ: what is being asked?",
            "PLAN: which operations, in what order?",
            "SOLVE: do the maths carefully.",
            "CHECK: does the answer make sense?",
          ],
        },
        {
          type: "interactive",
          variant: "ordering",
          data: [
            { key: "1", value: "Read and understand the question" },
            { key: "2", value: "Plan which operations to use" },
            { key: "3", value: "Solve by doing the maths" },
            { key: "4", value: "Check the answer makes sense" },
          ],
        },
      ],
      questions: [
        { q: "What is the FIRST step in the 4-step plan?", options: ["Read the problem", "Solve it", "Guess", "Check"], answer: "Read the problem", explain: "Understand before you calculate." },
        { q: "When should you CHECK your answer?", options: ["At the end", "Never", "Before reading", "Only in algebra"], answer: "At the end", explain: "Check after solving." },
        { q: "Which step chooses the operation (+, −, ×, ÷)?", options: ["Plan", "Read", "Solve", "Check"], answer: "Plan", explain: "Planning picks the operation(s)." },
        { q: "Most mistakes happen because students skip…", options: ["Reading carefully", "Adding", "Checking spelling", "Drawing"], answer: "Reading carefully", explain: "Rushing causes errors." },
        { q: "A result says a school bus holds 250 children. You should…", options: ["Check — that seems too many", "Trust it blindly", "Make it bigger", "Ignore the units"], answer: "Check — that seems too many", explain: "Sense-check catches silly answers." },
      ],
    },
    {
      topic: "Problem Solving",
      title: "Choosing the Operation",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Key words and the question's story hint at which operation (+, −, ×, ÷) to use.",
      blocks: [
        { type: "heading", text: "Plus, Minus, Times, Share" },
        {
          type: "text",
          text: "Choosing the right operation is half the battle. Words like 'total', 'altogether', 'sum' and 'in all' usually mean ADD. 'Left', 'fewer', 'difference' and 'minus' usually mean SUBTRACT. 'Each' (with equal groups) often means MULTIPLY. 'Shared equally' or 'per' often mean DIVIDE.\n\nBut always picture the story — words can trick you. Think about what is happening to the amounts, not just keywords.",
        },
        {
          type: "example",
          text: "'3 boxes with 6 eggs each' → groups of equal size → MULTIPLY: 3 × 6 = 18 eggs.",
        },
        {
          type: "keyPoints",
          items: [
            "Total/altogether/sum → +",
            "Left/fewer/difference → −",
            "Each (equal groups) → ×",
            "Shared equally/per → ÷",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "'24 sweets shared equally among 6 friends.' Which operation?" },
            { key: "option_0", value: "Divide (24 ÷ 6)" },
            { key: "option_1", value: "Multiply (24 × 6)" },
            { key: "option_2", value: "Add (24 + 6)" },
            { key: "option_3", value: "Subtract (24 − 6)" },
            { key: "answer", value: "Divide (24 ÷ 6)" },
            { key: "explanation", value: "'Shared equally' → divide." },
          ],
        },
      ],
      questions: [
        { q: "'5 bags, 8 apples each.' Operation?", options: ["Multiply", "Add", "Subtract", "Divide"], answer: "Multiply", explain: "Equal groups → multiply." },
        { q: "'Tom had 12, gave away 4.' Operation?", options: ["Subtract", "Add", "Multiply", "Divide"], answer: "Subtract", explain: "'Gave away' → subtract." },
        { q: "'Cost of 3 pens at £2 each.' Operation?", options: ["Multiply", "Add", "Subtract", "Divide"], answer: "Multiply", explain: "Each → equal groups → multiply." },
        { q: "'Total of 7 and 9.' Operation?", options: ["Add", "Subtract", "Multiply", "Divide"], answer: "Add", explain: "'Total' → add." },
        { q: "'£40 split between 8 people.' Operation?", options: ["Divide", "Multiply", "Add", "Subtract"], answer: "Divide", explain: "'Split' → divide." },
      ],
    },
    {
      topic: "Problem Solving",
      title: "Multi-step Word Problems",
      difficulty: "intermediate",
      minutes: 14,
      points: 90,
      summary: "Some problems need two or more steps — solve them in order, showing each calculation.",
      blocks: [
        { type: "heading", text: "One Step Is Not Always Enough" },
        {
          type: "text",
          text: "Many real problems need more than one calculation. Read carefully and ask: what do I need to find first? Then use that answer in the next step. Show your working so you (and others) can follow your thinking.\n\nA good habit is to label each step: 'Step 1: cost of pencils. Step 2: total cost.' This keeps multi-step problems from becoming a muddle.",
        },
        {
          type: "example",
          text: "'3 rulers at £2 each and a notebook for £5. Total cost?' Step 1: 3 × £2 = £6 (rulers). Step 2: £6 + £5 = £11 total.",
        },
        {
          type: "keyPoints",
          items: [
            "Decide what to find FIRST.",
            "Use that answer in the next step.",
            "Label each step clearly.",
            "Re-read at the end: did you answer the actual question?",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "4 pencils at £1 each, plus an eraser for £2. Total?" },
            { key: "option_0", value: "£6" },
            { key: "option_1", value: "£4" },
            { key: "option_2", value: "£7" },
            { key: "option_3", value: "£3" },
            { key: "answer", value: "£6" },
            { key: "explanation", value: "4×£1 = £4, +£2 = £6." },
          ],
        },
      ],
      questions: [
        { q: "2 packs of 6 buns, then 3 eaten. How many left?", options: ["9", "15", "12", "3"], answer: "9", explain: "2×6=12, 12−3=9." },
        { q: "A bus has 40 seats, 9 empty. 4 more people get on. How many now?", options: ["35", "31", "44", "27"], answer: "35", explain: "40−9=31 on board, +4=35." },
        { q: "3 cakes cut into 8 slices, 10 sold. Slices left?", options: ["14", "24", "10", "2"], answer: "14", explain: "3×8=24, 24−10=14." },
        { q: "First step: '5 boxes of 12 pens, 7 broken. Good pens?'", options: ["Multiply 5 × 12", "Subtract 7", "Add 12", "Divide by 5"], answer: "Multiply 5 × 12", explain: "Find total pens first." },
        { q: "Why label each step?", options: ["To keep working clear and checkable", "To use more ink", "It is required by teachers only", "Labels are useless"], answer: "To keep working clear and checkable", explain: "Labels make multi-step logic easy to follow." },
      ],
    },
    {
      topic: "Problem Solving",
      title: "Estimating & Checking",
      difficulty: "intermediate",
      minutes: 12,
      points: 80,
      summary: "Round numbers to estimate first, then check your exact answer is close to the estimate.",
      blocks: [
        { type: "heading", text: "Sense Before Precision" },
        {
          type: "text",
          text: "An estimate is a quick, rough answer. Round the numbers (to the nearest 10 or 100) and calculate — this gives you a ballpark. Then solve exactly. If your exact answer is nowhere near your estimate, something went wrong.\n\nTo estimate 48 × 6, round 48 to 50: 50 × 6 = 300. The exact answer 288 is close, so it is probably right. Estimating catches silly mistakes before they cost you.",
        },
        {
          type: "example",
          text: "Estimate 394 + 207. Round to 400 + 200 = 600. Exact: 601. Very close — good sign!",
        },
        {
          type: "keyPoints",
          items: [
            "Round numbers first to estimate.",
            "The exact answer should be near the estimate.",
            "Big mismatch → recheck your work.",
            "Always check: does the answer make sense?",
          ],
        },
        {
          type: "interactive",
          variant: "reveal",
          data: [
            { key: "question", value: "Estimate 47 × 4 by rounding 47 to 50." },
            { key: "option_0", value: "200" },
            { key: "option_1", value: "188" },
            { key: "option_2", value: "50" },
            { key: "option_3", value: "47" },
            { key: "answer", value: "200" },
            { key: "explanation", value: "50 × 4 = 200 (exact is 188)." },
          ],
        },
      ],
      questions: [
        { q: "Estimate 68 + 71 (round to nearest 10).", options: ["140", "139", "100", "200"], answer: "140", explain: "70 + 70 = 140." },
        { q: "Why estimate before solving exactly?", options: ["To catch silly mistakes", "It is faster to mark", "To skip working", "To avoid thinking"], answer: "To catch silly mistakes", explain: "A ballpark shows if the exact answer is sensible." },
        { q: "Estimate 296 − 102 (round to nearest 100).", options: ["200", "398", "100", "300"], answer: "200", explain: "300 − 100 = 200." },
        { q: "Exact answer 612; estimate was 600. This is…", options: ["Close — probably right", "Way off — wrong", "Impossible", "Too small"], answer: "Close — probably right", explain: "Exact is near the estimate." },
        { q: "Best way to CHECK a word-problem answer?", options: ["Re-read and ask if it makes sense", "Guess again", "Pick a bigger number", "Erase it"], answer: "Re-read and ask if it makes sense", explain: "Sense-checking is the final safety net." },
      ],
    },
  ],
};

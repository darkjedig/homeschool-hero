/** Spoken English + display cleanup for Cosmo maths. Never leave LaTeX for TTS. */

const SMALL = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

const DENOM: Record<number, readonly [string, string]> = {
  2: ["half", "halves"],
  3: ["third", "thirds"],
  4: ["quarter", "quarters"],
  5: ["fifth", "fifths"],
  6: ["sixth", "sixths"],
  7: ["seventh", "sevenths"],
  8: ["eighth", "eighths"],
  9: ["ninth", "ninths"],
  10: ["tenth", "tenths"],
  11: ["eleventh", "elevenths"],
  12: ["twelfth", "twelfths"],
  13: ["thirteenth", "thirteenths"],
  14: ["fourteenth", "fourteenths"],
  15: ["fifteenth", "fifteenths"],
  16: ["sixteenth", "sixteenths"],
  20: ["twentieth", "twentieths"],
  100: ["hundredth", "hundredths"],
};

export function stripTeacherDashes(text: string): string {
  return text.replace(/\s*[—–―]\s*/g, ": ");
}

function numberWords(n: number): string {
  if (n < 0) return `negative ${numberWords(-n)}`;
  if (n < 20) return SMALL[n] ?? String(n);
  if (n < 100) {
    const tens = TENS[Math.floor(n / 10)] ?? "";
    const ones = n % 10;
    return ones ? `${tens} ${SMALL[ones]}` : tens;
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const head = `${SMALL[hundreds]} hundred`;
    return rest ? `${head} and ${numberWords(rest)}` : head;
  }
  return String(n);
}

export function speakFraction(numerator: string, denominator: string): string {
  const n = Number(numerator.trim());
  const d = Number(denominator.trim());
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) {
    return `${numerator.trim()} over ${denominator.trim()}`;
  }
  const sign = n < 0 ? "negative " : "";
  const absN = Math.abs(n);
  const pair = DENOM[d];
  if (!pair) return `${sign}${numberWords(absN)} over ${numberWords(Math.abs(d))}`;
  if (absN === 1) return `${sign}one ${pair[0]}`;
  return `${sign}${numberWords(absN)} ${pair[1]}`;
}

function unwrapMathDelimiters(text: string): string {
  return text
    .replace(/\$\$([\s\S]+?)\$\$/g, "$1")
    .replace(/\$([^$\n]+)\$/g, "$1")
    .replace(/\\\(([\s\S]+?)\\\)/g, "$1")
    .replace(/\\\[([\s\S]+?)\\\]/g, "$1");
}

function replaceLatexFractions(
  text: string,
  render: (num: string, den: string) => string,
): string {
  let s = text;
  for (let i = 0; i < 8; i++) {
    const next = s.replace(
      /\\(?:d|t)?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
      (_m, num: string, den: string) => render(num, den),
    );
    if (next === s) break;
    s = next;
  }
  return s;
}

function tidySpaces(text: string): string {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ +\s*([,.:;!?])/g, "$1")
    .trim();
}

/** Readable chat text: no LaTeX, fractions as 2/7. */
export function sanitizeTeacherDisplay(text: string): string {
  let s = unwrapMathDelimiters(stripTeacherDashes(text));
  s = replaceLatexFractions(s, (num, den) => `${num.trim()}/${den.trim()}`);
  s = s
    .replace(/\\times/g, " × ")
    .replace(/\\div/g, " ÷ ")
    .replace(/\\cdot/g, " · ")
    .replace(/\\pm/g, " ± ")
    .replace(/\\leq/g, " ≤ ")
    .replace(/\\geq/g, " ≥ ")
    .replace(/\\neq/g, " ≠ ")
    .replace(/\\infty/g, " infinity ")
    .replace(/\\pi/g, " π ")
    .replace(/\\%/g, "%")
    .replace(/\\left|\\right/g, "")
    .replace(/\\,|\\;|\\!|\\:|\\quad|\\qquad/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/\s*=\s*/g, " = ")
    .replace(/\s*−\s*/g, " − ")
    .replace(/\s*×\s*/g, " × ")
    .replace(/\s*÷\s*/g, " ÷ ");
  return tidySpaces(s);
}

function speakBareFractions(text: string): string {
  return text.replace(/\b(\d{1,4})\s*\/\s*(\d{1,4})\b/g, (_m, num: string, den: string) =>
    speakFraction(num, den),
  );
}

/** Plain English for TTS. Never pass LaTeX or slash-fractions through. */
export function speechPlainText(text: string): string {
  let s = unwrapMathDelimiters(stripTeacherDashes(text));
  s = replaceLatexFractions(s, (num, den) => ` ${speakFraction(num, den)} `);
  s = s
    .replace(/\\times/g, " times ")
    .replace(/\\div/g, " divided by ")
    .replace(/\\cdot/g, " times ")
    .replace(/\\pm/g, " plus or minus ")
    .replace(/\\leq/g, " less than or equal to ")
    .replace(/\\geq/g, " greater than or equal to ")
    .replace(/\\neq/g, " is not equal to ")
    .replace(/\\infty/g, " infinity ")
    .replace(/\\pi/g, " pi ")
    .replace(/\\%/g, " percent ")
    .replace(/\\left|\\right/g, " ")
    .replace(/\\,|\\;|\\!|\\:|\\quad|\\qquad/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, " ");
  s = speakBareFractions(s);
  s = s
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/·/g, " times ")
    .replace(/±/g, " plus or minus ")
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/≠/g, " is not equal to ")
    .replace(/π/g, " pi ")
    .replace(/\+/g, " plus ")
    .replace(/−/g, " minus ")
    .replace(/=/g, " equals ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\*\*/g, "")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/`+/g, "")
    .replace(/[_\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

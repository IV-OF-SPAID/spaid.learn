export interface QuizQuestion {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number;
}

/** Phrases to always remove from quiz generation */
const BANNED_PHRASES = [
  /Alternative Learning System K to 12 Basic Education Curriculum/gi,
  /ALS K to 12 BEC/gi
];

function sanitizeContent(input: string): string {
  if (!input) return "";
  let out = input;
  for (const re of BANNED_PHRASES) out = out.replace(re, "");
  return out.replace(/\s{2,}/g, " ").trim();
}

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDefaultQuestion(id: number | string): QuizQuestion {
  return {
    id,
    question: "What is the main topic discussed in this section?",
    options: ["Education", "History", "Geography", "Science"],
    correctAnswer: 0
  };
}

function generateWrongAnswers(correctWord: string, candidates: string[], max = 3): string[] {
  const out: string[] = [];
  const cleaned = candidates
    .map(w => w.replace(/[^a-zA-Z]/g, ""))
    .filter(w => w.length > 2 && w.toLowerCase() !== correctWord.toLowerCase());

  for (const w of cleaned) {
    if (out.length >= max) break;
    if (!out.includes(w)) out.push(w);
  }

  const fillers = ["information", "knowledge", "learning", "development", "understanding", "education"];
  let i = 0;
  while (out.length < max) {
    const f = fillers[i++] || `option${i}`;
    if (f.toLowerCase() !== correctWord.toLowerCase() && !out.includes(f)) out.push(f);
  }

  return out.slice(0, max);
}

export function generateQuizFromContent(content: string): QuizQuestion {
  const safe = sanitizeContent(content);
  const sentences = safe
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);

  if (sentences.length === 0) return getDefaultQuestion(Math.random().toString(36));

  const selectedSentence = sentences[Math.floor(Math.random() * Math.min(sentences.length, 5))];

  const words = selectedSentence
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z]/g, ""))
    .filter(w => w.length > 3 && !/^\d+$/.test(w));

  if (words.length === 0) return getDefaultQuestion(Math.random().toString(36));

  const keyWord = words[Math.floor(Math.random() * words.length)];
  const questionText = `Complete the following: "${selectedSentence.replace(
    new RegExp(`\\b${keyWord}\\b`, "i"),
    "_____"
  )}"`;

  const otherWords = words.filter(w => w.toLowerCase() !== keyWord.toLowerCase());
  const wrongAnswers = generateWrongAnswers(keyWord, otherWords, 3);
  const options = shuffleArray([keyWord, ...wrongAnswers]);
  const correctAnswer = options.indexOf(keyWord);

  return {
    id: Math.random().toString(36),
    question: questionText,
    options,
    correctAnswer
  };
}

export function generateMultipleQuizQuestions(
  pages: { content: string }[],
  count: number = 5
): QuizQuestion[] {
  if (!pages || pages.length === 0) {
    // return default set of count questions
    const defaults: QuizQuestion[] = [];
    for (let i = 0; i < count; i++) defaults.push(getDefaultQuestion(i));
    return defaults;
  }

  const pool: QuizQuestion[] = pages.map((p, i) => {
    const q = generateQuizFromContent(p.content || "");
    q.id = typeof q.id === "number" ? q.id : i;
    return q;
  });

  // pick unique questions (by question text) and fill to `count`
  const picked: QuizQuestion[] = [];
  const seen = new Set<string>();
  const shuffledPool = shuffleArray(pool);

  for (const q of shuffledPool) {
    if (picked.length >= count) break;
    if (!seen.has(q.question)) {
      picked.push(q);
      seen.add(q.question);
    }
  }

  while (picked.length < count) {
    const page = pages[Math.floor(Math.random() * pages.length)];
    const extra = generateQuizFromContent(page.content || "");
    if (!seen.has(extra.question)) {
      picked.push(extra);
      seen.add(extra.question);
    } else {
      // allow duplicates if no new unique available after attempts
      picked.push(extra);
    }
  }

  return shuffleArray(picked).slice(0, count);
}
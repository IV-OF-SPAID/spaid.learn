export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export function generateQuizFromContent(content: string): QuizQuestion {
  // Extract sentences from content
  const sentences = content
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);

  if (sentences.length === 0) {
    return getDefaultQuestion();
  }

  // Pick a random sentence to base the question on
  const randomIndex = Math.floor(Math.random() * Math.min(sentences.length, 5));
  const selectedSentence = sentences[randomIndex];

  // Extract key terms (words with more than 5 characters, likely important)
  const words = selectedSentence.split(/\s+/).filter(w => w.length > 5);
  
  if (words.length === 0) {
    return getDefaultQuestion();
  }

  // Pick a word to blank out for fill-in-the-blank style
  const keyWordIndex = Math.floor(Math.random() * words.length);
  const keyWord = words[keyWordIndex].replace(/[^a-zA-Z]/g, '');

  // Create question by blanking out the key word
  const questionText = `According to the text, complete the following: "${selectedSentence.replace(
    new RegExp(`\\b${keyWord}\\b`, 'i'),
    '_____'
  )}"`;

  // Generate wrong answers (variations or random words from text)
  const otherWords = words
    .filter((_, i) => i !== keyWordIndex)
    .map(w => w.replace(/[^a-zA-Z]/g, ''))
    .filter(w => w.length > 3);

  const wrongAnswers = generateWrongAnswers(keyWord, otherWords);

  // Shuffle options
  const options = shuffleArray([keyWord, ...wrongAnswers]);
  const correctAnswer = options.indexOf(keyWord);

  return {
    question: questionText,
    options,
    correctAnswer
  };
}

function generateWrongAnswers(correctWord: string, availableWords: string[]): string[] {
  const wrongAnswers: string[] = [];
  
  // Use other words from text if available
  for (const word of availableWords) {
    if (wrongAnswers.length >= 3) break;
    if (word.toLowerCase() !== correctWord.toLowerCase() && !wrongAnswers.includes(word)) {
      wrongAnswers.push(word);
    }
  }

  // Fill remaining slots with generic options
  const fillers = ['information', 'development', 'understanding', 'knowledge', 'learning', 'education'];
  while (wrongAnswers.length < 3) {
    const filler = fillers[wrongAnswers.length];
    if (filler.toLowerCase() !== correctWord.toLowerCase()) {
      wrongAnswers.push(filler);
    }
  }

  return wrongAnswers.slice(0, 3);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDefaultQuestion(): QuizQuestion {
  return {
    question: "What is the main topic discussed in this section?",
    options: [
      "Alternative Learning System",
      "Traditional Education",
      "Online Gaming",
      "Sports Training"
    ],
    correctAnswer: 0
  };
}
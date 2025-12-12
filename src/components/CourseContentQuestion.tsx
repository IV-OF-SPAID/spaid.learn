import React, { useState, useEffect } from "react";
import { generateQuizFromContent, QuizQuestion } from "../utils/quizGenerator";

interface Props {
  content?: string;
  pageNumber?: number;
}

const CourseContentQuestion: React.FC<Props> = ({ content = "", pageNumber = 1 }) => {
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Generate new question when content or page changes
  useEffect(() => {
    if (content) {
      const newQuiz = generateQuizFromContent(content);
      setQuiz(newQuiz);
      setSelectedAnswer(null);
      setSubmitted(false);
      setIsCorrect(false);
    }
  }, [content, pageNumber]);

  const handleSubmit = () => {
    if (selectedAnswer === null || !quiz) return;
    
    setSubmitted(true);
    setIsCorrect(selectedAnswer === quiz.correctAnswer);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  if (!quiz) {
    return (
      <div className="border border-[rgba(0,0,0,0.25)] rounded-lg p-4">
        <p className="text-sm text-gray-500">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="border border-[rgba(0,0,0,0.25)] rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-2">QUESTION</h3>
      <p className="text-xs text-black mb-4 leading-relaxed">{quiz.question}</p>
      
      <div className="mb-4">
        <p className="font-medium text-xs mb-2">Possible Answers</p>
        <div className="space-y-2">
          {quiz.options.map((option, index) => (
            <label 
              key={index} 
              className={`flex items-center gap-2 text-xs cursor-pointer p-2 rounded ${
                submitted
                  ? index === quiz.correctAnswer
                    ? 'bg-green-100 text-green-800'
                    : index === selectedAnswer
                    ? 'bg-red-100 text-red-800'
                    : ''
                  : selectedAnswer === index
                  ? 'bg-gray-100'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => !submitted && setSelectedAnswer(index)}
                disabled={submitted}
                className="cursor-pointer"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {submitted && (
        <div className={`text-xs mb-4 p-2 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? '✓ Correct! Well done.' : '✗ Incorrect. The correct answer is highlighted in green.'}
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        {submitted && !isCorrect && (
          <button 
            onClick={handleRetry}
            className="px-4 py-2 text-xs border border-[rgba(0,0,0,0.25)] rounded hover:bg-gray-50"
          >
            Try Again
          </button>
        )}
        <button 
          onClick={handleSubmit}
          disabled={selectedAnswer === null || submitted}
          className="px-4 py-2 text-xs border border-[rgba(0,0,0,0.25)] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default CourseContentQuestion;
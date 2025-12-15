import React, { useState, useEffect } from "react";
import { IoMdRepeat, IoMdTime } from "react-icons/io";
import { TbTargetArrow } from "react-icons/tb";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  generateMultipleQuizQuestions,
  generateQuizFromContent,
  QuizQuestion,
} from "../utils/quizGenerator";
import supabase from "../config/supabaseClient";
import { parseAndPaginateContent, ParsedPage } from "../utils/contentParser";

const TARGET_QUIZ_COUNT = 5;

function shuffleArray<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const StartQuiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const state = (location.state || {}) as any;
  const initialPages = state.pages as ParsedPage[] | undefined;
  const initialCourseName = state.courseName as string | undefined;
  const courseId = params.id ?? state.id;

  const [pages, setPages] = useState<ParsedPage[] | null>(initialPages ?? null);
  const [courseName, setCourseName] = useState<string | undefined>(
    initialCourseName
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (pages) return;

    if (courseId) {
      let cancelled = false;
      const fetchCourseAndPages = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from("course_id")
            .select("*")
            .eq("id", courseId)
            .single();

          if (error) throw error;
          if (cancelled) return;

          const content = (data as any)?.course_content ?? "";
          const paginated = parseAndPaginateContent(content, 2000);
          setPages(paginated);
          setCourseName((data as any)?.course_name ?? courseName);
        } catch (e: any) {
          if (!cancelled) setError(e?.message ?? String(e));
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      fetchCourseAndPages();
      return () => {
        cancelled = true;
      };
    }

    navigate("/Home");
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ensure exactly TARGET_QUIZ_COUNT questions
  const buildFiveQuestions = (pagesArr: ParsedPage[]): QuizQuestion[] => {
    if (!pagesArr || pagesArr.length === 0) return [];

    // Start with generator's selection (may produce <= TARGET_QUIZ_COUNT)
    const base = generateMultipleQuizQuestions(
      pagesArr.map((p) => ({ content: p.content })),
      TARGET_QUIZ_COUNT
    );

    const results: QuizQuestion[] = [...base];

    // Fill until we have TARGET_QUIZ_COUNT by generating from random pages (allow duplicates)
    while (results.length < TARGET_QUIZ_COUNT) {
      const page = pagesArr[Math.floor(Math.random() * pagesArr.length)];
      const q = generateQuizFromContent(page.content);
      results.push(q);
    }

    return shuffleArray(results).slice(0, TARGET_QUIZ_COUNT);
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/Home");
  };

  const handleStartQuiz = () => {
    if (!pages || pages.length === 0) return;
    const quizQuestions = buildFiveQuestions(pages);
    setQuestions(quizQuestions);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRetryQuiz = () => {
    if (!pages || pages.length === 0) return;
    const quizQuestions = buildFiveQuestions(pages);
    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  // Loading / error fallback
  if (loading) return <div className="p-6 text-center">Loading quiz...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  // (rest of the component UI unchanged) ...
  // Quiz Result Screen, Quiz Question Screen, Start Quiz Screen
  // — unchanged from your current file, they use questions, quizStarted, etc.

  // Quiz Result Screen
  if (showResult) {
    return (
      <div className="w-full flex flex-col items-center min-h-screen px-4 py-6 pt-35">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-22 cursor-pointer left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
        >
          <FaChevronLeft />
          <span>Learn / Courses / {courseName}</span>
        </button>

        <div className="w-[70%] bg-[#F5F5F5] border-[rgba(0,0,0,0.1)] rounded-md">
          <div className="px-8 py-10 text-center">
            <div className="text-3xl md:text-4xl font-semibold text-black mb-6">
              Quiz Complete!
            </div>
            <div className="text-6xl font-bold text-black mb-4">
              {score} / {questions.length}
            </div>
            <div className="text-xl text-black/70 mb-8">
              {score === questions.length
                ? "Perfect! You've mastered this material!"
                : score >= questions.length / 2
                ? "Good job! Keep learning!"
                : "Keep practicing, you'll get there!"}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex justify-center gap-4 mt-6">
          <button
            type="button"
            className="border border-[rgba(0,0,0,0.25)] rounded px-5 py-2 text-sm text-black cursor-pointer"
            onClick={handleRetryQuiz}
          >
            Retry Quiz
          </button>
          <button
            type="button"
            className="border border-[rgba(0,0,0,0.25)] rounded px-5 py-2 text-sm text-black cursor-pointer"
            onClick={() => navigate("/Home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Quiz Question Screen
  if (quizStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="w-full flex flex-col items-center min-h-screen px-4 py-6 pt-35">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-22 cursor-pointer left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
        >
          <FaChevronLeft />
          <span>Learn / Courses / {courseName}</span>
        </button>

        <div className="w-[70%] bg-[#F5F5F5] border-[rgba(0,0,0,0.1)] rounded-md">
          <div className="px-8 py-10">
            <div className="text-sm text-black/70 mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="text-lg font-semibold text-black mb-6">
              {currentQuestion.question}
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer border ${
                    answered
                      ? index === currentQuestion.correctAnswer
                        ? "bg-green-100 border-green-500"
                        : index === selectedAnswer
                        ? "bg-red-100 border-red-500"
                        : "bg-white border-[rgba(0,0,0,0.1)]"
                      : selectedAnswer === index
                      ? "bg-gray-100 border-[rgba(0,0,0,0.25)]"
                      : "bg-white border-[rgba(0,0,0,0.1)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => !answered && setSelectedAnswer(index)}
                    disabled={answered}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>

            {answered && (
              <div
                className={`mt-4 p-3 rounded text-sm ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedAnswer === currentQuestion.correctAnswer
                  ? "✓ Correct!"
                  : "✗ Incorrect. The correct answer is highlighted."}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex justify-center gap-4 mt-6">
          {!answered ? (
            <button
              type="button"
              className="border border-[rgba(0,0,0,0.25)] rounded px-5 py-2 text-sm text-black cursor-pointer disabled:opacity-50"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </button>
          ) : (
            <button
              type="button"
              className="border border-[rgba(0,0,0,0.25)] rounded px-5 py-2 text-sm text-black cursor-pointer"
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "See Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Start Quiz Screen (original layout)
  return (
    <div className="w-full flex flex-col items-center min-h-screen px-4 py-6 pt-35">
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-22 cursor-pointer left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft />
        <span>Learn / Courses / {courseName || ""}</span>
      </button>

      <div className="w-[70%] bg-[#F5F5F5] border-[rgba(0,0,0,0.1)] rounded-md">
        <div className="px-8 py-10 text-center">
          <div className="text-sm text-black/70 mb-1">Let's Review!</div>
          <div className="text-3xl md:text-4xl font-semibold text-black mb-10">
            Ready, Sets, Go!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start">
            <div className="flex flex-col items-center text-center">
              <TbTargetArrow className="w-30 h-30 text-black mb-3" />
              <div className="text-lg text-black">
                Answer 5 questions
                <br />
                correctly
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <IoMdTime className="w-30 h-30 text-[#ff0300] mb-3" />
              <div className="text-xl text-black">No time limit</div>
            </div>

            <div className="flex flex-col items-center text-center">
              <IoMdRepeat className="w-30 h-30 text-black mb-3" />
              <div className="text-lg text-black">
                Repeat as many
                <br />
                times as you want
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex justify-center mt-6">
        <button
          type="button"
          className="border border-[rgba(0,0,0,0.25)] rounded px-5 py-2 text-sm text-black cursor-pointer"
          onClick={handleStartQuiz}
          disabled={!pages || pages.length === 0}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default StartQuiz;

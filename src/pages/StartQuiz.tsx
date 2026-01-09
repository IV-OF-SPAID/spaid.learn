import React, { useState, useEffect } from "react";
import { IoMdRepeat, IoMdTime } from "react-icons/io";
import { TbTargetArrow } from "react-icons/tb";
import { FaChevronLeft } from "react-icons/fa";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
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
  const [completionMarked, setCompletionMarked] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

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

  const buildFiveQuestions = (pagesArr: ParsedPage[]): QuizQuestion[] => {
    if (!pagesArr || pagesArr.length === 0) return [];

    const base = generateMultipleQuizQuestions(
      pagesArr.map((p) => ({ content: p.content })),
      TARGET_QUIZ_COUNT
    );

    const results: QuizQuestion[] = [...base];

    while (results.length < TARGET_QUIZ_COUNT) {
      const page = pagesArr[Math.floor(Math.random() * pagesArr.length)];
      const q = generateQuizFromContent(page.content);
      results.push(q);
    }

    return shuffleArray(results).slice(0, TARGET_QUIZ_COUNT);
  };

  // Mark course as completed and save highest score
  const markCourseCompleted = async (quizScore: number) => {
    if (completionMarked || !courseId) return;

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user ?? null;
      if (!user) {
        console.error("No user found, cannot mark course as completed");
        return;
      }

      const totalPages = pages ? pages.length : 1;

      // First, get the existing progress to check for highest score
      const { data: existingProgress } = await supabase
        .from("user_course_progress")
        .select("highest_quiz_score")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      const existingHighScore = existingProgress?.highest_quiz_score ?? 0;
      // Only update if new score is higher
      const newHighScore = Math.max(existingHighScore, quizScore);

      const { error: upsertError } = await supabase
        .from("user_course_progress")
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            current_page: totalPages,
            total_pages: totalPages,
            percentage: 100,
            completed: true,
            highest_quiz_score: newHighScore,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_id" }
        );

      if (upsertError) {
        console.error("Failed to mark course completed:", upsertError);
      } else {
        console.log(
          "Course marked as completed with score:",
          quizScore,
          "High score:",
          newHighScore
        );
        setCompletionMarked(true);
      }
    } catch (err) {
      console.error("Failed to mark course completed:", err);
    }
  };

  const handleStartQuiz = () => {
    if (!pages || pages.length === 0) return;
    const quizQuestions = buildFiveQuestions(pages);
    setQuestions(quizQuestions);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFinalScore(0);
    setShowResult(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setCompletionMarked(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // Quiz finished - use the current score state
      // Need to check if current answer is correct and add to score
      const isCurrentCorrect =
        selectedAnswer === questions[currentQuestionIndex].correctAnswer;
      const calculatedFinalScore = isCurrentCorrect ? score : score;
      // score already updated in handleSubmitAnswer, so just use it
      setFinalScore(score);
      setShowResult(true);
      await markCourseCompleted(score);
    }
  };

  const handleRetryQuiz = () => {
    if (!pages || pages.length === 0) return;
    const quizQuestions = buildFiveQuestions(pages);
    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinalScore(0);
    setShowResult(false);
    setAnswered(false);
    setCompletionMarked(false);
  };

  if (loading) return <div className="p-6 text-center">Loading quiz...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white min-h-screen pt-20 px-8 pb-8">
      <Link
        to="/Courses"
        className="text-[rgba(0,0,0,0.25)] flex items-center gap-2 text-sm mb-4"
      >
        <FaChevronLeft size={13} />
        <span className="flex items-center gap-1">
          <span className="hover:underline cursor-pointer">Learn</span>
          <span className="text-[rgba(0,0,0,0.25)]">/</span>
          <span className="hover:underline cursor-pointer">Courses</span>
          <span className="text-[rgba(0,0,0,0.25)]">/</span>
          <span className="hover:underline cursor-pointer">
            {courseName || "Course"}
          </span>
        </span>
      </Link>

      {showResult ? (
        <div className="w-full flex flex-col items-center bg-[#f8f8f8] px-4 py-6 pt-0">
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
              {completionMarked && (
                <div className="text-sm text-green-600 mb-4">
                  ✓ Course marked as completed
                </div>
              )}
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
            <button
              type="button"
              className="border border-[rgba(0,0,0,0.25)] bg-[#ff9801] rounded px-5 py-2 text-sm text-black cursor-pointer"
              onClick={() => navigate("/AccountSetting")}
            >
              View My Courses
            </button>
          </div>
        </div>
      ) : quizStarted && questions.length > 0 ? (
        <div className="w-full flex flex-col items-center bg-[#f8f8f8] px-4 py-6 pt-0">
          <div className="w-[70%] bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#f5f5f5] px-6 py-4 border-b border-gray-200">
              <div className="text-xs text-black/50 mb-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="text-lg font-medium text-black">
                {questions[currentQuestionIndex].question}
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-sm text-black/70 mb-4">
                Select the correct answer (Current score: {score})
              </div>

              <div className="space-y-3">
                {questions[currentQuestionIndex].options.map(
                  (option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-3 py-3 px-4 cursor-pointer rounded-md border-l-4 transition-all ${
                        answered
                          ? index ===
                            questions[currentQuestionIndex].correctAnswer
                            ? "border-l-green-500 bg-green-50"
                            : index === selectedAnswer
                            ? "border-l-red-500 bg-red-50"
                            : "border-l-[#ff9800] bg-white"
                          : selectedAnswer === index
                          ? "border-l-[#ff9800] bg-orange-50"
                          : "border-l-[#ff9800] bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => !answered && setSelectedAnswer(index)}
                        disabled={answered}
                        className="w-4 h-4 cursor-pointer accent-[#ff9800]"
                      />
                      <span className="text-sm text-black">{option}</span>
                    </label>
                  )
                )}
              </div>

              {answered && (
                <div
                  className={`mt-4 p-3 rounded text-sm ${
                    selectedAnswer ===
                    questions[currentQuestionIndex].correctAnswer
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedAnswer ===
                  questions[currentQuestionIndex].correctAnswer
                    ? "✓ Correct!"
                    : "✗ Incorrect. The correct answer is highlighted."}
                </div>
              )}

              <div className="flex justify-end mt-6">
                {!answered ? (
                  <button
                    type="button"
                    className="bg-[#ff9800] hover:bg-[#f57c00] text-white rounded-md px-6 py-2.5 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-[#ff9800] hover:bg-[#f57c00] text-white rounded-md px-6 py-2.5 text-sm font-medium cursor-pointer transition-colors"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < questions.length - 1
                      ? "Next Question"
                      : "See Results"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center min-h-screen px-4 py-6 pt-0">
          <div className="w-[70%] bg-[#F5F5F5] border-[rgba(0,0,0,0.1)] rounded-md">
            <div className="px-8 py-10 text-center">
              <div className="text-sm text-black/70 mb-1">Let's Review!</div>
              <div className="text-3xl md:text-4xl poppins-semibold text-black mb-10">
                Ready, Sets, Go!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start">
                <div className="flex flex-col items-center text-center">
                  <TbTargetArrow className="w-30 h-30 text-[#ff0300] mb-3" />
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
                  <IoMdRepeat className="w-30 h-30 text-[#ff0300] mb-3" />
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
              className="bg-[#ff9801] rounded px-5 py-2 text-sm text-black cursor-pointer"
              onClick={handleStartQuiz}
              disabled={!pages || pages.length === 0}
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartQuiz;

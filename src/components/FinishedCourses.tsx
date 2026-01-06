import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

interface Props {
  user_id?: string | null;
}

interface CompletedCourse {
  course_id: string;
  course_name: string | null;
  completed_at: string;
  highest_quiz_score: number | null;
}

const getScoreColor = (score: number | null): string => {
  if (score === null) return "text-gray-500";
  if (score <= 2) return "text-red-500";
  if (score === 3) return "text-yellow-500";
  return "text-green-500"; // 4-5
};

const FinishedCourses: React.FC<Props> = ({ user_id }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchFinishedCourses = async () => {
      setLoading(true);
      try {
        // Get all completed progress entries for this user
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("course_id, updated_at, highest_quiz_score")
          .eq("user_id", user_id)
          .eq("completed", true);

        if (progressError) {
          console.error("Error fetching progress:", progressError);
          if (mounted) setCourses([]);
          return;
        }

        if (!progressData || progressData.length === 0) {
          if (mounted) setCourses([]);
          return;
        }

        // Get course details for each completed course
        const courseIds = progressData.map((p: any) => p.course_id);
        const { data: courseData, error: courseError } = await supabase
          .from("course_id")
          .select("id, course_name")
          .in("id", courseIds);

        if (courseError) {
          console.error("Error fetching courses:", courseError);
          if (mounted) setCourses([]);
          return;
        }

        // Combine progress and course data
        const completedCourses: CompletedCourse[] = progressData.map((p: any) => {
          const course = courseData?.find((c: any) => c.id === p.course_id);
          return {
            course_id: p.course_id,
            course_name: course?.course_name ?? "Unknown Course",
            completed_at: p.updated_at,
            highest_quiz_score: p.highest_quiz_score ?? null,
          };
        });

        if (mounted) setCourses(completedCourses);
      } catch (err) {
        console.error("FinishedCourses fetch error:", err);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFinishedCourses();
    return () => {
      mounted = false;
    };
  }, [user_id]);

  const displayedCourses = showAll ? courses : courses.slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 px-3 flex flex-col justify-between">
        <div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-3 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="font-semibold text-lg mb-2">Finished Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">No finished courses.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {displayedCourses.map((course) => (
              <li
                key={course.course_id}
                className="flex justify-between items-center py-2 border-l-4 border-[#ff9801] rounded-lg shadow-sm pl-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/view-course/${course.course_id}`)}
              >
                <span className="text-sm hover:underline">
                  {course.course_name}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(course.highest_quiz_score)}`}>
                  {course.highest_quiz_score !== null
                    ? `Best: ${course.highest_quiz_score}/5`
                    : "No score"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {courses.length > 5 && (
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-[#1a3c6e] mt-3 cursor-pointer hover:underline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              Show less <FaChevronUp size={12} />
            </>
          ) : (
            <>
              Show more <FaChevronDown size={12} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FinishedCourses;
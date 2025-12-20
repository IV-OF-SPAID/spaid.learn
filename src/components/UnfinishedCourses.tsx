import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

interface Props {
  user_id?: string | null;
}

interface UnfinishedCourse {
  course_id: string;
  course_name: string | null;
  percentage: number;
}

const UnfinishedCourses: React.FC<Props> = ({ user_id }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<UnfinishedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchUnfinishedCourses = async () => {
      setLoading(true);
      try {
        // Get all unfinished progress entries for this user
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("course_id, percentage")
          .eq("user_id", user_id)
          .eq("completed", false);

        if (progressError) {
          console.error("Error fetching progress:", progressError);
          if (mounted) setCourses([]);
          return;
        }

        if (!progressData || progressData.length === 0) {
          if (mounted) setCourses([]);
          return;
        }

        // Get course details for each unfinished course
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
        const unfinishedCourses: UnfinishedCourse[] = progressData.map((p: any) => {
          const course = courseData?.find((c: any) => c.id === p.course_id);
          return {
            course_id: p.course_id,
            course_name: course?.course_name ?? "Unknown Course",
            percentage: p.percentage ?? 0,
          };
        });

        // Sort by percentage descending (highest progress first)
        unfinishedCourses.sort((a, b) => b.percentage - a.percentage);

        if (mounted) setCourses(unfinishedCourses);
      } catch (err) {
        console.error("UnfinishedCourses fetch error:", err);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUnfinishedCourses();
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
    <div className="flex-1 px-3 flex flex-col justify-between">
      <div>
        <h2 className="font-semibold text-lg mb-2">Unfinished Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">No unfinished courses.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {displayedCourses.map((course) => (
              <li
                key={course.course_id}
                className="text-sm cursor-pointer hover:underline flex justify-between items-center"
                onClick={() => navigate(`/view-course/${course.course_id}`)}
              >
                <span>{course.course_name}</span>
                <span className="text-xs text-gray-500">{course.percentage}%</span>
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

export default UnfinishedCourses;
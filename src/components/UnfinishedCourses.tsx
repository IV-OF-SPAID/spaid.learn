import React, { useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

interface UnfinishedCoursesProps {
  user_id: string | null;
}

interface Course {
  course_id: string;
  course_name: string | null;
  percentage: number;
}

const UnfinishedCourses: React.FC<UnfinishedCoursesProps> = ({ user_id }) => {
  const navigate = useNavigate(); // Add this line
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    const fetchUnfinishedCourses = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_course_progress")
        .select("course_id, percentage")
        .eq("user_id", user_id)
        .or("completed.eq.false,completed.is.null");

      if (fetchError) {
        console.error("Error fetching unfinished courses:", fetchError);
        setError(fetchError.message);
        setCourses([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const courseIds = data.map((d) => d.course_id);
      const { data: courseData, error: courseError } = await supabase
        .from("course_id")
        .select("id, course_name")
        .in("id", courseIds);

      if (courseError) {
        console.error("Error fetching course names:", courseError);
        setError(courseError.message);
        setCourses([]);
        setLoading(false);
        return;
      }

      const coursesWithNames: Course[] = data.map((d) => ({
        course_id: d.course_id,
        course_name:
          courseData?.find((c) => c.id === d.course_id)?.course_name ?? null,
        percentage: d.percentage ?? 0,
      }));

      setCourses(coursesWithNames);
      setLoading(false);
    };

    fetchUnfinishedCourses();
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Unfinished Courses</h2>
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Unfinished Courses</h2>
        <p className="text-red-500 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Unfinished Courses</h2>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-sm">No unfinished courses.</p>
      ) : (
        <ul className="flex flex-col">
          {courses.map((course) => (
            <li
              key={course.course_id}
              className="flex justify-between items-center h-40 py-2 border-l-4 border-[#ff9801] rounded-lg shadow-sm pl-3 pr-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/view-course/${course.course_id}`)}
            >
              <span className="text-sm">
                {course.course_name || "Untitled Course"}
              </span>
              <span className="text-sm text-gray-500">{course.percentage}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UnfinishedCourses;
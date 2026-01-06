import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import pallete from "../assets/img/pallete.png";

interface FinishedCourse {
  course_id: string;
  course_name: string | null;
}

const Review = () => {
  const navigate = useNavigate();
  const [finishedCourses, setFinishedCourses] = useState<FinishedCourse[]>([]);
  const [displayCourses, setDisplayCourses] = useState<FinishedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchFinishedCourses = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setFinishedCourses([]);
          return;
        }

        // Get all completed courses for this user
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("course_id")
          .eq("user_id", user.id)
          .eq("completed", true);

        if (progressError || !progressData || progressData.length === 0) {
          if (mounted) setFinishedCourses([]);
          return;
        }

        // Get course names
        const courseIds = progressData.map((p) => p.course_id);
        const { data: courseData, error: courseError } = await supabase
          .from("course_id")
          .select("id, course_name")
          .in("id", courseIds);

        if (courseError || !courseData) {
          if (mounted) setFinishedCourses([]);
          return;
        }

        const courses: FinishedCourse[] = courseData.map((c) => ({
          course_id: c.id,
          course_name: c.course_name,
        }));

        if (mounted) {
          setFinishedCourses(courses);
          // Pick up to 3 random courses to display
          const shuffled = [...courses].sort(() => Math.random() - 0.5);
          setDisplayCourses(shuffled.slice(0, 3));
        }
      } catch (e) {
        console.error("Error fetching finished courses:", e);
        if (mounted) setFinishedCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFinishedCourses();
    return () => {
      mounted = false;
    };
  }, []);

  const handleReviewClick = (courseId?: string) => {
    if (courseId) {
      // Navigate to the specific course's quiz
      navigate(`/start-quiz/${courseId}`);
    }
  };

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Don't render if no finished courses
  if (finishedCourses.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col px-4 md:px-20 pt-5 gap-5">
      <div className="w-full max-w-[880px] h-auto md:h-[170px] bg-white rounded-2xl p-4 flex flex-col justify-center gap-2 mx-auto">
        <h1>Reviewer</h1>
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-4">
          {displayCourses.map((course) => (
            <button
              style={{ backgroundImage: `url(${pallete})` }}
              key={course.course_id}
              onClick={() => handleReviewClick(course.course_id)}
              className="w-full md:w-65 h-20 md:h-25 p-5 rounded-xl flex justify-center items-center bg-[url('../../public/pallete.png')] shadow-sm bg-cover bg-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <h1 className="text-white text-sm text-center font-semibold truncate max-w-full px-2">
                {course.course_name || "Untitled Course"}
              </h1>
            </button>
          ))}
          {/* Fill remaining slots if less than 3 finished courses */}
          {displayCourses.length < 3 &&
            Array.from({ length: 3 - displayCourses.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-full md:w-65 h-20 md:h-25 p-5 rounded-xl flex justify-center items-center bg-gray-200 opacity-40"
              >
                <h1 className="text-gray-500 text-sm text-center">
                  Empty slot
                </h1>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Review;
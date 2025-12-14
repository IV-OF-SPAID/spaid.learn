import React from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";

interface ContinueLearningProps {
  user_id: string;
}

const ContinueLearning: React.FC<ContinueLearningProps> = ({ user_id }) => {
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_courses")
        .select(
          `
            progress,
            course_id (
            id,
            course_name
            )
        `
        )
        .eq("user_id", user_id)
        .lt("progress", 100);

      if (error) {
        console.error("Error fetching unfinished courses:", error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };

    if (user_id) {
      fetchCourses();
    }
  }, [user_id]);

  return (
    <div className="w-full lg:max-w-md flex overflow-hidden bg-white">
      <div className="flex-1 flex flex-col p-5 gap-2">
        <h1 className="text-xs text-center border-1 bg-[#ff0300] rounded-full px-4 py-0.5 w-fit mx-auto md:mx-0 text-white">
          Continue Learning
        </h1>
        <h1 className="text-base font-semibold">
          {courses[0]?.course_id?.course_name || "Untitled Course"}
        </h1>
        <p className="text-xs text-gray-600">
          {courses[0]?.progress}% Completed
        </p>
      </div>
      <div className="flex justify-center items-end p-4">
        {courses.length > 0 ? (
          <Link
            to={`/course/${courses[0]?.course_id?.id}`}
            className="text-[#013F5E] font-medium"
          >
            View Course
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">No course</span>
        )}
      </div>
    </div>
  );
};

export default ContinueLearning;

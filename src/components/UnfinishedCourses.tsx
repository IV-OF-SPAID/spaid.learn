import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";

const UnfinishedCourses: React.FC<{ user_id?: string | null }> = ({
  user_id,
}) => {
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);

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
      console.log("Fetched unfinished courses data:", data, error);

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

  const displayedCourses = expanded ? courses : courses.slice(0, 3);

  return (
    <div className="flex-1 px-3 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-base font-medium text-gray-700">
          Unfinished Courses
        </h1>
        {courses.length > 3 && !loading && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#013F5E] flex items-center gap-1 text-sm hover:underline cursor-pointer"
          >
            {expanded ? "See Less" : "See More"}{" "}
            {expanded ? (
              <FaChevronUp className="text-xs" />
            ) : (
              <FaChevronDown className="text-xs" />
            )}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3 text-sm md:text-base">
        {courses.length === 0 && !loading && (
          <p className="text-gray-500">No unfinished courses.</p>
        )}
        {displayedCourses.map((c, idx) => {
          const courseObj = c?.course_id;
          const id =
            (courseObj && (courseObj.id ?? courseObj)) || c?.course_id || idx;
          const name =
            (courseObj && (courseObj.course_name ?? courseObj.name)) ||
            c?.course_name ||
            "Unknown Course";

          return (
            <Link
              key={String(id)}
              to={`/course/${String(id)}`}
              className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="w-1.5 h-14 bg-[#ff9801] rounded-l-lg"></div>
              <div className="px-4 py-3 uppercase text-sm font-medium rounded-lg text-gray-700">
                {name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UnfinishedCourses;

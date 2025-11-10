import React from "react";
import { FaChevronDown } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";

const UnfinishedCourses: React.FC<{ user_id?: string | null }> = ({
  user_id,
}) => {
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

  return (
    <div className="flex-1 px-3 flex flex-col justify-between">
      <div>
        <h1 className="text-lg font-medium mb-3">Unfinished courses</h1>
        <div className="flex flex-col gap-2 text-sm md:text-base">
          {courses.map((c, idx) => {
            // defensive access: courseObj may be an object or a primitive id
            const courseObj = c?.course_id;
            const id =
              (courseObj && (courseObj.id ?? courseObj)) || c?.course_id || idx;
            const name =
              (courseObj && (courseObj.course_name ?? courseObj.name)) ||
              c?.course_name ||
              "Unknown Course";

            return (
              <Link key={String(id)} to={`/course/${String(id)}`}>
                {name}
              </Link>
            );
          })}
        </div>
      </div>
      {courses.length > 3 && !loading && (
        <div className="flex justify-end mt-3">
          <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
            Show more <FaChevronDown />
          </button>
        </div>
      )}
    </div>
  );
};

export default UnfinishedCourses;

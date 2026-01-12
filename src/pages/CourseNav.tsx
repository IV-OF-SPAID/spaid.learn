import React, { useEffect, useState } from "react";
import supabase from "@/config/supabaseClient";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  course_name: string | null;
  course_description: string | null;
}

const CourseNav: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("course_id")
        .select("id, course_name, course_description")
        .eq("course_status", "open");
      if (error) {
        setError(error.message);
      } else {
        setCourses((data as Course[]) || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? courses.filter(
        (c) =>
          c.course_name?.toLowerCase().includes(q) ||
          c.course_description?.toLowerCase().includes(q)
      )
    : courses;

  return (
    <div className="w-full mx-auto p-8 pt-20 bg-[#f8f8f8]">
      <div className="flex flex-col md:flex-row w-full md:w-1/2 px-4 md:px-0 items-stretch md:items-center gap-2 md:ml-5 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses..."
          className="w-full border border-[rgba(0,0,0,0.25)] rounded px-3 py-2 text-sm text-black"
        />
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="w-full md:w-auto bg-[#ff9801] text-white rounded px-3 py-2 text-sm cursor-pointer hover:bg-[#ff0300] transition-colors"
        >
          Clear
        </button>
      </div>

      {loading && <div className="text-sm text-black">Loading...</div>}
      {error && !loading && (
        <div className="text-sm text-red-600">Error: {error}</div>
      )}

      {!loading && !error && (
        <div className="p-3">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-black">No courses found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((c) => (
                <Link
                  to={`/course/${c.id}`}
                  key={c.id}
                  className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="w-2 self-stretch bg-[#ff9801] rounded-l-lg"></div>
                  <div className="px-4 py-4 flex flex-col">
                    <div className="uppercase text-sm font-medium text-gray-700">
                      {c.course_name || "Untitled course"}
                    </div>
                    {c.course_description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {c.course_description}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseNav;

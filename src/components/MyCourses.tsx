import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";

type Course = {
  id: string;
  course_name?: string | null;
  uploader_id?: string | null;
};

const MyCourses: React.FC<{ uploader_id?: string | null }> = ({
  uploader_id,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!uploader_id) {
        setCourses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("course_id")
          .select("id, course_name, uploader_id")
          .eq("uploader_id", uploader_id)
          .limit(50);

        if (error) throw error;
        if (!mounted) return;
        setCourses((data as Course[]) ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? String(e));
        setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [uploader_id]);

  const displayedCourses = expanded ? courses : courses.slice(0, 3);

  if (loading) {
    return (
      <div className="flex-1 px-3 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-base font-medium text-gray-700">My Courses</h1>
        </div>
        <div className="flex flex-col gap-3 text-sm md:text-base">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="w-1.5 h-14 bg-gray-200 rounded-l-lg animate-pulse"></div>
              <div className="px-4 py-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-base font-medium text-gray-700">My Courses</h1>
        {courses.length > 3 && (
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
        {error ? (
          <p className="text-sm text-red-600">Error loading courses: {error}</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">
            You have not uploaded any courses yet.
          </p>
        ) : (
          displayedCourses.map((c) => (
            <Link
              key={c.id}
              to={`/course/${c.id}`}
              className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="w-1.5 h-14 bg-[#ff9801] rounded-l-lg"></div>
              <div className="px-4 py-3 uppercase text-sm font-medium text-gray-700">
                {c.course_name ?? "Untitled course"}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default MyCourses;

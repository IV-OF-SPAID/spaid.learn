import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { Link } from "react-router";

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

  if (loading) {
    return (
      <div className="flex-1 px-3 flex flex-col justify-between">
        <div>
          <h1 className="text-lg font-medium mb-3">My courses</h1>
          <div className="flex flex-col gap-2 text-sm md:text-base">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded w-full animate-pulse my-1"
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 flex flex-col justify-between">
      <div>
        <h1 className="text-lg font-medium mb-3">My courses</h1>
        <div className="flex flex-col gap-2 text-sm md:text-base">
          {error ? (
            <p className="text-sm text-red-600">
              Error loading courses: {error}
            </p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-600">
              You have not uploaded any courses yet.
            </p>
          ) : (
            courses.map((c) => (
              <Link key={c.id} to={`/course/${c.id}`}>
                {c.course_name ?? "Untitled course"}
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end mt-3">
        {courses.length > 3 && (
          <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
            Show more <FaChevronDown />
          </button>
        )}
      </div>
    </div>
  );
};

export default MyCourses;

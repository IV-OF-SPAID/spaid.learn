import React, { useState, useEffect } from "react";
import CourseOverviewCard from "../components/CourseOverviewCard";
import CourseContentCard from "../components/CourseContentCard";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import supabase from "../config/supabaseClient";

type Course = {
  id: number;
  course_name: string;
  course_description: string;
  course_url?: string | null;
  // ...other columns...
};

const ViewCoursePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("No course id provided in URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("course_id")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!cancelled) setCourse(data as Course);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCourse();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    // go back in history if possible, otherwise fall back to /course
    if (window.history.length > 1) navigate(-1);
    else navigate("/course");
  };

  if (loading) return <div className="p-4 pt-50">Loading course...</div>;
  if (error)
    return <div className="p-4 pt-50 text-red-600">Error: {error}</div>;
  if (!course) return <div className="p-4 pt-50">Course not found.</div>;

  return (
    <div className="bg-white min-h-screen p-15 flex flex-col">
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-20 cursor-pointer left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft />
        <span>Learn / Courses / {course?.course_name}</span>
      </button>
      <div className="flex-1 flex flex-col md:flex-row gap-8 mt-20 items-stretch">
        <CourseOverviewCard course={course} />
        <CourseContentCard course={course} />
      </div>
    </div>
  );
};

export default ViewCoursePage;

import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import CourseHeader from "../components/CourseHeader";
import CourseSidebar from "../components/CourseSidebar";
import CourseDescription from "../components/CourseDescription";

type Course = {
  id: number;
  course_name: string;
  course_description: string;
  course_url?: string | null;
  // ...other columns...
};

const CoursePage = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const stateCourse = (location.state as any)?.course as Course | undefined;
  const [course, setCourse] = useState<Course | null>(stateCourse ?? null);
  const [loading, setLoading] = useState<boolean>(!stateCourse);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if we already got the course via Link state, no fetch needed
    if (stateCourse) return;

    if (!id) {
      setError("No course id provided in URL.");
      setLoading(false);
      return;
    }

    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      setError("Invalid course id.");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("course_id")
          .select("*")
          .eq("id", idNum)
          .single();

        if (error) {
          throw error;
        }
        setCourse(data as Course);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, stateCourse]);
  if (loading) return <div className="p-4">Loading course...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!course) return <div className="p-4">Course not found.</div>;

  return (
    <div className="bg-white  min-h-screen px-10 md:px-25 pt-30 py-6">
      <Link
        to="/Home"
        className="absolute top-20 left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft />
        Back
      </Link>
      <CourseHeader course={course} />
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <div className="flex-1">
          <CourseDescription course={course} />
        </div>
        <div className="flex flex-col gap-6 w-full md:w-[340px]">
          <CourseSidebar />
        </div>
      </div>
    </div>
  );
};

export default CoursePage;

import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import CourseHeader from "../components/CourseHeader";
import CourseSidebar from "../components/CourseSidebar";
import CourseDescription from "../components/CourseDescription";
import supabase from "../config/supabaseClient";

const CoursePage: React.FC = () => {
  const navigate = useNavigate();
  
  const { id } = useParams<{ id?: string }>();
  if (!id) return <div className="p-4">No course id provided.</div>;

  const handleCourseClick = async (courseId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if progress already exists
        const { data: existingProgress } = await supabase
          .from("user_course_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();

        // If no progress exists, create initial progress
        if (!existingProgress) {
          await supabase.from("user_course_progress").insert({
            user_id: user.id,
            course_id: courseId,
            current_page: 1,
            total_pages: 1,
            percentage: 1,
            completed: false,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error("Error creating progress:", e);
    }

    navigate(`/view-course/${courseId}`);
  };

  return (
    <div className="bg-[#f8f8f8]  min-h-screen px-10 md:px-25 pt-30 py-6">
      <Link
        to="/Home"
        className="absolute top-20 hover:underline left-15 text-sm text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft size={13} />
        Back
      </Link>
      <CourseHeader courseId={id} />
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <div className="flex-1">
          <CourseDescription courseId={id} />
        </div>
        <div className="flex flex-col gap-6 w-full md:w-[340px]">
          <CourseSidebar courseId={id} />
        </div>
      </div>
    </div>
  );
};

export default CoursePage;

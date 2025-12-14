import React from "react";
import { useParams, Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import CourseHeader from "../components/CourseHeader";
import CourseSidebar from "../components/CourseSidebar";
import CourseDescription from "../components/CourseDescription";

const CoursePage = () => {
  const { id } = useParams<{ id?: string }>();
  if (!id) return <div className="p-4">No course id provided.</div>;

  return (
    <div className="bg-[#f8f8f8]  min-h-screen px-10 md:px-25 pt-30 py-6">
      <Link
        to="/Home"
        className="absolute top-20 left-15 text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft />
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

import React, { useEffect, useState } from "react";
import CourseContentCard from "../components/CourseContentCard";
import { Link, useParams } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { parseAndPaginateContent, ParsedPage } from "../utils/contentParser";

type Course = {
  id: string;
  course_name: string;
  course_description: string;
  course_url?: string | null;
  course_content?: string | null;
};

const ViewCoursePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pages, setPages] = useState<ParsedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!id) {
      setError("No course ID provided in URL.");
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
        if (!cancelled) {
          setCourse(data as Course);
          
          // Parse and paginate the course content
          if (data.course_content) {
            const paginatedPages = parseAndPaginateContent(data.course_content, 2000);
            setPages(paginatedPages);
            setCurrentPage(1);
          }
        }
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

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="p-4 pt-20">Loading course...</div>;
  if (error) return <div className="p-4 pt-20 text-red-600">Error: {error}</div>;
  if (!course) return <div className="p-4 pt-20">Course not found.</div>;

  const currentPageContent = pages.find(p => p.pageNumber === currentPage);

  return (
    <div className="bg-white min-h-screen pt-16 px-8 pb-8">
      {/* Breadcrumb */}
      <Link
        to="/Courses"
        className="text-[rgba(0,0,0,0.25)] flex items-center gap-1 text-xs mb-4"
      >
        <FaChevronLeft size={10} />
        Learn / Courses / {course?.course_name}
      </Link>
      
      {/* Content */}
      <CourseContentCard 
        course={course}
        content={currentPageContent?.content || course.course_content || "No content available"}
        currentPage={currentPage}
        totalPages={pages.length || 1}
        pages={pages}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />
    </div>
  );
};

export default ViewCoursePage;
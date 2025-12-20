import React, { useEffect, useState } from "react";
import CourseContentCard from "../components/CourseContentCard";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { parseAndPaginateContent, ParsedPage } from "../utils/contentParser";

type Course = {
  id: string;
  course_name: string | null;
  course_description: string;
  course_url?: string | null;
  course_content?: string | null;
};

const ViewCoursePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pages, setPages] = useState<ParsedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize progress when user starts viewing course
  const initializeProgress = async (userId: string, courseId: string, totalPages: number) => {
    try {
      // Check if progress already exists
      const { data: existingProgress } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single();

      if (!existingProgress) {
        // Create initial progress (starting at page 1)
        await supabase.from("user_course_progress").insert({
          user_id: userId,
          course_id: courseId,
          current_page: 1,
          total_pages: totalPages,
          percentage: Math.round((1 / totalPages) * 100),
          completed: false,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Error initializing progress:", e);
    }
  };

  // Update progress when page changes
  const updateProgress = async (pageNum: number, totalPages: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user || !id) return;

      const percentage = Math.round((pageNum / totalPages) * 100);
      const isCompleted = pageNum >= totalPages;

      await supabase
        .from("user_course_progress")
        .upsert(
          {
            user_id: user.id,
            course_id: id,
            current_page: pageNum,
            total_pages: totalPages,
            percentage: percentage,
            completed: isCompleted,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_id" }
        );
    } catch (e) {
      console.error("Error updating progress:", e);
    }
  };

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
            const paginatedPages = parseAndPaginateContent(
              data.course_content,
              2000
            );
            setPages(paginatedPages);
            setCurrentPage(1);

            // Initialize progress for this course
            const {
              data: { user },
            } = await supabase.auth.getUser();
            
            if (user) {
              await initializeProgress(user.id, id, paginatedPages.length);
            }
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
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateProgress(nextPage, pages.length);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // MARK COURSE AS COMPLETED (triggered when this page receives quiz completion signal)
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const quizCompletedParam = qs.get("quizCompleted");
    const stateCompleted = (location.state as any)?.quizCompleted;

    const shouldMark =
      Boolean(stateCompleted) ||
      quizCompletedParam === "1" ||
      quizCompletedParam === "true";

    if (!shouldMark || !id) return;

    let cancelled = false;
    const markCourseCompleted = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user ?? null;
        if (!user) return;

        const totalPages = pages ? pages.length : 0;

        await supabase.from("user_course_progress").upsert(
          {
            user_id: user.id,
            course_id: id,
            current_page: totalPages,
            total_pages: totalPages,
            percentage: 100,
            completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_id" }
        );
      } catch (err) {
        console.error("Failed to mark course completed:", err);
      } finally {
        if (!cancelled) {
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    };

    markCourseCompleted();

    return () => {
      cancelled = true;
    };
  }, [location.search, (location.state as any)?.quizCompleted, pages, id]);

  if (loading) return <div className="p-4 pt-20">Loading course...</div>;
  if (error)
    return <div className="p-4 pt-20 text-red-600">Error: {error}</div>;
  if (!course) return <div className="p-4 pt-20">Course not found.</div>;

  const currentPageContent = pages.find((p) => p.pageNumber === currentPage);

  return (
    <div className="bg-white min-h-screen pt-20 px-8 pb-8">
      {/* Breadcrumb */}
      <Link
        to="/Courses"
        className="text-[rgba(0,0,0,0.25)] flex items-center gap-1 text-sm mb-4 hover:underline"
      >
        <FaChevronLeft size={13} />
        Learn / Courses / {course?.course_name}
      </Link>

      {/* Content */}
      <CourseContentCard
        course={course}
        content={
          currentPageContent?.content ||
          course.course_content ||
          "No content available"
        }
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
import React from "react";
import CourseContentOverview from "./CourseContentOverview";
import CourseContentQuestion from "./CourseContentQuestion";
// ...existing code...

interface Course {
  id?: string;
  course_name?: string | null;
  course_description?: string | null;
  course_url?: string | null;
}

interface Props {
  course?: Course | null;
  content?: string;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

const CourseContentCard: React.FC<Props> = ({
  course,
  content = "No content available",
  currentPage = 1,
  totalPages = 1,
  onNextPage,
  onPrevPage,
}) => {
  if (!course) {
    return (
      <div className="border border-[rgba(0,0,0,0.25)] flex flex-col items-center justify-center w-full min-h-[340px] py-16">
        <div className="text-center text-black text-sm font-medium">
          No course data
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row items-start gap-4">
      {/* Left column - Course Overview */}
      <CourseContentOverview
        courseName={course.course_name}
        courseDescription={course.course_description}
      />

      {/* Right column - Content and Question */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Content panel - fixed height with scroll */}
        <div className="border border-[rgba(0,0,0,0.25)] rounded-lg p-4 h-[300px] overflow-y-auto">
          <div className="flex items-center justify-center gap-2 mb-3 sticky top-0 bg-white pb-2">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="text-sm hover:bg-gray-100 px-1 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              type="button"
            >
              ‹
            </button>
            <h2 className="text-sm font-semibold uppercase">
              {course.course_name}
            </h2>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="text-sm hover:bg-gray-100 px-1 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              type="button"
            >
              ›
            </button>
          </div>
          <p className="text-xs text-black leading-relaxed">{content}</p>
        </div>

        {/* Question panel - dynamically generated based on content */}
        <CourseContentQuestion
          content={content}
          pageNumber={currentPage}
          onCorrect={onNextPage}
        />
      </div>
    </div>
  );
};

export default CourseContentCard;

import React from "react";

interface Course {
  id?: string;
  course_name?: string | null;
  course_url?: string | null;
}

interface Props {
  course?: Course | null;
}

const CourseContentCard: React.FC<Props> = ({ course }) => {
  if (!course) {
    return (
      <div className="border border-[rgba(0,0,0,0.25)] flex flex-col items-center justify-center w-full min-h-[340px] py-16">
        <div className="text-center text-black text-sm font-medium">
          No course data
        </div>
      </div>
    );
  }

  if (!course.course_url) {
    return (
      <div className="border border-[rgba(0,0,0,0.25)] flex flex-col items-center justify-center w-full min-h-[340px] py-16">
        <div className="text-center text-black text-sm font-medium">
          {course.course_name ?? "No preview available"}
        </div>
      </div>
    );
  }

  return (
    <embed className="w-full" src={course.course_url} type="application/pdf" />
  );
};

export default CourseContentCard;

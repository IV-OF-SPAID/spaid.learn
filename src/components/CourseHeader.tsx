import React from "react";
import { Link } from "react-router-dom";

const CourseHeader = ({ course }: { course: any }) => {
  return (
    <div>
      <div className="bg-[#F5F5F5] rounded-xl p-7 flex flex-col gap-8 justify-between items-start ">
        <div>
          <div className="text-xl md:text-2xl font-medium mb-2">
            {course.course_name}
          </div>
          <div className="text-sm text-black">{course.course_description}</div>
        </div>
        <Link
          to={`/view-course/${course.id}`}
          state={course}
          className="px-6 py-2 border border-[rgba(0,0,0,0.25)] rounded-lg cursor-pointer text-sm bg-white hover:bg-gray-100 self-start md:self-end"
        >
          Start Learning Now
        </Link>
      </div>
    </div>
  );
};

export default CourseHeader;

import React from "react";

const CourseContentCard = ({ course }) => {
  return (
    // <div className="border border-[rgba(0,0,0,0.25)] flex flex-col items-center justify-center w-full min-h-[340px] py-16">
    //   <svg
    //     width="64"
    //     height="64"
    //     fill="none"
    //     viewBox="0 0 24 24"
    //     className="mb-4"
    //   >
    //     <rect
    //       x="4"
    //       y="3"
    //       width="16"
    //       height="18"
    //       rx="2"
    //       stroke="#222"
    //       strokeWidth="2"
    //     />
    //     <line x1="8" y1="8" x2="16" y2="8" stroke="#222" strokeWidth="2" />
    //     <line x1="8" y1="12" x2="16" y2="12" stroke="#222" strokeWidth="2" />
    //     <line x1="8" y1="16" x2="12" y2="16" stroke="#222" strokeWidth="2" />
    //   </svg>
    //   <div className="text-center text-black text-sm font-medium">
    //     {course?.course_name}
    //   </div>
    // </div>

    <embed
      className="overflow-hidden"
      src={course.course_url}
      type="application/pdf"
      width="100%"
      height="550px"
    />
  );
};

export default CourseContentCard;

import React from "react";

const CourseOverviewCard = ({ course }) => {
  return (
    <div className="border border-[rgba(0,0,0,0.25)] p-6 w-full md:w-[340px]  min-h-full flex flex-col">
      <div className="text-xl mb-1">{course?.course_name}</div>
      <div className="font-medium mb-2">Course Overview</div>
      <div className="text-sm text-black leading-relaxed flex-1 overflow-auto">
        {course?.course_description}
      </div>
    </div>
  );
};

export default CourseOverviewCard;

import React from "react";

interface Props {
  courseName?: string | null;
  courseDescription?: string | null;
}

const CourseContentOverview: React.FC<Props> = ({
  courseName,
  courseDescription,
}) => {
  return (
    <div className="border border-[rgba(0,0,0,0.25)] rounded-lg p-4 w-[280px] h-full ">
      <h2 className="text-sm font-semibold mb-0">{courseName}</h2>
      <h3 className="font-semibold text-sm mb-2">Course Overview</h3>
      <p className="text-xs text-black leading-relaxed">{courseDescription}</p>
    </div>
  );
};

export default CourseContentOverview;

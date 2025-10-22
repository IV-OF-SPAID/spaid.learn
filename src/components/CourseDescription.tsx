import React from "react";

const CourseDescription = ({ course }: { course: any }) => (
  <div>
    <div className="text-gray-500 text-base mb-2">Course Description</div>
    <div className="text-sm text-black leading-relaxed">
      {course.course_description}
    </div>
  </div>
);

export default CourseDescription;

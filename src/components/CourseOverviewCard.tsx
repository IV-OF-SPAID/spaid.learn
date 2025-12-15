import React from "react";
// ...existing code...
import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import { getProgress, CourseProgress } from "../utils/progressTracker";
// ...existing code...

interface Course {
  id?: string;
  course_name?: string | null;
  course_description?: string | null;
  course_url?: string | null;
}

interface Props {
  course?: Course | null;
}

const CourseOverviewCard: React.FC<Props> = ({ course }) => {
  // ...existing code...
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProgress() {
      if (!course || !course.id) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const p = await getProgress(user.id, course.id as string);
      if (mounted) setProgress(p);
    }
    fetchProgress();
    return () => { mounted = false; };
  }, [course]);

  if (!course) {
    return (
      <div className="border border-[rgba(0,0,0,0.25)] p-6 w-full md:w-[340px] min-h-full flex flex-col">
        <div className="text-xl mb-1">No course selected</div>
      </div>
    );
  }

  return (
    <div className="border border-[rgba(0,0,0,0.25)] p-6 w-full md:w-[340px]  min-h-full flex flex-col">
      <div className="text-medium mb-1">{course.course_name}</div>
      <div className="text-sm mb-2">Course Overview</div>
      <div className="text-sm text-black leading-relaxed flex-1 overflow-auto">
        {course.course_description}
      </div>

      {/* Small progress row - does not change layout */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="text-[rgba(0,0,0,0.6)]">
          {progress ? `${progress.percentage}% Completed` : "0% Completed"}
        </div>
        {progress && progress.percentage > 0 && course.id && (
          <button
            onClick={() => (window.location.href = `/view-course/${course.id}`)}
            className="text-xs border border-[rgba(0,0,0,0.15)] rounded px-3 py-1 hover:bg-gray-50"
          >
            Continue Learning
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseOverviewCard;
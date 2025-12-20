import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

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
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!course?.id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setProgress(0);
          return;
        }

        const { data, error } = await supabase
          .from("user_course_progress")
          .select("percentage, completed")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single();

        if (!error && data && mounted) {
          // If completed, don't show this card (set progress to -1 as flag)
          if (data.completed) {
            setProgress(-1);
          } else {
            setProgress(data.percentage ?? 0);
          }
        } else if (mounted) {
          setProgress(0);
        }
      } catch (e) {
        if (mounted) setProgress(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProgress();
    return () => {
      mounted = false;
    };
  }, [course?.id]);

  // Don't render anything if:
  // - no valid course
  // - course is completed (progress === -1)
  // - no progress started (progress === 0)
  if (!course || !course.id || !course.course_name) {
    return null;
  }

  if (!loading && (progress <= 0)) {
    return null;
  }

  const handleViewCourse = () => {
    if (course?.id) {
      navigate(`/view-course/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="border border-[rgba(0,0,0,0.1)] bg-white rounded-lg p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
        <div className="h-5 bg-gray-300 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-300 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className="border border-[rgba(0,0,0,0.1)] bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block bg-[#ff0300] text-white text-xs px-3 py-1 rounded-full mb-2">
            Continue Learning
          </span>
          <h3 className="font-semibold text-base text-black">
            {course.course_name}
          </h3>
          <p className="text-sm text-gray-500">{progress}% Completed</p>
        </div>
        <button
          type="button"
          className="text-sm text-[#1a3c6e] hover:underline cursor-pointer"
          onClick={handleViewCourse}
        >
          View Course
        </button>
      </div>
    </div>
  );
};

export default CourseOverviewCard;
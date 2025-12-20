import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

interface Props {
  user_id?: string | null;
}

interface TopCourse {
  id: string;
  course_name: string | null;
  percentage: number;
}

const ContinueLearning: React.FC<Props> = ({ user_id }) => {
  const navigate = useNavigate();
  const [topCourse, setTopCourse] = useState<TopCourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      setTopCourse(null);
      return;
    }

    let mounted = true;

    const fetchTopUnfinished = async () => {
      setLoading(true);
      try {
        // Fetch progress from user_course_progress table
        const { data: progressData, error: progressError } = await supabase
          .from("user_course_progress")
          .select("course_id, percentage, completed")
          .eq("user_id", user_id);

        if (progressError || !progressData || progressData.length === 0) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Filter for unfinished courses with progress > 0
        const unfinished = progressData.filter(
          (p) => p.completed === false && p.percentage > 0
        );

        if (unfinished.length === 0) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Pick the one with highest percentage
        const best = unfinished.reduce((a, b) =>
          (a.percentage ?? 0) >= (b.percentage ?? 0) ? a : b
        );

        if (!best || !best.course_id || best.percentage <= 0) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("course_id")
          .select("id, course_name")
          .eq("id", best.course_id)
          .single();

        if (courseError || !courseData || !courseData.course_name) {
          if (mounted) setTopCourse(null);
          return;
        }

        if (mounted) {
          setTopCourse({
            id: courseData.id,
            course_name: courseData.course_name,
            percentage: best.percentage,
          });
        }
      } catch (e) {
        console.error("ContinueLearning fetch error:", e);
        if (mounted) setTopCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTopUnfinished();
    return () => {
      mounted = false;
    };
  }, [user_id]);

  const handleViewCourse = () => {
    if (topCourse?.id) {
      navigate(`/view-course/${topCourse.id}`);
    }
  };

  // Don't render anything while loading
  if (loading && topCourse) {
    return (
      <div className="w-full lg:max-w-md border-1 border-[rgba(0,0,0,0.25)] flex overflow-hidden bg-white p-4">
        <div className="flex-1 flex flex-col p-5 gap-2">
          <div className="w-36 h-6 bg-gray-200 rounded-full animate-pulse mx-auto md:mx-0" />
          <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-center items-end p-4">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Don't render if no unfinished course with progress
  if (!topCourse || !topCourse.course_name || topCourse.percentage <= 0) {
    return null;
  }

  return (
    <div className="w-full lg:max-w-md border-1 border-[rgba(0,0,0,0.25)] flex overflow-hidden bg-white p-4">
      <div className="flex-1 flex flex-col p-5 gap-2">
        <span className="inline-block bg-[#ff0300] text-white text-xs px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
          Continue Learning
        </span>
        <h3 className="font-semibold text-base text-black">
          {topCourse.course_name}
        </h3>
        <p className="text-sm text-gray-500">
          {topCourse.percentage}% Completed
        </p>
      </div>
      <div className="flex justify-center items-end p-4">
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

export default ContinueLearning;

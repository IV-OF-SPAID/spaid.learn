import React, { useEffect, useState } from "react";
import RecoCourse from "../components/RecoCourse";
import Review from "../components/Review";
import QrCom from "../components/QrCom";
import LearnersCard from "../components/LearnersCard";
import CourseOverviewCard from "../components/CourseOverviewCard";
import supabase from "../config/supabaseClient";

const HomePage = () => {
  const [topCourse, setTopCourse] = useState<any | null>(null);
  const [loadingTop, setLoadingTop] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadTopUnfinished = async () => {
      setLoadingTop(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Fetch progress directly from supabase
        const { data: progressData } = await supabase
          .from("user_course_progress")
          .select("course_id, percentage, completed")
          .eq("user_id", user.id);

        if (!progressData || progressData.length === 0) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Filter unfinished courses with progress > 0
        const unfinished = progressData.filter(
          (p) => p.completed === false && p.percentage > 0
        );

        if (unfinished.length === 0) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Pick highest-percentage unfinished
        const best = unfinished.reduce((a, b) =>
          (a.percentage ?? 0) >= (b.percentage ?? 0) ? a : b
        );

        if (!best || !best.course_id || best.percentage <= 0) {
          if (mounted) setTopCourse(null);
          return;
        }

        // Fetch course details
        const { data: courseData, error } = await supabase
          .from("course_id")
          .select("*")
          .eq("id", best.course_id)
          .single();

        if (!error && courseData && courseData.course_name && mounted) {
          setTopCourse(courseData);
        } else if (mounted) {
          setTopCourse(null);
        }
      } catch (e) {
        if (mounted) setTopCourse(null);
      } finally {
        if (mounted) setLoadingTop(false);
      }
    };

    loadTopUnfinished();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#f8f8f8]">
      <div className="w-full lg:w-2/3 flex flex-col">
        {/* Only show continue learning card if there's an unfinished course with progress */}
        {!loadingTop && topCourse && (
          <div className="mb-6">
            <CourseOverviewCard course={topCourse} />
          </div>
        )}

        <RecoCourse />
        <Review />
        <QrCom />
      </div>

      <div className="w-full lg:w-1/3 flex justify-center items-start mt-8 md:mt-0">
        <LearnersCard />
      </div>
    </div>
  );
};

export default HomePage;
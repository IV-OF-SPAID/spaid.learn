import React, { useEffect, useState } from "react";
import RecoCourse from "../components/RecoCourse";
import Review from "../components/Review";
import QrCom from "../components/QrCom";
import LearnersCard from "../components/LearnersCard";
// ...existing code...
import supabase from "../config/supabaseClient";
import { getAllUserProgress } from "../utils/progressTracker";
import CourseOverviewCard from "../components/CourseOverviewCard";

const HomePage = () => {
  const [topCourse, setTopCourse] = useState<any | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadTopUnfinished = async () => {
      setLoadingTop(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const progresses = await getAllUserProgress(user.id);
        // filter unfinished and pick highest percentage
        const unfinished = (progresses || []).filter((p: any) => !p.completed);
        if (unfinished.length === 0) {
          if (mounted) setTopCourse(null);
          return;
        }
        const best = unfinished.reduce((a: any, b: any) => (a.percentage >= b.percentage ? a : b));
        // fetch course details
        const { data: courseData, error } = await supabase
          .from("course_id")
          .select("*")
          .eq("id", best.courseId)
          .single();

        if (!error && mounted) {
          setTopCourse(courseData);
        }
      } catch (e) {
        // ignore silently
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
      <div className="w-full  lg:w-2/3 flex flex-col ">
        {/* show top unfinished course if available (does not change layout) */}
        {topCourse && (
          <div className="mb-6">
            <CourseOverviewCard course={topCourse} />
          </div>
        )}

        <RecoCourse />
        <Review />
        <QrCom />
      </div>
      <div className="w-full  lg:w-2/3 flex justify-center items-start mt-8 md:mt-0">
        <LearnersCard />
      </div>
    </div>
  );
};

export default HomePage;
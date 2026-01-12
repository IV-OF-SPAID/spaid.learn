import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import pallete from "../assets/img/pallete.png";

type Course = {
  id: number;
  course_name: string;
  course_description: string;
  course_url?: string | null;
};

const RecoCourse = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommended, setRecommended] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("course_id")
        .select("*")
        .eq("course_status", "open")
        .order("id", { ascending: true });
      if (error) {
        setError(error.message);
        setCourses([]);
        setRecommended(null);
      } else {
        const items = (data as Course[]) || [];
        setCourses(items);
        if (items.length > 0) {
          const randIndex = Math.floor(Math.random() * items.length);
          setRecommended(items[randIndex]);
        } else {
          setRecommended(null);
        }
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const handleStartLearning = async (courseId?: number) => {
    if (!courseId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/course/${courseId}`);
        return;
      }

      await supabase.from("user_course_progress").upsert(
        {
          user_id: user.id,
          course_id: courseId,
          current_page: 1,
          total_pages: 1,
          percentage: 1,
          completed: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );
    } catch (e) {
      console.error("Error creating/updating progress:", e);
    } finally {
      navigate(`/course/${courseId}`);
    }
  };

  return (
    <div className="w-full flex flex-col px-4 md:px-20 pt-8 md:pt-28 gap-5">
      {loading ? (
        <div className="w-full max-w-[880px] h-auto md:h-[170px] bg-[#f5f5f5] rounded-2xl p-4 flex items-center justify-center mx-auto">
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      ) : (
        <div
          className="w-full max-w-[880px] h-auto md:h-[170px] bg-[#f5f5f5] rounded-2xl p-4 flex flex-col justify-center mx-auto bg-cover bg-center"
          style={{ backgroundImage: `url(${pallete})` }}
        >
          <h1 className="text-[#403F3F]">Recommended Course</h1>

          {error ? (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          ) : recommended ? (
            <>
              <h1 className="text-2xl py-2">{recommended.course_name}</h1>
              <div className="flex flex-col md:flex-row md:h-15 justify-between items-center gap-4 md:gap-0">
                <h1 className="text-sm w-full md:w-120 text-[#403F3F] line-clamp-3 overflow-hidden">
                  {recommended.course_description}
                </h1>

                <button
                  onClick={() => handleStartLearning(recommended.id)}
                  className="w-full md:w-50 h-10 flex justify-center items-center rounded-xl cursor-pointer mt-2 md:mt-0 bg-[#ff9801]"
                >
                  Start Learning Now
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl py-2">No courses available</h1>
              <p className="text-sm w-full md:w-90 text-[#403F3F]">
                There are no courses to recommend yet.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecoCourse;

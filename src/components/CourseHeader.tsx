import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";

const CourseHeader = ({ courseId }: { courseId: string | number }) => {
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.error("Error fetching user:", userErr);
        return;
      }
      setUserId(userRes?.user?.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingCourse(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("course_id")
          .select("*")
          .eq("id", courseId)
          .single();
        if (error) throw error;

        // Check if course is closed and user is not the uploader
        if (data.course_status === "close" && data.uploader_id !== userId) {
          if (active) setError("This course is not available.");
          return;
        }

        if (active) setCourse(data);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load course");
      } finally {
        if (active) setLoadingCourse(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId, userId]);

  const handleStart = async () => {
    if (loadingAction || !course) return;
    setLoadingAction(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userRes?.user?.id;
      if (!userId) {
        navigate("/login");
        return;
      }

      const { data: existing } = await supabase
        .from("user_courses")
        .select(
          `
            id,
            progress,
            course_id (
            id,
            uploader_id,
            course_name
            )
        `
        )
        .eq("user_id", userId)
        .eq("course_id", course.id)
        .limit(1)
        .maybeSingle();
      if (!existing) {
        await supabase.from("user_courses").insert([
          {
            user_id: userId,
            course_id: course.id,
            progress: 0,
          },
        ]);
      }
      navigate(`/view-course/${course.id}`);
    } catch (e) {
      navigate(`/course/${courseId}`);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loadingCourse) {
    return (
      <div className="bg-[#F5F5F5] rounded-xl p-7">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-[#F5F5F5] rounded-xl p-7 text-sm text-red-600">
        {error}
      </div>
    );
  }
  if (!course) return null;

  return (
    <div>
      <div className=" rounded-xl p-7 flex flex-col gap-8 justify-between items-start bg-[url('/pallete.png')]  bg-cover bg-center ">
        <div>
          <div className="text-xl md:text-2xl font-medium mb-2">
            {course.course_name}
          </div>
          <div className="text-sm text-black">{course.course_description}</div>
        </div>
        <div className="flex md:self-end gap-5">
          {course.uploader_id === userId && (
            <Link
              to={`/edit-course/${course.id}`}
              className="px-6 py-2 border border-[rgba(0,0,0,0.25)] rounded-lg cursor-pointer text-sm bg-[#ff9801]  self-start md:self-end disabled:opacity-60"
            >
              Edit Course
            </Link>
          )}
          <button
            type="button"
            onClick={handleStart}
            disabled={loadingAction}
            className="px-6 py-2 bg-[#ff9801] rounded-lg cursor-pointer text-sm  self-start md:self-end disabled:opacity-60"
          >
            {loadingAction ? "Starting..." : "Start Learning Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;

import { useEffect, useState } from "react";
import Avatarcard from "../assets/img/defAvatar.svg";
import { Link } from "react-router-dom";

import supabase from "../config/supabaseClient";
import ContinueLearning from "./ContinueLearning";

const LearnersCard = () => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [role, setRole] = useState<string>("Learner");
  const [username, setUsername] = useState<string | null>(null);

  const [token, setToken] = useState<any>(null);

  // profile avatar url from DB
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // loading state for skeleton

  const [unfinishedCourses, setUnfinishedCourses] = useState<any[]>([]);
  const [finishedCourses, setFinishedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // instructor-specific stats
  const [uploadedCoursesCount, setUploadedCoursesCount] = useState<number>(0);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState<number>(0);

  useEffect(() => {
    const fetchFinishedCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_course_progress")
        .select("course_id")
        .eq("user_id", authUser?.id)
        .eq("completed", true);

      if (error) {
        console.error("Error fetching finished courses:", error);
      } else {
        setFinishedCourses(data || []);
      }
      setLoading(false);
    };

    if (authUser?.id) {
      fetchFinishedCourses();
    }
  }, [authUser?.id]);

  useEffect(() => {
    const fetchUnfinishedCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_course_progress")
        .select("course_id")
        .eq("user_id", authUser?.id)
        .eq("completed", false);

      if (error) {
        console.error("Error fetching unfinished courses:", error);
      } else {
        setUnfinishedCourses(data || []);
      }
      setLoading(false);
    };

    if (authUser?.id) {
      fetchUnfinishedCourses();
    }
  }, [authUser?.id]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        const rawToken = sessionStorage.getItem("token");
        const parsedToken = rawToken ? JSON.parse(rawToken) : null;
        setToken(parsedToken);
        if (!mounted) return;
        setAuthUser(user);

        if (user?.id) {
          // request avatar_url as well
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("username, role, avatar_url")
            .eq("id", user.id)
            .single();

          if (!error && profile) {
            if (mounted) {
              setRole(profile.role ?? "Learner");
              setUsername(profile.username ?? null);
              setAvatarUrl((profile as any).avatar_url ?? null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user/profile", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch instructor stats when role is instructor
  useEffect(() => {
    const fetchInstructorStats = async () => {
      if (role !== "instructor" || !authUser?.id) return;

      // Fetch courses uploaded by instructor
      const { data: courses, error: coursesError } = await supabase
        .from("course_id")
        .select("id")
        .eq("uploader_id", authUser.id);

      if (coursesError) {
        console.error("Error fetching instructor courses:", coursesError);
        return;
      }
      setUploadedCoursesCount(courses?.length || 0);

      if (courses && courses.length > 0) {
        const courseIds = courses.map((c: any) => c.id);

        // Fetch enrolled students count across all instructor's courses
      }
    };

    fetchInstructorStats();
  }, [role, authUser?.id]);

  // skeleton while loading
  if (loading) {
    return (
      <div className="w-full lg:px-10 flex flex-col md:px-20 gap-6 items-center lg:items-start lg:mt-25 py-4 lg:ml-[-100px]">
        {/* Profile Card Skeleton (hidden on small screens) */}
        <div className="w-full lg:max-w-md hidden border-1 border-[rgba(0,0,0,0.25)] md:flex overflow-hidden bg-white p-4">
          <div className="w-2/5 flex flex-col border-r-1 border-[rgba(0,0,0,0.25)] items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-3/5 bg-[#f5f5f5] flex flex-col justify-between items-center py-4 px-4">
            <div className="w-full flex flex-col items-start gap-2">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-full my-2">
              <div className="h-px bg-gray-300 w-full" />
            </div>
            <div className="w-full flex flex-col items-start gap-2">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    username?.split(" ")[0] || authUser.user_metadata.full_name.split(" ")[0];

  return (
    <div className="w-full lg:px-10 flex flex-col md:px-20 gap-6 items-center lg:items-start lg:mt-25 py-4  lg:ml-[-100px] ">
      {/* Profile Card */}
      <div className="w-full  lg:max-w-md hidden md:flex  overflow-hidden bg-white">
        <div className="w-2/5 flex flex-col border-r-1 border-[rgba(0,0,0,0.25)]">
          <Link
            to="/AccountSetting"
            className="h-full flex flex-col justify-center items-center py-4"
          >
            <img
              src={
                avatarUrl ||
                token?.user?.user_metadata?.avatar_url ||
                Avatarcard
              }
              alt=""
              className="w-20 h-20 bg-[#f5f5f5] rounded-full object-cover"
            />
            <div className="flex flex-col justify-center items-center mt-2">
              <h1 className="text-lg">{displayName}</h1>
              <p className="text-xs border-1  px-2 rounded-3xl bg-[#ff0300] text-white">
                {role}
              </p>
            </div>
          </Link>
        </div>
        <div
          className={`w-3/5 bg-[#f5f5f5] flex flex-col ${
            role === "instructor" ? "justify-center" : "justify-between"
          } items-center py-4`}
        >
          <div className="w-full flex flex-col justify-center px-4">
            <h1 className="text-[#403F3F]">
              {role === "instructor" ? "Courses Uploaded" : "Courses Completed"}
            </h1>
            <h1 className="text-xl">
              {role === "instructor"
                ? uploadedCoursesCount
                : finishedCourses.length}
            </h1>
          </div>
          {role === "student" && (
            <div className="flex items-center w-4/5 py-3">
              <hr className="flex-grow border-t border-gray-300"></hr>
            </div>
          )}
          {role === "student" && (
            <div className="w-full flex flex-col justify-center px-4">
              <h1 className="text-[#403F3F]">Ongoing Courses</h1>
              <h1 className="text-xl">{unfinishedCourses.length}</h1>
            </div>
          )}
        </div>
      </div>

      {/* Continue Learning Card */}
      <ContinueLearning user_id={authUser?.id} />
    </div>
  );
};

export default LearnersCard;

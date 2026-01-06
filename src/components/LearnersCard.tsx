import { useEffect, useState } from "react";
import Avatarcard from "../assets/img/defAvatar.svg";
import { Link } from "react-router-dom";

import supabase from "../config/supabaseClient";
import ContinueLearning from "./ContinueLearning";

const LearnersCard = () => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ongoingCount, setOngoingCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [uploadedCourses, setUploadedCourses] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  // Fetch user and profile first
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
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("username, role, avatar_url")
            .eq("id", user.id)
            .single();

          if (!error && profile && mounted) {
            const userRole = (profile.role ?? "Learner").trim();
            const instructorCheck = userRole.toLowerCase() === "instructor";

            setRole(userRole);
            setIsInstructor(instructorCheck);
            setUsername(profile.username ?? null);
            setAvatarUrl((profile as any).avatar_url ?? null);
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

  // Fetch uploaded courses for instructors
  useEffect(() => {
    if (!authUser?.id || !isInstructor) return;

    const fetchUploadedCourses = async () => {
      const { data, error } = await supabase
        .from("course_id")
        .select("id")
        .eq("uploader_id", authUser.id);

      if (!error) {
        setUploadedCourses(data?.length ?? 0);
      }
    };

    fetchUploadedCourses();
  }, [authUser?.id, isInstructor]);

  // Fetch course counts for learners
  useEffect(() => {
    if (!authUser?.id || isInstructor) return;

    const fetchCourseCounts = async () => {
      try {
        console.log("=== DEBUG START ===");
        console.log("Current authUser.id:", authUser.id);
        console.log("User ID type:", typeof authUser.id);

        // Fetch ALL progress records for this user
        const { data: allProgress, error: progressError } = await supabase
          .from("user_course_progress")
          .select("course_id, completed, percentage, user_id")
          .eq("user_id", authUser.id);

        console.log("Query user_id:", authUser.id);
        console.log("Progress error:", progressError);
        console.log("All progress records:", JSON.stringify(allProgress, null, 2));
        console.log("Number of records:", allProgress?.length);

        if (progressError) {
          console.error("Error fetching progress:", progressError);
          return;
        }

        if (!allProgress || allProgress.length === 0) {
          console.log("No progress records found for this user!");
          setCompletedCount(0);
          setOngoingCount(0);
          return;
        }

        // Log each record's completed value
        allProgress.forEach((p, i) => {
          console.log(`Record ${i}: course_id=${p.course_id}, completed=${p.completed}, type=${typeof p.completed}`);
        });

        // Count completed (completed = true)
        const completed = allProgress.filter(p => p.completed === true);
        // Count ongoing (completed = false or null)
        const ongoing = allProgress.filter(p => p.completed !== true);

        console.log("Completed count:", completed.length);
        console.log("Ongoing count:", ongoing.length);
        console.log("=== DEBUG END ===");

        setCompletedCount(completed.length);
        setOngoingCount(ongoing.length);
      } catch (err) {
        console.error("Error fetching course counts:", err);
      }
    };

    fetchCourseCounts();
  }, [authUser?.id, isInstructor]);

  // Skeleton while loading
  if (loading || role === null) {
    return (
      <div className="w-full lg:px-10 flex flex-col md:px-20 gap-6 items-center lg:items-start lg:mt-25 py-4 lg:ml-[-100px]">
        <div className="w-full lg:max-w-md hidden border-1 border-[rgba(0,0,0,0.25)] md:flex overflow-hidden bg-white p-4">
          <div className="w-2/5 flex flex-col border-r-1 border-[rgba(0,0,0,0.25)] items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-3/5 bg-[#f5f5f5] flex flex-col justify-center items-center py-4 px-4">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    username?.split(" ")[0] ||
    authUser?.user_metadata?.full_name?.split(" ")[0] ||
    "User";

  return (
    <div className="w-full lg:px-10 flex flex-col md:px-20 gap-6 items-center lg:items-start lg:mt-25 py-4 lg:ml-[-100px]">
      {/* Profile Card */}
      <div className="w-full lg:max-w-md hidden md:flex overflow-hidden bg-white">
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
              <p className="text-xs border-1 px-2 rounded-3xl bg-[#ff0300] text-white">
                {role}
              </p>
            </div>
          </Link>
        </div>
        <div className="w-3/5 bg-[#f5f5f5] flex flex-col justify-center items-center py-4">
          {isInstructor ? (
            <>
              <div className="w-full flex flex-col justify-center px-4">
                <h1 className="text-[#403F3F]">Uploaded Courses</h1>
                <h1 className="text-xl">{uploadedCourses}</h1>
              </div>
              <div className="flex items-center w-4/5 py-3">
                <hr className="flex-grow border-t border-gray-300" />
              </div>
              <div className="w-full flex flex-col justify-center px-4">
                <h1 className="text-[#403F3F]">Total Students</h1>
                <h1 className="text-xl">-</h1>
              </div>
            </>
          ) : (
            <>
              <div className="w-full flex flex-col justify-center px-4">
                <h1 className="text-[#403F3F]">Courses Completed</h1>
                <h1 className="text-xl">{completedCount}</h1>
              </div>
              <div className="flex items-center w-4/5 py-3">
                <hr className="flex-grow border-t border-gray-300" />
              </div>
              <div className="w-full flex flex-col justify-center px-4">
                <h1 className="text-[#403F3F]">Ongoing Courses</h1>
                <h1 className="text-xl">{ongoingCount}</h1>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Continue Learning Card - only show for learners */}
      {!isInstructor && <ContinueLearning user_id={authUser?.id} />}
    </div>
  );
};

export default LearnersCard;
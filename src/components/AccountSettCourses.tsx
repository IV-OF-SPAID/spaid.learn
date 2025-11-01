import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import supabase from "../config/supabaseClient";

interface Course {
  id: string;
  course_name?: string | null;
  uploader_id?: string | null;
  created_at?: string | null;
}

const AccountSettCourses: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) console.error("getUser error:", userErr);
        const user = userRes?.user ?? null;
        if (!mounted) return;
        console.debug("current user:", user);
        setUserId(user?.id ?? null);

        if (!user?.id) {
          setRole(null);
          setCourses([]);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profileErr) console.error("profile fetch error:", profileErr);
        console.debug("profileData:", profileData);
        const fetchedRole = (profileData as any)?.role ?? null;
        if (mounted) setRole(fetchedRole);

        // Try an OR filter first (common names)
        const orFilter = `uploader_id.eq.${user.id},created_by.eq.${user.id},uploader.eq.${user.id}`;
        console.debug("trying OR filter:", orFilter);
        const { data: courseData, error: courseErr } = await supabase
          .from("courses")
          .select("id, course_name, uploader_id, created_at")
          .or(orFilter)
          .order("created_at", { ascending: false });

        if (courseErr) console.error("courses fetch error (or):", courseErr);
        console.debug("courses (or):", courseData);

        let finalCourses = (courseData as Course[]) ?? [];

        // If none found, try single-column queries to discover the actual uploader column
        if (!finalCourses.length) {
          const tryCols = ["uploader_id", "created_by", "uploader", "owner_id", "user_id"];
          for (const col of tryCols) {
            const { data: cdata, error: cerr } = await supabase
              .from("courses")
              .select("id, course_name, " + col)
              .eq(col, user.id)
              .order("created_at", { ascending: false })
              .limit(20);
            console.debug(`try col ${col} ->`, { cdata, cerr });

            if (!cerr && Array.isArray(cdata) && (cdata as any[]).length) {
              const rows = cdata as any[];
              const looksLikeCourse = rows.every(
                (r) => r && typeof r === "object" && typeof r.id === "string"
              );
              if (looksLikeCourse) {
                finalCourses = rows as Course[];
                break;
              } else {
                console.debug(`column ${col} produced non-course rows`, rows);
              }
            }
          }
        }

        setCourses(finalCourses);
      } catch (err) {
        console.error("AccountSettCourses load error:", err);
        setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 md:px-15 lg:px-30">
        <div className="w-full gap-5 md:gap-10 flex flex-col md:flex-row justify-between bg-[#f5f5f5] rounded-xl md:p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 px-3 flex flex-col justify-between">
              <div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-3 animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-4/6 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:px-15 lg:px-30">
      <div className="w-full gap-5 md:gap-10  flex flex-col md:flex-row justify-between bg-[#f5f5f5] rounded-xl md:p-5">
        {role === "instructor" && (
          <div className="flex-1 px-3 flex flex-col justify-between">
            <div>
              <h1 className="text-lg font-medium mb-3">My courses</h1>
              <div className="flex flex-col gap-2 text-sm md:text-base">
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-600">You have not uploaded any courses yet.</p>
                ) : (
                  courses.map((c) => (
                    <p key={c.id}>{c.course_name ?? "Untitled course"}</p>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end mt-3">
              {courses.length > 0 && (
                <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
                  Show more <FaChevronDown />
                </button>
              )}
            </div>
          </div>
        )}

        {role === "instructor" && (
          <div className="block h-[1px] md:h-auto md:my-5 md:w-[2px] bg-gray-300 mx-2"></div>
        )}

        <div className="flex-1 px-3 flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-medium mb-3">Unfinished courses</h1>
            <div className="flex flex-col gap-2 text-sm md:text-base">
              <p>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</p>
              <p>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</p>
              <p>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
              Show more <FaChevronDown />
            </button>
          </div>
        </div>

        <div className="block h-[1px] md:h-auto md:my-5 md:w-[2px] bg-gray-300 mx-2"></div>

        <div className="flex-1 px-3 flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-medium mb-3">Finished courses</h1>
            <div className="flex flex-col gap-2 text-sm md:text-base">
              <p>LS1 ENG - I GET IT (RECOGNIZING THE MAIN IDEA)</p>
              <p>LS1 ENG - IN OTHER WORDS (RESTATING INFORMATION)</p>
              <p>LS1 ENG - I MYSELF BELIEVE (EXPRESSING OPINIONS)</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="text-[#013F5E] flex items-center gap-2 hover:underline cursor-pointer">
              Show more <FaChevronDown />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettCourses;
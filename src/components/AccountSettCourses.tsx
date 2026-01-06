import React, { useState, useEffect } from "react";
import MyCourses from "./MyCourses";
import UnfinishedCourses from "./UnfinishedCourses";
import FinishedCourses from "./FinishedCourses";
import supabase from "../config/supabaseClient";

const AccountSettCourses: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) console.error("getUser error:", userErr);
        const user = userRes?.user ?? null;
        if (!mounted) return;
        setUserId(user?.id ?? null);

        if (!user?.id) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("role, id")
          .eq("id", user.id)
          .maybeSingle();
        if (profileErr) console.error("profile fetch error:", profileErr);
        
        // Trim the role to remove any whitespace
        const fetchedRole = ((profileData as any)?.role ?? null)?.trim() ?? null;
        console.log("Fetched role (trimmed):", fetchedRole);
        
        if (mounted) setRole(fetchedRole);
      } catch (err) {
        console.error("AccountSettCourses load error:", err);
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

  // Check role case-insensitively (already trimmed above)
  const isInstructor = role?.toLowerCase() === "instructor";
  const isStudent = role?.toLowerCase() === "student";

  return (
    <div className="p-8 md:px-15 lg:px-30">
      <div className="w-full gap-5 md:gap-10 flex flex-col justify-between rounded-xl md:p-5">
        {isInstructor && (
          <MyCourses uploader_id={userId} />
        )}

        {isStudent && (
          <div>
            <UnfinishedCourses user_id={userId} />
            <div className="block h-[1px] md:h-auto md:my-5 md:w-[2px] bg-gray-300 mx-2"></div>
            <FinishedCourses user_id={userId} />
          </div>
        )}

        {!isInstructor && !isStudent && (
          <div className="text-center text-gray-500 py-8">
            <p>No role assigned. Please contact support.</p>
            <p className="text-sm mt-2">Debug: role = "{role}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettCourses;
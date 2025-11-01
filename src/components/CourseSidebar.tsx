import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";

interface Props {
  uploaderId?: string | null; // pass course.uploader_id (or whatever your schema uses)
}

const CourseSidebar: React.FC<Props> = ({ uploaderId }) => {
  const [uploaderName, setUploaderName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!uploaderId) {
          // fallback to current authenticated user name
          const { data } = await supabase.auth.getUser();
          const user = data?.user ?? null;
          if (!mounted) return;
          const display =
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            "Unknown uploader";
          setUploaderName(display);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", uploaderId)
          .maybeSingle();

        if (!mounted) return;

        if (!error && profile?.username) {
          setUploaderName(profile.username);
        } else {
          // fallback to fetching auth user name if profile not found
          const { data } = await supabase.auth.getUser();
          const user = data?.user ?? null;
          const display =
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            "Unknown uploader";
          setUploaderName(display);
        }
      } catch (err) {
        if (mounted) setUploaderName("Unknown uploader");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [uploaderId]);

  return (
    <>
      <div className="border-1 border-[rgba(0,0,0,0.25)]  p-5 mb-2">
        <div className="text-gray-500 text-sm mb-1">Uploaded By</div>
        <div className="text-sm text-black">{uploaderName || "Unknown uploader"}</div>
      </div>
      <div className="border-1 border-[rgba(0,0,0,0.25)]  p-5">
        <div className="text-gray-500 text-sm mb-1">Topics</div>
        <div className="text-sm text-black">
          Lesson 1 - Ready, Sets, Go
          <br />
          Lesson 2 - Setting It Up
          <br />
          Lesson 3 - Falling in Line
        </div>
      </div>
    </>
  );
};

export default CourseSidebar;
// ...existing code...
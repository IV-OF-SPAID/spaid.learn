import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";

const CourseSidebar = ({ courseId }: { courseId: string | number }) => {
  const [uploaderName, setUploaderName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        // fetch course to get uploader_id
        const { data: courseRow, error: courseErr } = await supabase
          .from("course_id")
          .select("uploader_id")
          .eq("id", courseId)
          .single();
        if (courseErr) throw courseErr;
        const uploaderId = courseRow?.uploader_id;
        if (!uploaderId) {
          if (active) setUploaderName("Unknown uploader");
          return;
        }
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", uploaderId)
          .single();
        if (profileErr || !profile?.username) {
          if (active) setUploaderName("Unknown uploader");
        } else {
          if (active) setUploaderName(profile.username);
        }
      } catch {
        if (active) setUploaderName("Unknown uploader");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId]);

  return (
    <>
      <div className="border-1 border-[rgba(0,0,0,0.25)]  p-5 mb-2">
        <div className="text-gray-500 text-sm mb-1">Uploaded By</div>
        <div className="text-sm text-black">
          {loading ? "Loading..." : uploaderName || "Unknown uploader"}
        </div>
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

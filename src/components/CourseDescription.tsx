import React, { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";

const CourseDescription = ({ courseId }: { courseId: string | number }) => {
  const [desc, setDesc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("course_id")
          .select("course_description")
          .eq("id", courseId)
          .single();
        if (error) throw error;
        if (active) setDesc(data?.course_description ?? "");
      } catch (e: any) {
        if (active) setErr(e?.message ?? "Failed to load description");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading)
    return (
      <div>
        <div className="text-gray-500 text-base mb-2">Course Description</div>
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    );
  if (err)
    return (
      <div>
        <div className="text-gray-500 text-base mb-2">Course Description</div>
        <div className="text-sm text-red-600">{err}</div>
      </div>
    );

  return (
    <div>
      <div className="text-gray-500 text-base mb-2">Course Description</div>
      <div className="text-sm text-black leading-relaxed">{desc}</div>
    </div>
  );
};

export default CourseDescription;

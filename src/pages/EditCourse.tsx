import React, { useState, useEffect } from "react";
import { /* Link, */ useNavigate, useParams } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import supabase from "../config/supabaseClient";

function EditCourse() {
  const params = useParams();
  const navigate = useNavigate();

  // Try multiple possible param names
  const routeId = params.id || params.courseId || params.course_id;

  // Parse id to number for consistent Supabase equality filter
  const courseId = routeId;

  console.log("Editing course id:", courseId);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const breadcrumbParts = ["Learn", "Courses", courseName || "Course"];

  useEffect(() => {
    if (!courseId) {
      setError("Invalid or missing course id.");
      setInitialLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        setInitialLoading(true);
        const { data, error: fetchErr } = await supabase
          .from("course_id")
          .select("course_name, course_description, course_url")
          .eq("id", courseId)
          .single();
        if (fetchErr) throw fetchErr;
        if (active && data) {
          setCourseName(data.course_name || "");
          setCourseDescription(data.course_description || "");
          setExistingFilePath(data.course_url || null);
        } else if (active) {
          setError("Course not found.");
        }
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load course.");
      } finally {
        if (active) setInitialLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Helper: go back if possible, else fallback
  const goBackOrFallback = () => {
    if (window.history && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/AccountSetting", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || initialLoading) return;
    if (!courseId) {
      setError("Cannot update without course id.");
      return;
    }
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      if (!courseName.trim() || !courseDescription.trim()) {
        throw new Error("Course name and description are required.");
      }
      // verify user auth
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userRes?.user?.id) throw new Error("Not authenticated.");

      let updatedFilePath = existingFilePath;
      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("courses")
          .upload(fileName, selectedFile);
        if (uploadErr) throw uploadErr;
        updatedFilePath = fileName;
      }

      // Ensure we update the specific course id
      const { error: updateErr } = await supabase
        .from("course_id")
        .update({
          course_name: courseName,
          course_description: courseDescription,
          course_url: updatedFilePath,
        })
        .eq("id", courseId);

      if (updateErr) throw updateErr;

      setMsg("Course updated successfully.");
      setShowToast(true);
      setSelectedFile(null);
      setExistingFilePath(updatedFilePath);
      // Changed: go back to previous page after save (with fallback)
      setTimeout(() => {
        setShowToast(false);
        goBackOrFallback();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-4xl border border-[rgba(0,0,0,0.25)] px-10 py-10 mt-15">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-[145px] w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {showToast && (
        <div
          role="status"
          className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow z-50 text-sm"
        >
          Update complete
        </div>
      )}

      {/* Changed: Back button uses history instead of fixed route */}
      <button
        type="button"
        onClick={goBackOrFallback}
        className="absolute top-20 left-15 cursor-pointer text-sm text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft size={13} />
        {breadcrumbParts.map((part, index) => (
          <span key={index}>
            <span className="hover:underline cursor-pointer">{part}</span>
            {index < breadcrumbParts.length - 1 && " / "}
          </span>
        ))}
      </button>

      <div className=" w-full max-w-4xl border border-[rgba(0,0,0,0.25)] px-10 py-5 mt-20 rounded-lg">
        <h2 className="text-lg font-medium text-center mb-8">Edit Course</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-2 text-sm">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter Course Name"
              className="w-full border border-[rgba(0,0,0,0.25)] rounded-lg px-4 py-2 focus:outline-none text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-2 font-medium text-sm">
              Course Description
            </label>
            <textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Enter Course Description"
              className="w-full border rounded-lg px-4 py-2 h-24 border-[rgba(0,0,0,0.25)] resize-none focus:outline-none text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-2 font-medium text-sm">
              Course Files{" "}
              {existingFilePath && (
                <span className="text-xs text-gray-500 ml-2">
                  (Current:{" "}
                  {existingFilePath.includes("/")
                    ? existingFilePath.split("/").pop()
                    : existingFilePath.includes("_")
                    ? existingFilePath.substring(
                        existingFilePath.indexOf("_") + 1
                      )
                    : existingFilePath}
                  )
                </span>
              )}
            </label>
            <label
              htmlFor="course-file"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`cursor-pointer border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-[145px] text-sm ${
                isDragging
                  ? "border-blue-400 bg-blue-50 text-gray-700"
                  : "border-[rgba(0,0,0,0.25)] bg-[#7e7e7e13] text-gray-500"
              }`}
            >
              <svg width="32" height="32" fill="none" className="mb-2">
                <path
                  d="M16 6v20M6 16h20"
                  stroke="#888"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                {isDragging
                  ? "Drop file to upload"
                  : selectedFile
                  ? selectedFile.name
                  : "Drag and drop a new file (optional)"}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                or click to browse
              </span>
              <input
                id="course-file"
                type="file"
                accept="*/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
          {msg && <div className="text-green-600 text-sm mb-3">{msg}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-gray-100 px-8 py-2 rounded-lg ${
                !loading ? "cursor-pointer" : "cursor-progress"
              } font-medium text-sm`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCourse;

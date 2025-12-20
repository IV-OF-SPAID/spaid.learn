import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { extractPdfText } from "../utils/pdfExtractor";
import MyCourses from "@/components/MyCourses";

const AddCoursePage = () => {
  const [courseName, setCourseName] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [profileId, setProfileId] = useState<any>(null);
  const navigate = useNavigate();
  const profile = JSON.parse(sessionStorage.getItem("profile") || "null");
  const role = profile?.role;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) {
      setSelectedFile(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!courseName.trim() || !courseDescription.trim()) {
      setError("Course name and description are required.");
      return;
    }

    setLoading(true);
    try {
      let publicUrl: string | null = null;
      let extractedText: string = "";

      if (selectedFile) {
        // Only allow PDF files
        if (
          selectedFile.type !== "application/pdf" &&
          !selectedFile.name.toLowerCase().endsWith(".pdf")
        ) {
          setError("Only PDF files are accepted.");
          setLoading(false);
          return;
        }

        // Extract text from PDF
        extractedText = await extractPdfText(selectedFile);

        // Upload file to storage
        const safeName = selectedFile.name.replace(/[^a-z0-9.\-_]/gi, "_");
        const filePath = `${profileId}/${Date.now()}_${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from("courses")
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("courses")
          .getPublicUrl(filePath);
        publicUrl = (urlData as any)?.publicUrl ?? null;

        if (!publicUrl)
          throw new Error("Failed to obtain public URL for uploaded file.");
      }

      // Insert course record into Supabase, including extracted text
      const payload: any = {
        course_name: courseName.trim(),
        course_description: courseDescription.trim(),
        course_content: extractedText ?? "",
      };
      if (publicUrl) payload.course_url = publicUrl;
      if (profileId !== null && profileId !== undefined) {
        payload.uploader_id = profileId;
      }

      const { error: insertErr } = await supabase
        .from("course_id")
        .insert([payload]);
      if (insertErr) throw insertErr;

      setMsg("Course added successfully.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/AccountSetting");
      }, 1500);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f8f8]">
      {/* top-center upload complete toast */}
      {showToast && (
        <div
          role="status"
          className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow z-50 text-sm"
        >
          Upload complete
        </div>
      )}

      <Link
        to="/AccountSetting"
        className="absolute top-20 hover:underline left-15 text-sm text-[rgba(0,0,0,0.25)] flex justify-center items-center gap-2"
      >
        <FaChevronLeft size={13} />
        Learn / Profile / Add Course
      </Link>

      <div className="w-full max-w-4xl border border-[rgba(0,0,0,0.25)] px-10 py-5 mt-15">
        <h2 className="text-lg font-medium text-center mb-8">Add Course</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-2 text-sm">Course Name</label>
            <input
              type="text"
              placeholder="Enter Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.25)] rounded-lg px-4 py-2 focus:outline-none text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-2 font-medium text-sm">
              Course Description
            </label>
            <textarea
              placeholder="Enter Course Description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 h-24 border-[rgba(0,0,0,0.25)] resize-none focus:outline-none text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-2 font-medium text-sm">
              Course Files (PDF only)
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
                  ? "Drop PDF to upload"
                  : selectedFile
                  ? selectedFile.name
                  : "Drag and drop PDF file here"}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                or click to browse (PDF only)
              </span>
              <input
                id="course-file"
                type="file"
                accept="application/pdf,.pdf"
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
              className={`bg-[#ff9801] px-8 py-2 rounded-lg ${
                !loading ? "cursor-pointer" : "cursor-progress"
              } font-medium text-sm`}
            >
              {loading ? "Saving..." : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoursePage;

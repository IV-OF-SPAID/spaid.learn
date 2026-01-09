import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import supabase from "../config/supabaseClient";

interface MyCoursesProps {
  uploader_id: string | null;
}

interface Course {
  id: string;
  course_name: string;
  course_description: string;
}

const MyCourses: React.FC<MyCoursesProps> = ({ uploader_id }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    courseId: string | null;
    courseName: string;
  }>({ show: false, courseId: null, courseName: "" });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!uploader_id) {
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("course_id")
        .select("id, course_name, course_description")
        .eq("uploader_id", uploader_id);

      if (fetchError) {
        setError(fetchError.message);
        setCourses([]);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };

    fetchMyCourses();
  }, [uploader_id]);

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const openDeleteModal = (
    e: React.MouseEvent,
    courseId: string,
    courseName: string
  ) => {
    e.stopPropagation(); // Prevent navigating to course
    setDeleteModal({ show: true, courseId, courseName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, courseId: null, courseName: "" });
  };

  const handleDeleteCourse = async () => {
    if (!deleteModal.courseId) return;

    setDeleting(true);
    setError(null);
    try {
      const courseId = deleteModal.courseId;

      // First, delete related user_courses records (enrollment data)
      const { error: userCoursesError } = await supabase
        .from("user_courses")
        .delete()
        .eq("course_id", courseId);

      if (userCoursesError) {
        console.error("Error deleting user_courses:", userCoursesError);
        setError(`Failed to delete enrollments: ${userCoursesError.message}`);
        setDeleting(false);
        closeDeleteModal();
        return;
      }

      // Delete related user progress records
      const { error: progressError } = await supabase
        .from("user_course_progress")
        .delete()
        .eq("course_id", courseId);

      if (progressError) {
        console.error("Error deleting progress:", progressError);
      }

      // Delete course content from storage if exists
      const { error: storageError } = await supabase.storage
        .from("courses")
        .remove([`${courseId}`]);

      if (storageError) {
        console.error("Error deleting storage:", storageError);
      }

      // Finally, delete the course record
      const { error: deleteError } = await supabase
        .from("course_id")
        .delete()
        .eq("id", courseId);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        setError(deleteError.message);
      } else {
        // Remove from local state
        setCourses((prev) => prev.filter((course) => course.id !== courseId));
      }
    } catch (err: any) {
      console.error("Caught error:", err);
      setError(err?.message ?? "Failed to delete course");
    } finally {
      setDeleting(false);
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">My Uploaded Courses</h2>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">My Uploaded Courses</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Course</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium">"{deleteModal.courseName}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">My Uploaded Courses</h2>

        {courses.length === 0 ? (
          <p className="text-gray-500">You haven't uploaded any courses yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleViewCourse(course.id)}
                className="group flex justify-between items-center h-17 py-2 border-l-4 border-[#ff9801] bg-white rounded-lg shadow-sm pl-3 pr-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{course.course_name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {course.course_description}
                  </p>
                </div>
                <button
                  onClick={(e) =>
                    openDeleteModal(e, course.id, course.course_name)
                  }
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                  title="Delete course"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyCourses;

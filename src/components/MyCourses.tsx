import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    if (!uploader_id) {
      console.log("No uploader_id provided");
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null);

      console.log("Fetching courses for uploader_id:", uploader_id);

      const { data, error: fetchError } = await supabase
        .from("course_id")
        .select("id, course_name, course_description")
        .eq("uploader_id", uploader_id);

      console.log("Fetched courses:", data);
      console.log("Fetch error:", fetchError);

      if (fetchError) {
        console.error("Error fetching courses:", fetchError);
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
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">My Uploaded Courses</h2>

      {courses.length === 0 ? (
        <p className="text-gray-500">You haven't uploaded any courses yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-medium">{course.course_name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {course.course_description}
                </p>
              </div>
              <button
                onClick={() => handleViewCourse(course.id)}
                className="ml-4 px-4 py-2 text-sm bg-[#ff9801] text-white rounded-lg hover:bg-[#e88a00] transition-colors"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
import supabase from "../config/supabaseClient";

export interface CourseProgress {
  courseId: string;
  currentPage: number;
  totalPages: number;
  completed: boolean;
  percentage: number;
}

export async function saveProgress(
  userId: string,
  courseId: string,
  currentPage: number,
  totalPages: number
): Promise<void> {
  const percentage = Math.round((currentPage / totalPages) * 100);
  const completed = currentPage >= totalPages;

  const { error } = await supabase
    .from("user_course_progress")
    .upsert({
      user_id: userId,
      course_id: courseId,
      current_page: currentPage,
      total_pages: totalPages,
      percentage,
      completed,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,course_id'
    });

  if (error) {
    console.error("Error saving progress:", error);
  }
}

export async function getProgress(
  userId: string,
  courseId: string
): Promise<CourseProgress | null> {
  const { data, error } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    courseId: data.course_id,
    currentPage: data.current_page,
    totalPages: data.total_pages,
    completed: data.completed,
    percentage: data.percentage
  };
}

export async function getAllUserProgress(
  userId: string
): Promise<CourseProgress[]> {
  const { data, error } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => ({
    courseId: item.course_id,
    currentPage: item.current_page,
    totalPages: item.total_pages,
    completed: item.completed,
    percentage: item.percentage
  }));
}
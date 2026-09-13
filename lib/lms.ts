/** Future portal boundary. No fake LMS, certificates, or student access in v1. */
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  position: number;
  kind: "live" | "recording" | "reading" | "quiz";
  resourceId?: string;
}
export interface StudentProgress {
  profileId: string;
  lessonId: string;
  completedAt: string | null;
}
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueAt: string | null;
}
export interface LearningRepository {
  listLessons(courseId: string): Promise<Lesson[]>;
  getProgress(profileId: string): Promise<StudentProgress[]>;
}

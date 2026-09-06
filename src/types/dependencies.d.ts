import type { CourseSubject } from "@/types/courses";

export type DependencyType = "hard" | "soft" | "recommended";

export interface Dependency<Subject extends CourseSubject> {
  course: Subject;
  type: DependencyType;
}

export interface CourseDependencies<Subject extends CourseSubject> {
  course: Subject;
  dependencies: Dependency<Subject>[];
}

export type Dependencies<Subject extends CourseSubject> = CourseDependencies<Subject>[];

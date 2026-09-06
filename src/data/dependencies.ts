import type { CourseGroup, CourseSubjectOf } from "@/types/courses";
import type { Dependencies } from "@/types/dependencies";

/**
 * Binds dependency declarations to their curriculum catalog, so every source
 * and target is checked against a real course name from that catalog.
 */
export const defineDependencies = <const Groups extends readonly CourseGroup<string>[]>(
	_courseGroups: Groups,
	dependencies: Dependencies<CourseSubjectOf<Groups>>,
) => dependencies;

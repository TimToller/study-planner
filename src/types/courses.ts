export const SemesterType = ["WS", "SS"] as const;
export type SemesterType = (typeof SemesterType)[number];

export const TYPE_MAP = ["UE", "VL", "PR", "SE", "KV"] as const;
export type CourseType = (typeof TYPE_MAP)[number];

export interface Semester {
	year: number;
	type: SemesterType;
}
export interface Course<Name extends string> {
	name: Name;
	ects: number;
	id: string;
	available?: SemesterType;
	recommendedSemester: number | null;
	plannedSemester?: number | "accredited";
	grade?: number;
	legacyNames?: string[];
	type: CourseType;
	group: string;
	notUsedForDistinction?: boolean;
}

export interface CourseGroup<Name extends string> {
	name: string;
	courses: Omit<Course<Name>, "group", "id", "fullName">[];
}

export interface CourseGrading {
	name: string;
	grade: number;
}

export interface CoursePlan {
	name: string;
	plannedSemester?: number | "accredited";
}

export interface CustomCourse {
	name: string;
	variant: "Free Elective" | "Area of Specialization";
	ects: number;
	type: CourseType;
}

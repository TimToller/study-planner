export type SemesterType = "WS" | "SS";
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
	type: "UE" | "VL" | "PR" | "SE" | "KV";
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

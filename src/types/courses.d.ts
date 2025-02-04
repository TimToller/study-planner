export type SemesterType = "WS" | "SS";
export interface Semester {
	year: number;
	type: SemesterType;
}
export interface Course {
	name: string;
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

export interface CourseGroup {
	name: string;
	courses: Omit<Course, "group", "id">[];
}

export interface CourseGrading {
	name: string;
	grade: number;
}

export interface CoursePlan {
	name: string;
	plannedSemester?: number | "accredited";
}

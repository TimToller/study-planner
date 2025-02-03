export type SemesterType = "WS" | "SS";
export interface Semester {
	year: number;
	type: SemesterType;
}
export interface Course {
	name: string;
	ects: number;
	available?: SemesterType;
	recommendedSemester: number | null;
	plannedSemester?: number;
	grade?: number;
	type: "UE" | "VL" | "PR" | "SE" | "KV";
	group: string;
	notUsedForDistinction?: boolean;
}

export interface CourseGroup {
	name: string;
	courses: Omit<Course, "group">[];
}

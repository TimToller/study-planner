export type Semester = "WS" | "SS";
export interface Course {
	name: string;
	ects: number;
	available?: Semester;
	recommendedSemester: number | null; // recommended semester (1–6) or null if not applicable
	plannedSemester?: number; // the semester you plan to (or did) take the course
	grade?: number; // grade for the course
	type?: "UE" | "VL" | "PR" | "SE" | "KV"; // type of course
}

export interface CourseGroup {
	name: string;
	courses: Course[];
	notUsedForDistinction?: boolean;
}

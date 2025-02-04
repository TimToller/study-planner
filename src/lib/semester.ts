import { statusMap } from "@/components/course-status-badge";
import { Semester } from "@/types/courses";

export const getCurrentSemester = (): Semester => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth();

	if (currentMonth >= 3 && currentMonth <= 8) {
		return { year: currentYear, type: "SS" };
	}
	if (currentMonth <= 2) {
		return { year: currentYear - 1, type: "WS" };
	} else {
		return { year: currentYear, type: "WS" };
	}
};

export const compareSemester = (a: Semester, b: Semester) => {
	if (a.year !== b.year) {
		return a.year - b.year;
	}
	if (a.type === b.type) {
		return 0;
	}
	return a.type === "WS" ? -1 : 1;
};

export const isSameSemester = (a: Semester, b: Semester) => compareSemester(a, b) === 0;

export const getCourseStatus = (plannedSemester?: number, grade?: number) => {
	let status: keyof typeof statusMap = "unplanned";
	if (plannedSemester !== undefined) {
		status = "planned";
		// const currentSemester = getCurrentSemester();
		// if (isSameSemester(plannedSemester, currentSemester)) {
		// 	status = "current";
		// }
	}
	if (grade !== undefined) {
		status = "graded";
	}
	if (grade !== undefined && grade > 4) {
		status = "failed";
	}
	return status;
};

export const formatSemester = (semesterCount: number, startSemester: Semester) => {
	let { type, year }: Semester = startSemester;

	for (let i = 1; i < semesterCount; i++) {
		type = type === "WS" ? "SS" : "WS";
		if (type === "SS") {
			year++;
		}
	}

	return `${semesterCount} (${type} ${year % 100})`;
};

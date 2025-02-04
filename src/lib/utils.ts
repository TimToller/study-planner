import { statusMap } from "@/components/course-status-badge";
import { Semester } from "@/types/courses";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const weightedAverage = (elements: { number: number; weight: number }[]) => {
	const sum = elements.reduce((acc, { number, weight }) => acc + number * weight, 0);
	const weightSum = elements.reduce((acc, { weight }) => acc + weight, 0);
	return sum / weightSum;
};

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

export const isSameSemester = (a: Semester, b: Semester) => a.year === b.year && a.type === b.type;

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

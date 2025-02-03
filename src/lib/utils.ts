import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const weightedAverage = (grades: number[], weights: number[]) => {
	if (grades.length !== weights.length) {
		throw new Error("grades and weights must have the same length");
	}
	const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
	return grades.reduce((acc, grade, i) => acc + grade * (weights[i] / totalWeight), 0);
};

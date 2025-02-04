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

export const round = (value: number, precision = 2) => {
	const factor = 10 ** precision;
	return Math.round(value * factor) / factor;
};

export const average = (values: number[]) => values.reduce((acc, v) => acc + v, 0) / values.length;

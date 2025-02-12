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

export const getGroupColor = (group: string) => {
	const colorPalate = ["#64ade6", "#ddb0f4", "#929489", "#cdf3a9", "#90be6d", "#43aa8b", "#557c93"].map((c) => c + "60");
	switch (group) {
		case "Bachelor Thesis":
		case "AI Basics and Practical Training":
		case "Propaedeutic":
			return colorPalate[0];
		case "AI and Society":
		case "Theory":
			return colorPalate[1];
		case "Computer Science":
		case "Hardware":
			return colorPalate[2];
		case "Data Science":
		case "Software":
			return colorPalate[3];
		case "Knowledge Representation and Reasoning":
		case "Systems":
			return colorPalate[4];
		case "Machine Learning and Perception":
		case "Applications":
			return colorPalate[5];
		case "Mathematics":
		case "Complementary Skills":
			return colorPalate[6];
	}
};

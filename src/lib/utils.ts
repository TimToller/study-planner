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
  // Add a tiny epsilon before rounding to avoid floating-point artifacts around x.5 boundaries.
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const roundGrade = (value: number) => {
  const rounded = round(value, 0);
  const fraction = value - Math.floor(value);
  // Grades use half-down rounding at x.5 (e.g. 1.5 -> 1).
  if (Math.abs(fraction - 0.5) < 1e-10) {
    return Math.floor(value);
  }
  return rounded;
};

export const average = (values: number[]) => values.reduce((acc, v) => acc + v, 0) / values.length;

export const getGroupAccentColor = (group: string) => {
  const colorPalette = ["#3578d4", "#8255c7", "#64748b", "#65a30d", "#16806f", "#0785a3", "#4f46a5", "#b87416"];
  switch (group) {
    case "Bachelor Thesis":
    case "AI Basics and Practical Training":
    case "Propaedeutic":
      return colorPalette[0];
    case "AI and Society":
    case "Theory":
      return colorPalette[1];
    case "Computer Science":
    case "Hardware":
      return colorPalette[2];
    case "Data Science":
    case "Software":
      return colorPalette[3];
    case "Knowledge Representation and Reasoning":
    case "Systems":
      return colorPalette[4];
    case "Machine Learning and Perception":
    case "Applications":
      return colorPalette[5];
    case "Mathematics":
    case "Complementary Skills":
      return colorPalette[6];
    case "Area of Specialization":
      return "#ec4899"; // pink
    case "Free Elective":
      return "#f59e0b"; // amber
  }
  return colorPalette[2];
};

export const getGroupColor = (group: string) => `${getGroupAccentColor(group)}18`;

export const downloadJSON = (data: object, filename = "data.json") => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

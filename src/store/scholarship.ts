import { weightedAverage } from "@/lib/utils";
import { atom } from "jotai";
import { gradesAtom } from "./grades";
import { planningAtom } from "./planning";
import { rawCoursesAtom } from "./settings";

//TODO This could be improved
const getChances = (average: number, points: number) => {
	if (average > 2 || points < 230) return "Low";
	if (points < 250) return "Moderate";
	if (points < 330) return "Good";
	return "Very Good";
};

export const recentCourseAverageAtom = atom((get) => {
	const grades = get(gradesAtom).filter((g) => g.grade !== undefined);
	if (grades.length === 0) return { average: undefined, ects: 0 };

	// Map course → semester + ects
	const planning = get(planningAtom);
	const ectsMap = new Map<string, number>();
	get(rawCoursesAtom).forEach((c) => ectsMap.set(c.name, c.ects));

	const gradedWithSemester = grades
		.map((g) => {
			const plan = planning.find((p) => p.name === g.name);
			return {
				grade: g.grade!,
				ects: ectsMap.get(g.name) ?? 0,
				semester: typeof plan?.plannedSemester === "number" ? plan.plannedSemester : undefined,
			};
		})
		.filter((c) => c.semester !== undefined); // drop “accredited” / undefined

	if (gradedWithSemester.length === 0) return { average: undefined, ects: 0 };

	const latestSemester = Math.max(...gradedWithSemester.map((c) => c.semester!));

	const recent = gradedWithSemester.filter(
		(c) => (c.semester as number) >= latestSemester - 1 //checks current and prev semester
	);

	const ects = recent.reduce((s, c) => s + c.ects, 0);
	const average = weightedAverage(recent.map((c) => ({ number: c.grade, weight: c.ects })));

	//NOTES:
	//device by 1.5 because "points" use SSt not ECTS
	//1 -> 4x multipler, 2 -> 3x multiplier etc.
	//in the propper formula, LVA Types are weighted differently (we have *2 multiplier at the end)
	//here we just assume everything is a VL, VO,  VU, KV, UE even though KO, SE etc. would have different weights.
	//This is just a rough estimate anyway.
	const points = recent.reduce((s, c) => s + Math.floor(c.ects / 1.5) * (5 - c.grade), 0) * 2;
	const chances = getChances(average, points);

	return { average: isNaN(average) ? undefined : average, ects, latestSemester, points, chances };
});

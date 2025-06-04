import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { round, weightedAverage } from "@/lib/utils";
import { CourseGrading } from "@/types/courses";

import { courseGroupsAtom, rawCoursesAtom } from "@/store/settings";
import { gradesAtom } from "./grades";

export type SimulationGoal = "passed" | "passedWithDistinction";
export const simulationGoalAtom = atomWithStorage<SimulationGoal>("simulationGoal", "passedWithDistinction");

export const simulationGradesAtom = atomWithStorage<CourseGrading[]>("simulationGrades", []);

export const setSimulationGradesAtom = atom(null, (get, set, course: CourseGrading) => {
	const current = get(simulationGradesAtom);
	const idx = current.findIndex((c) => c.name === course.name);

	if (course.grade === undefined) {
		if (idx !== -1) {
			const next = [...current];
			next.splice(idx, 1);
			set(simulationGradesAtom, next);
		}
		return;
	}

	if (idx === -1) {
		set(simulationGradesAtom, [...current, course]);
	} else {
		const next = [...current];
		next[idx] = course;
		set(simulationGradesAtom, next);
	}
});

export const resetSimulationGradesAtom = atom(null, (get, set) => {
	const current = get(simulationGradesAtom);
	if (current.length > 0) {
		set(simulationGradesAtom, []);
	}
});

const ectsMapAtom = atom((get) => {
	const m = new Map<string, number>();
	get(rawCoursesAtom).forEach((c) => m.set(c.name, c.ects));
	return m;
});

const combinedGradesAtom = atom((get) => {
	const real = get(gradesAtom);
	const sim = get(simulationGradesAtom);
	const names = new Set(real.map((g) => g.name));
	return [...real, ...sim.filter((s) => !names.has(s.name))];
});

export const groupStatsAtom = atom((get) => {
	const grades = get(combinedGradesAtom).filter((g) => g.grade !== undefined);
	const ects = get(ectsMapAtom);

	return get(courseGroupsAtom).map((group) => {
		const groupGrades = grades.filter((g) => group.courses.some((c) => `${c.type} ${c.name}` === g.name));

		const average = weightedAverage(groupGrades.map((g) => ({ number: g.grade, weight: ects.get(g.name) ?? 0 })));

		const totalECTS = group.courses.reduce((sum, c) => sum + c.ects, 0);
		const gradedECTS = group.courses
			.filter((c) => grades.some((g) => g.name === `${c.type} ${c.name}`))
			.reduce((sum, c) => sum + c.ects, 0);

		return {
			name: group.name,
			average,
			rounded: round(average, 0),
			totalECTS,
			gradedECTS,
		} as const;
	});
});

export const passedWithDistinctionSimAtom = atom((get) => {
	const grouped = get(groupStatsAtom)
		.map((g) => g.rounded)
		.filter((a) => !isNaN(a));

	const noThreeOrWorse = grouped.every((a) => a < 3);
	const moreThanHalfAreOnes = grouped.filter((a) => a === 1).length > grouped.length / 2;
	const distinction = noThreeOrWorse && moreThanHalfAreOnes;

	return { distinction, noThreeOrWorse, moreThanHalfAreOnes } as const;
});

export const simulationGoalReachableAtom = atom((get) => {
	const goal = get(simulationGoalAtom);
	const dbg: string[] = [];

	if (goal === "passed") {
		const fails = get(combinedGradesAtom)
			.filter((g) => g.grade !== undefined)
			.some((g) => g.grade >= 5);
		if (fails) dbg.push("At least one graded course is 5 or worse.");
		return { reachable: !fails, reasons: dbg } as const;
	}

	const { distinction, noThreeOrWorse, moreThanHalfAreOnes } = get(passedWithDistinctionSimAtom);
	if (distinction) return { reachable: true, reasons: [] } as const;

	if (!noThreeOrWorse) dbg.push("Some group averages are 3 or worse.");
	if (!moreThanHalfAreOnes) dbg.push("Less than half of group averages are 1.");
	return { reachable: false, reasons: dbg } as const;
});

export interface CourseImportance {
	courseName: string;
	groupName: string;
	ects: number;
	importance: number; // higher = more impactful
	explanation: string;
}

export const courseImportanceAtom = atom<CourseImportance[]>((get) => {
	// const ectsMap = get(ectsMapAtom);
	const combined = get(combinedGradesAtom);
	const gradedNames = new Set(combined.filter((g) => g.grade !== undefined).map((g) => g.name));
	const groups = get(groupStatsAtom);
	const goal = get(simulationGoalAtom);
	const targetGrade = goal === "passedWithDistinction" ? 1 : 4; // simplistic – change if rules differ

	return get(courseGroupsAtom)
		.flatMap((group) => {
			const stats = groups.find((g) => g.name === group.name)!;
			const { average: groupAvg, gradedECTS, totalECTS } = stats;
			const distance = isNaN(groupAvg) ? 1 : Math.max(0, groupAvg - targetGrade) + 0.1; // +0.1 so zero distance ≠ drop to 0

			return group.courses
				.filter((c) => !gradedNames.has(`${c.type} ${c.name}`))
				.map((c) => {
					const courseKey = `${c.type} ${c.name}`;
					const ectsShare = c.ects / totalECTS; // share inside its group

					// Potential improvement if you score targetGrade in this course
					const newAvg = isNaN(groupAvg) ? targetGrade : (groupAvg * gradedECTS + targetGrade * c.ects) / (gradedECTS + c.ects);
					const improvement = isNaN(groupAvg) ? 0 : groupAvg - newAvg;

					// final score – tweak formula as you like
					const score = ectsShare * distance + improvement;

					// Human‑readable explanation
					const reasonLines: string[] = [];
					reasonLines.push(`Worth ${c.ects} ECTS (${Math.round(ectsShare * 100)} % of the ${group.name} group).`);
					if (!isNaN(groupAvg)) {
						reasonLines.push(`Group average is ${groupAvg.toFixed(2)} → needs -${distance.toFixed(2)} to hit ${targetGrade}.`);
						reasonLines.push(
							`Scoring a ${targetGrade} here would shift the group average by -${improvement.toFixed(2)} to ${newAvg.toFixed(2)}.`
						);
					} else {
						reasonLines.push(`Group has no grades yet - this course will set the initial tone.`);
					}

					return {
						courseName: courseKey,
						groupName: group.name,
						ects: c.ects,
						importance: Number(score.toFixed(3)),
						explanation: reasonLines.join(" "),
					} satisfies CourseImportance;
				});
		})
		.sort((a, b) => b.importance - a.importance);
});

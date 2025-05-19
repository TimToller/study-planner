import { atom } from "jotai";
import { groupGradesAverageAtom } from "./grades";
import { personalCoursesAtom } from "./planning";
import { CourseGroup, courseGroupsAtom } from "./settings";

// Hypothetical grade constants
const TARGET_BEST = 1;
const TARGET_GOOD = 2;
const TARGET_OK = 3;
const TARGET_WORST = 4;
const FAIL = 5;

export interface CoursePriority {
	name: string;
	score: number;
	explanation: string;
}

const TARGET_GROUP_GRADE = TARGET_BEST;
const EXPECTED_OTHERS_GRADE = TARGET_OK;

/**
 * Core priority computation, factored out for testing.
 */
export function computeCoursePriorities(
	groups: CourseGroup[],
	groupsGrades: { name: string; average: number; totalECTS: number }[],
	personal: { id: string; ects: number; grade?: number }[]
): CoursePriority[] {
	const result: CoursePriority[] = [];

	for (const group of groups) {
		// Find stats for this group
		const stats = groupsGrades.find((g) => g.name === group.name);
		if (!stats) continue;
		const { average } = stats;

		// Recalculate doneECTS and doneWeight from actual graded personal courses
		const gradedCourses = group.courses
			.map((gc) => {
				const match = personal.find((c) => c.id === `${gc.type} ${gc.name}` && c.grade !== undefined);
				return match ? { ects: gc.ects, grade: match.grade! } : null;
			})
			.filter((x): x is { ects: number; grade: number } => x !== null);
		const doneECTS = gradedCourses.reduce((sum, c) => sum + c.ects, 0);
		const doneWeight = gradedCourses.reduce((sum, c) => sum + c.grade * c.ects, 0);

		const hasGrades = doneECTS > 0;
		const currentRounded = hasGrades ? Math.round(doneWeight / doneECTS) : TARGET_GROUP_GRADE;

		// Target and expected for group
		const targetRound = currentRounded;
		const expectedOthers = EXPECTED_OTHERS_GRADE;

		const ungraded = personal.filter((c) => {
			const match = group.courses.find((gc) => `${gc.type} ${gc.name}` === c.id);
			if (!match || c.grade !== undefined) return false;
			return true;
		});

		// Total ECTS of all ungraded
		const totalUngradedECTS = ungraded.reduce((sum, c) => sum + c.ects, 0);

		for (const course of ungraded) {
			const e = course.ects;

			// ECTS of other ungraded (excluding this)
			const ectsOthers = totalUngradedECTS - e;
			const weightOthers = expectedOthers * ectsOthers;

			// Final total ECTS including this course
			const allECTS = doneECTS + ectsOthers + e;
			const baselineWeight = doneWeight + weightOthers;

			// To achieve targetRound, avg < targetRound+0.5
			const maxAvg = targetRound + 0.5;
			const threshold = (maxAvg * allECTS - baselineWeight) / e;

			// Compute required grade
			let requiredGrade = Math.floor(threshold);
			let reachable = true;
			if (threshold < TARGET_BEST) {
				reachable = false;
				requiredGrade = TARGET_BEST;
			}
			if (requiredGrade > FAIL) {
				requiredGrade = FAIL;
			}

			// Leverage and score
			const share = e / allECTS;
			const score = share * (FAIL + 1 - requiredGrade);

			// Explanation
			const parts: string[] = [];
			parts.push(
				hasGrades
					? `Current avg ≈ ${(doneWeight / doneECTS).toFixed(2)} → rounded **${currentRounded}**.`
					: `No graded courses yet in **${group.name}**; starting from **${TARGET_WORST}**.`
			);
			parts.push(`• **${course.name}** is **${Math.round(share * 100)}%** of total ECTS (${e}/${allECTS}).`);
			if (!reachable) {
				parts.push(`• Even a **${TARGET_BEST}** won't get you to **${targetRound}**.`);
			} else {
				parts.push(`• To hit **${targetRound}**, you need ≤ **${requiredGrade}** here ` + `(others at **${expectedOthers}**).`);
			}
			if (reachable && requiredGrade >= FAIL) parts.push(`• Even **${FAIL}** works—low priority.`);
			if (reachable && requiredGrade <= TARGET_BEST) parts.push(`• Must get **${TARGET_BEST}**—high priority.`);

			result.push({ name: course.id, score, explanation: parts.join("\n") });
		}
	}

	return result.sort((a, b) => b.score - a.score);
}

// Hook into Jotai
export const priorityAtom = atom((get) =>
	computeCoursePriorities(
		get(courseGroupsAtom) as (CourseGroup & { targetGrade?: number; expectedOthersGrade?: number })[],
		get(groupGradesAverageAtom),
		get(personalCoursesAtom)
	)
);

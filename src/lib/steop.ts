import type { Course, CourseGrading, CoursePlan } from "@/types/courses";

export type SteopProgram = "AI" | "CS";

interface SteopRule {
	requiredECTS: number;
	maxAdditionalECTS: number;
}

export const STEOP_RULES: Record<SteopProgram, SteopRule> = {
	AI: {
		requiredECTS: 9,
		maxAdditionalECTS: 21,
	},
	CS: {
		requiredECTS: 9,
		maxAdditionalECTS: 22,
	},
};

export interface SteopEvaluation {
	completedECTS: number;
	projectedECTS: number;
	completionSemester: number | null;
	additionalECTSBeforeCompletion: number;
	restrictedCourses: Course<string>[];
	additionalCoursesBeforeCompletion: Course<string>[];
	unplannedCoreCourses: Course<string>[];
}

/**
 * Treats passed/accredited core courses as already complete and planned core
 * courses as completing at the end of their planned semester.
 */
export function evaluateSteop(
	program: SteopProgram,
	courses: Course<string>[],
	planning: CoursePlan[],
	grades: CourseGrading[],
): SteopEvaluation {
	const rule = STEOP_RULES[program];
	const coreCourses = courses.filter((course) => course.steop === "core");
	const coreCourseIds = new Set(coreCourses.map((course) => course.id));
	const allowedAdditionalCourseIds = new Set(
		courses.filter((course) => course.steop === "additional").map((course) => course.id),
	);
	const coursesById = new Map(courses.map((course) => [course.id, course]));
	const plansByCourseId = new Map(planning.map((plan) => [plan.name, plan.plannedSemester]));
	const gradesByCourseId = new Map(grades.map((grade) => [grade.name, grade.grade]));

	const alreadyCompletedCourseIds = new Set(
		coreCourses
			.filter((course) => {
				const grade = gradesByCourseId.get(course.id);
				return (grade !== undefined && grade <= 4) || plansByCourseId.get(course.id) === "accredited";
			})
			.map((course) => course.id),
	);

	const sumECTS = (courseIds: Iterable<string>) =>
		Array.from(courseIds).reduce((total, courseId) => total + (coursesById.get(courseId)?.ects ?? 0), 0);

	const completedECTS = sumECTS(alreadyCompletedCourseIds);
	const projectedCourseIds = new Set(alreadyCompletedCourseIds);
	let completionSemester: number | null = completedECTS >= rule.requiredECTS ? 0 : null;

	const plannedSemesters = Array.from(
		new Set(
			planning
				.map((plan) => plan.plannedSemester)
				.filter((semester): semester is number => typeof semester === "number"),
		),
	).sort((a, b) => a - b);

	for (const semester of plannedSemesters) {
		for (const course of coreCourses) {
			if (plansByCourseId.get(course.id) === semester) projectedCourseIds.add(course.id);
		}
		if (completionSemester === null && sumECTS(projectedCourseIds) >= rule.requiredECTS) {
			completionSemester = semester;
			break;
		}
	}

	const projectedECTS = sumECTS(projectedCourseIds);
	const restrictedPlans = planning.filter(
		(plan) =>
			typeof plan.plannedSemester === "number" &&
			completionSemester !== 0 &&
			(completionSemester === null || plan.plannedSemester <= completionSemester),
	);
	const additionalCoursesBeforeCompletion = restrictedPlans
		.filter((plan) => !coreCourseIds.has(plan.name))
		.map((plan) => coursesById.get(plan.name))
		.filter((course): course is Course<string> => course !== undefined);
	const restrictedCourses = additionalCoursesBeforeCompletion.filter(
		(course) => !allowedAdditionalCourseIds.has(course.id),
	);
	const additionalECTSBeforeCompletion = additionalCoursesBeforeCompletion.reduce(
		(total, course) => total + course.ects,
		0,
	);
	const plannedOrCompletedCourseIds = new Set([
		...alreadyCompletedCourseIds,
		...planning.map((plan) => plan.name),
	]);
	const unplannedCoreCourses = coreCourses.filter((course) => !plannedOrCompletedCourseIds.has(course.id));

	return {
		completedECTS,
		projectedECTS,
		completionSemester,
		additionalECTSBeforeCompletion,
		restrictedCourses,
		additionalCoursesBeforeCompletion,
		unplannedCoreCourses,
	};
}

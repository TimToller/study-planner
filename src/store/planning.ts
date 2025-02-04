import { rawCourses } from "@/data/courses";
import { CoursePlan } from "@/types/courses";

import { CourseGrading } from "@/types/courses";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const gradesAtom = atomWithStorage<CourseGrading[]>("grades", []);

export const setGradesAtom = atom(null, (get, set, course: CourseGrading) => {
	const current = get(gradesAtom);
	const index = current.findIndex((p) => p.name === course.name);
	if (index === -1) {
		set(gradesAtom, [...current, course]);
	} else {
		const updated = [...current];
		updated[index] = course;
		set(gradesAtom, updated);
	}
});

export const planningAtom = atomWithStorage<CoursePlan[]>("semester-plans", []);

export const setPlanningAtom = atom(null, (get, set, course: CoursePlan) => {
	const current = get(planningAtom);
	const index = current.findIndex((p) => p.name === course.name);
	if (index === -1) {
		set(planningAtom, [...current, course]);
	} else {
		const updated = [...current];
		updated[index] = course;
		set(planningAtom, updated);
	}
});

export const personalCoursesAtom = atom((get) => {
	const grades = get(gradesAtom);
	const planning = get(planningAtom);
	console.log(grades, planning);

	return rawCourses.map((c) => ({
		...c,
		grade: grades.find((p) => p.name === c.name)?.grade,
		plannedSemester: planning.find((p) => p.name === c.name)?.plannedSemester,
	}));
});

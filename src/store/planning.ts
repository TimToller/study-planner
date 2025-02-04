import { rawCourses } from "@/data/courses";
import { CoursePlan } from "@/types/courses";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { gradesAtom } from "./grades";

export const planningAtom = atomWithStorage<CoursePlan[]>("semester-plans", []);

export const setPlanningAtom = atom(null, (get, set, course: CoursePlan) => {
	const current = get(planningAtom);
	const index = current.findIndex((p) => p.name === course.name);

	if (course.plannedSemester === undefined) {
		if (index !== -1) {
			const updated = [...current];
			updated.splice(index, 1);
			set(planningAtom, updated);
		}
		return;
	}
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

	return rawCourses.map((c) => ({
		...c,
		grade: grades.find((p) => p.name === c.name)?.grade,
		plannedSemester: planning.find((p) => p.name === c.name)?.plannedSemester,
	}));
});

import { rawCourses } from "@/data/courses";
import { Course, CoursePlan } from "@/types/courses";

import { getSemester } from "@/lib/semester";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { gradesAtom } from "./grades";
import { startingSemesterAtom } from "./settings";

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

export interface PlanningInfo {
	name: string;
	message: string;
	course?: Course;
}
export const planningInfoAtom = atom((get) => {
	const planning = get(planningAtom);
	const startingSemester = get(startingSemesterAtom);

	const errors: PlanningInfo[] = [];
	const warnings: PlanningInfo[] = [];
	const recommendations: PlanningInfo[] = [];

	const semesterECTSMap = new Map<string, number>();

	planning.forEach((course) => {
		//Errors
		const courseData = rawCourses.find((c) => c.name === course.name)!;

		if (course.plannedSemester === undefined) {
			return;
		}

		const semesterECTS = semesterECTSMap.get(course.plannedSemester?.toString()) ?? 0;
		semesterECTSMap.set(course.plannedSemester?.toString(), semesterECTS + courseData.ects);

		//check WS or SS
		if (course.plannedSemester !== "accredited" && courseData.available !== undefined) {
			const planned = getSemester(course.plannedSemester!, startingSemester);
			if (planned.type !== courseData.available) {
				errors.push({
					name: course.name,
					message: `Course **${course.name}** is only available in **${courseData.available}**`,
					course: courseData,
				});
			}
		}

		//check VL and UE in same semester
		if (courseData.type === "UE") {
			const courseVL = planning.find(
				(p) =>
					p.name.slice(3) === course.name.slice(3) &&
					p.plannedSemester !== "accredited" &&
					rawCourses.find((c) => c.name === p.name)!.type === "VL"
			);

			if (courseVL && course.plannedSemester !== courseVL.plannedSemester) {
				warnings.push({
					name: course.name,
					message: `Course **${course.name}** should ideally be taken in the same semester as the lecture`,
					course: courseData,
				});
			}
		}
	});

	semesterECTSMap.forEach((ects, semester) => {
		if (ects > 40) {
			recommendations.push({
				name: "semester",
				message: `You are planning **${ects} ECTS** in semester **${semester}**. I know you are ambitious, but maybe consider spreading it out a bit more ;)`,
			});
		}
	});

	return { errors, warnings, recommendations };
});

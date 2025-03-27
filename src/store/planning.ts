import { Course, CoursePlan } from "@/types/courses";

import { getSemester } from "@/lib/semester";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { gradesAtom } from "./grades";
import { dependenciesAtom, ignoreGradedAtom, rawCoursesAtom, startingSemesterAtom } from "./settings";

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

	return get(rawCoursesAtom).map((c) => ({
		...c,
		grade: grades.find((p) => p.name === c.name)?.grade,
		plannedSemester: planning.find((p) => p.name === c.name)?.plannedSemester,
	}));
});

export interface PlanningInfo {
	message: string;
	courses?: Course<string>[];
}
export const planningInfoAtom = atom((get) => {
	const planning = get(planningAtom);
	const startingSemester = get(startingSemesterAtom);
	const ignoreGraded = get(ignoreGradedAtom);
	const grades = get(gradesAtom);

	const errors: PlanningInfo[] = [];
	const warnings: PlanningInfo[] = [];
	const recommendations: PlanningInfo[] = [];

	const semesterECTSMap = new Map<string, number>();

	let freeElectiveECTS = 0;
	let aosECTS = 0;

	planning.forEach((course) => {
		//Errors
		const courseData = get(rawCoursesAtom).find((c) => c.name === course.name)!;

		if (course.plannedSemester === undefined || course.plannedSemester === "accredited") {
			return;
		}

		if (ignoreGraded && grades.find((g) => g.name === course.name)?.grade !== undefined) {
			return;
		}

		const semesterECTS = semesterECTSMap.get(course.plannedSemester?.toString()) ?? 0;
		semesterECTSMap.set(course.plannedSemester?.toString(), semesterECTS + courseData.ects);

		//check WS or SS
		if (courseData.available !== undefined) {
			const planned = getSemester(course.plannedSemester!, startingSemester);
			if (planned.type !== courseData.available) {
				errors.push({
					message: `Course **${course.name}** is only available in **${courseData.available}**`,
					courses: [courseData],
				});
			}
		}

		//check VL and UE in same semester
		if (courseData.type === "UE") {
			const courseVL = planning.find(
				(p) =>
					p.name.slice(3) === course.name.slice(3) &&
					p.plannedSemester !== "accredited" &&
					get(rawCoursesAtom).find((c) => c.name === p.name)!.type === "VL"
			);

			if (courseVL && course.plannedSemester !== courseVL.plannedSemester) {
				warnings.push({
					message: `Course **${course.name}** should ideally be taken in the same semester as the lecture`,
					courses: get(rawCoursesAtom).filter((c) => c.name.slice(3) === courseVL.name.slice(3)),
				});
			}
		}

		if (courseData.group === "Free Elective") {
			freeElectiveECTS += courseData.ects;
		} else if (courseData.group === "Area of Specialization") {
			aosECTS += courseData.ects;
		}

		//check dependencies
		const courseDependencies = get(dependenciesAtom).find((d) => d.name === course.name.slice(3))?.dependencies || [];
		for (const dependency of courseDependencies) {
			const requiredCourses = get(rawCoursesAtom).filter((c) => c.name.slice(3) === dependency.name);
			const missingCourses = requiredCourses.filter(
				(c) =>
					!planning.some(
						(p) =>
							p.name === c.name &&
							(p.plannedSemester === "accredited" || p.plannedSemester! <= (course.plannedSemester as number)!)
					)
			);
			if (missingCourses.length > 0) {
				switch (dependency.type) {
					case "hard":
						errors.push({
							message: `Course **${course.name}** strongly depends on **${missingCourses.map((c) => c.name).join(", ")}**`,
							courses: [courseData],
						});
						break;
					case "soft":
						warnings.push({
							message: `Course **${course.name}** requires some of the knowledge of **${missingCourses
								.map((c) => c.name)
								.join(", ")}**`,
							courses: [courseData],
						});
						break;
					case "recommended":
						recommendations.push({
							message: `Before doing **${course.name}**, you could do **${missingCourses.map((c) => c.name).join(", ")}**`,
							courses: [courseData],
						});
						break;
				}
			}
		}
	});

	semesterECTSMap.forEach((ects, semester) => {
		if (ects > 40) {
			recommendations.push({
				message: `You are planning **${ects} ECTS** in semester **${semester}**. I know you are ambitious, but maybe consider spreading it out a bit more ;)`,
			});
		}
	});

	if (freeElectiveECTS < 9) {
		recommendations.push({
			message: `You have only **${freeElectiveECTS} ECTS** of free electives planned. You should still have to do **${
				9 - freeElectiveECTS
			} ECTS** of free electives.`,
		});
	}

	if (aosECTS < 12) {
		recommendations.push({
			message: `You have only **${aosECTS} ECTS** of area of specialization planned. You should still have to do **${
				12 - aosECTS
			} ECTS** of area of specialization.`,
		});
	}

	return { errors, warnings, recommendations };
});

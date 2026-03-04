import { GROUP_REQUIRED_ECTS } from "@/lib/requirements";
import { roundGrade, weightedAverage } from "@/lib/utils";
import { courseGroupsAtom, rawCoursesAtom } from "@/store/settings.ts";
import { CourseGrading } from "@/types/courses";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const gradesAtom = atomWithStorage<CourseGrading[]>("grades", []);

export const setGradesAtom = atom(null, (get, set, course: CourseGrading | { name: string; grade: undefined }) => {
	const current = get(gradesAtom);
	const index = current.findIndex((p) => p.name === course.name);

	if (course.grade === undefined) {
		if (index !== -1) {
			const updated = [...current];
			updated.splice(index, 1);
			set(gradesAtom, updated);
		}
		return;
	}

	if (index === -1) {
		set(gradesAtom, [...current, course]);
	} else {
		const updated = [...current];
		updated[index] = course;
		set(gradesAtom, updated);
	}
});

const ectsMapAtom = atom((get) => {
	const ectsMap = new Map<string, number>();
	get(rawCoursesAtom).forEach((c) => ectsMap.set(c.name, c.ects));
	return ectsMap;
});

export const courseGradeAverageAtom = atom((get) => {
	const grades = get(gradesAtom).filter((g) => g.grade !== undefined);
	const average = weightedAverage(grades.map((g) => ({ number: g.grade, weight: get(ectsMapAtom).get(g.name) ?? 0 })));
	return isNaN(average) ? undefined : average;
});

export const groupGradesAverageAtom = atom((get) => {
	const grades = get(gradesAtom).filter((g) => g.grade !== undefined);
	const courses = get(rawCoursesAtom);
	const requiredECTSByGroup = new Map<string, number>(Object.entries(GROUP_REQUIRED_ECTS));
	const groupNames = Array.from(new Set([...get(courseGroupsAtom).map((group) => group.name), ...requiredECTSByGroup.keys()]));

	return groupNames.map((groupName) => {
		const groupCourses = courses.filter((course) => course.group === groupName);

		const gradedGroupCourses = grades.filter((grade) => groupCourses.some((course) => course.name === grade.name));

		return {
			name: groupName,
			average: weightedAverage(gradedGroupCourses.map((g) => ({ number: g.grade, weight: get(ectsMapAtom).get(g.name) ?? 0 }))),
			totalECTS: requiredECTSByGroup.get(groupName) ?? groupCourses.map((course) => course.ects).reduce((a, b) => a + b, 0),
			gradedECTS: groupCourses
				.filter((course) => grades.some((grade) => grade.name === course.name))
				.map((course) => course.ects)
				.reduce((a, b) => a + b, 0),
		};
	});
});

export const groupGradesRoundedAtom = atom((get) => {
	const averages = get(groupGradesAverageAtom);
	return averages.map((a) => ({ ...a, average: roundGrade(a.average) }));
});

export const passedWithDistinctionAtom = atom((get) => {
	const grouped = get(groupGradesRoundedAtom)
		.map((g) => g.average)
		.filter((a) => !isNaN(a));
	const noThree = grouped.filter((a) => a >= 3).length === 0;
	const moreThanHalfOne = grouped.filter((a) => a === 1).length > grouped.length / 2;
	const distinction = noThree && moreThanHalfOne;
	return {
		noThree,
		moreThanHalfOne,
		distinction,
	};
});

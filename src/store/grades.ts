import { round, weightedAverage } from "@/lib/utils";
import { CourseGrading } from "@/types/courses";
import {atom} from "jotai";
import { atomWithStorage } from "jotai/utils";
import {courseGroupsAtom, rawCoursesAtom} from "@/store/settings.ts";

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
	return ectsMap
})

export const courseGradeAverageAtom = atom((get) => {
	const grades = get(gradesAtom).filter((g) => g.grade !== undefined);
	const average = weightedAverage(grades.map((g) => ({ number: g.grade, weight: get(ectsMapAtom).get(g.name) ?? 0 })));
	return isNaN(average) ? undefined : average;
});

export const groupGradesAverageAtom = atom((get) => {
	const grades = get(gradesAtom).filter((g) => g.grade !== undefined);

	return get(courseGroupsAtom).map((group) => ({
		name: group.name,
		average: weightedAverage(
			grades
				.filter((g) => group.courses.some((c) => `${c.type} ${c.name}` === g.name))
				.map((g) => ({ number: g.grade, weight: get(ectsMapAtom).get(g.name) ?? 0 }))
		),
		totalECTS: group.courses.map((c) => c.ects).reduce((a, b) => a + b, 0),
		gradedECTS: group.courses
			.filter((c) => grades.some((g) => g.name === `${c.type} ${c.name}`))
			.map((c) => c.ects)
			.reduce((a, b) => a + b, 0),
	}));
});

export const groupGradesRoundedAtom = atom((get) => {
	const averages = get(groupGradesAverageAtom);
	return averages.map((a) => ({ ...a, average: round(a.average, 0) }));
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

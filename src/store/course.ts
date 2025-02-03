import { weightedAverage } from "@/lib/utils";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import * as data from "../data/courses";

export const coursesAtom = atomWithStorage("courses", data.rawCourses);
export const averageCourseGradeAtom = atom((get) =>
	weightedAverage(
		get(coursesAtom)
			.filter((c) => c.grade !== undefined)
			.map((c) => ({ number: c.grade!, weight: c.ects }))
	)
);

export const updateGradeAtom = atom(null, (_get, set, { courseName, grade }) => {
	set(coursesAtom, (courses) =>
		courses.map((course) => {
			if (course.name === courseName) {
				return { ...course, grade };
			}
			return course;
		})
	);
});

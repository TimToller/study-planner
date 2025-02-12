import { getCurrentSemester } from "@/lib/semester";
import {Course, CourseGroup, Semester} from "@/types/courses";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { gradesAtom } from "./grades";
import { planningAtom } from "./planning";

import { courseGroups as aiCourseGroups, rawCourses as aiRawCourses } from "@/data/ai/courses";
import { dependencies as aiDependencies} from "@/data/ai/dependencies.ts";

import { courseGroups as csCourseGroups, rawCourses as csRawCourses } from "@/data/cs/courses.ts";
import { dependencies as csDependencies } from "@/data/cs/dependencies.ts";
import {Dependencies} from "@/types/dependencies";

export const exportAtom = atom(
	(get) => {
		const grades = get(gradesAtom);
		const planning = get(planningAtom);
		const settings = get(settingsAtom);

		return {
			grades,
			planning,
			settings,
		};
	},
	(_get, set, data: string) => {
		if (!data) return;
		try {
			const { grades, planning, settings } = JSON.parse(data) as any;

			set(gradesAtom, grades);
			set(planningAtom, planning);
			set(settingsAtom, settings);
			toast.success("Successfully imported settings");
		} catch (error: any) {
			toast.error("Failed to import data");
		}
	}
);

export type Programm = "AI" | "CS";
export type Settings = {
	startingSemester: Semester,
	ignoreGraded: boolean,
	programm: Programm,
}

export const settingsAtom = atomWithStorage<Settings>("settings", {
	startingSemester: getCurrentSemester(),
	ignoreGraded: false,
	programm: "AI"
});

export const startingSemesterAtom = atom(
	(get) => get(settingsAtom).startingSemester,
	(get, set, value: Semester) => {
		if (!value.type) return;
		set(settingsAtom, { ...get(settingsAtom), startingSemester: value });
	}
);

export const ignoreGradedAtom = atom(
	(get) => get(settingsAtom).ignoreGraded,
	(get, set, value: boolean) => {
		set(settingsAtom, { ...get(settingsAtom), ignoreGraded: value });
	}
);

export const programmAtom = atom(
	(get) => get(settingsAtom).programm,
	(get, set, value: Programm) => {
		set(settingsAtom, { ...get(settingsAtom), programm: value });
	}
)

export const courseGroupsAtom = atom<CourseGroup<string>[]>(
	(get) => get(programmAtom) == "AI" ? aiCourseGroups : csCourseGroups,
)

export const rawCoursesAtom = atom<Course<string>[]>(
	(get) => get(programmAtom) == "AI" ? aiRawCourses : csRawCourses,
)

export const dependenciesAtom = atom<Dependencies<string>>(
	(get) => get(programmAtom) == "AI" ? aiDependencies : csDependencies,
)
import { getCurrentSemester } from "@/lib/semester";
import { Course, CourseGroup, Semester } from "@/types/courses";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { gradesAtom } from "./grades";
import { planningAtom } from "./planning";

import { courseGroups as aiCourseGroups, rawCourses as aiRawCourses } from "@/data/ai/courses";
import { dependencies as aiDependencies } from "@/data/ai/dependencies.ts";

import { courseGroups as csCourseGroups, rawCourses as csRawCourses } from "@/data/cs/courses.ts";
import { dependencies as csDependencies } from "@/data/cs/dependencies.ts";
import { Dependencies } from "@/types/dependencies";
import { customCoursesAtom } from "./customCourses";

export const exportAtom = atom(
	(get) => {
		const grades = get(gradesAtom);
		const planning = get(planningAtom);
		const settings = get(settingsAtom);
		const customCourses = get(customCoursesAtom);

		return {
			grades,
			planning,
			settings,
			customCourses,
		};
	},
	(_get, set, data: string) => {
		if (!data) return;
		try {
			const { grades, planning, settings, customCourses } = JSON.parse(data) as any;

			set(gradesAtom, grades);
			set(planningAtom, planning);
			set(settingsAtom, settings);
			set(customCoursesAtom, customCourses ?? []);
			toast.success("Successfully imported settings");
		} catch (error: any) {
			toast.error("Failed to import data");
		}
	}
);

export type Program = "AI" | "CS";
export type Settings = {
	startingSemester: Semester;
	ignoreGraded: boolean;
	program: Program;
};

export const settingsAtom = atomWithStorage<Settings>("settings", {
	startingSemester: getCurrentSemester(),
	ignoreGraded: false,
	program: "AI",
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

export const programAtom = atom(
	(get) => get(settingsAtom).program ?? "AI",
	(get, set, value: Program) => {
		set(settingsAtom, { ...get(settingsAtom), program: value });
	}
);

export const courseGroupsAtom = atom<CourseGroup<string>[]>((get) =>
	get(programAtom) == "AI" ? aiCourseGroups : csCourseGroups
);

export const rawCoursesAtom = atom<Course<string>[]>((get) => {
	const baseCourses = get(programAtom) == "AI" ? aiRawCourses : csRawCourses;
	const customCourses = get(customCoursesAtom);

	return [
		...baseCourses,
		...customCourses.map((course) => ({
			...course,
			name: `${course.type} ${course.name}`,
			id: `${course.type} ${course.name}`,
			recommendedSemester: null,
			group: course.variant,
		})),
	];
});

export const dependenciesAtom = atom<Dependencies<string>>((get) => (get(programAtom) == "AI" ? aiDependencies : csDependencies));

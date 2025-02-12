import { getCurrentSemester } from "@/lib/semester";
import { Semester } from "@/types/courses";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { gradesAtom } from "./grades";
import { planningAtom } from "./planning";

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
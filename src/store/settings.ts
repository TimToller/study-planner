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

export const settingsAtom = atomWithStorage("settings", {
	startingSemester: getCurrentSemester(),
});

export const startingSemesterAtom = atom(
	(get) => get(settingsAtom).startingSemester,
	(get, set, value: Semester) => {
		if (!value.type) return;
		set(settingsAtom, { ...get(settingsAtom), startingSemester: value });
	}
);

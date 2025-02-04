import { atom } from "jotai";
import { gradesAtom, planningAtom } from "./planning";

export const exportAtom = atom((get) => {
	const grades = get(gradesAtom);
	const planning = get(planningAtom);

	return {
		grades,
		planning,
	};
});

import { Course } from "@/types/courses";

export const getCourseByName = <Name extends string>(courses: Course<Name>[], name: string): Course<Name> | undefined => {
	return courses.find((c) => c.name === name || c.legacyNames?.includes(name));
};

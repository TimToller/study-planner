import { Course, CourseGroup } from "@/types/courses";

export const generateRawCourses = <Name extends string>(courseGroups: readonly CourseGroup<Name>[]): Course<Name>[] =>
	courseGroups.flatMap((group) =>
		group.courses.map((course) => {
			const id = `${course.type} ${course.subject.name}`;
			return {
				...course,
				name: id,
				group: group.name,
				id,
			};
		}),
	);

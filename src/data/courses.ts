import {Course, CourseGroup} from "@/types/courses";

export const generateRawCourses = (courseGroups: CourseGroup<string>[]) =>
    courseGroups.reduce(
        (acc, group) => acc.concat(
            group.courses.map((course) => ({
                ...course,
                name: `${course.type} ${course.name}`,
                group: group.name,
                id: `${course.type} ${course.name}`,
            }))
        ),
        [] as Course<string>[]
    )
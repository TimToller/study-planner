import { CustomCourse } from "@/types/courses";
import { atomWithStorage } from "jotai/utils";

export const customCoursesAtom = atomWithStorage<CustomCourse[]>("custom-courses", []);

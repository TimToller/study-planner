import CourseTable from "@/components/course-table";
import { personalCoursesAtom } from "@/store/planning";
import { useAtom } from "jotai";

export default function ListScreen() {
	const [courses] = useAtom(personalCoursesAtom);
	return (
		<section className="h-full flex flex-col">
			<CourseTable courses={courses} />
		</section>
	);
}

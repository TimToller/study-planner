import CourseTable from "@/components/course-table";
import { coursesAtom } from "@/store/course";
import { useAtom } from "jotai";

export default function ListScreen() {
	const [courses] = useAtom(coursesAtom);
	return (
		<section className="h-full flex flex-col">
			<CourseTable courses={courses} />
		</section>
	);
}

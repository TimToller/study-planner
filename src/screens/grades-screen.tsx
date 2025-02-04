import { courseGradeAverageAtom } from "@/store/planning";
import { useAtom } from "jotai";

export default function GradesScreen() {
	const [courseGradeAverage] = useAtom(courseGradeAverageAtom);

	return (
		<section className="h-full flex flex-col">
			<div>Average over all courses: {courseGradeAverage}</div>
		</section>
	);
}

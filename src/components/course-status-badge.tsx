import { cn, getCourseStatus } from "@/lib/utils";
import { Course } from "@/types/courses";
import { Badge } from "./ui/badge";

export const statusMap = {
	unplanned: {
		title: "Unplanned",
		color: "bg-gray-500",
	},
	planned: {
		title: "Planned",
		color: "bg-blue-500",
	},
	current: {
		title: "Current",
		color: "bg-orange-500",
	},
	graded: {
		title: "Graded",
		color: "bg-green-500",
	},
	failed: {
		title: "Failed",
		color: "bg-red-500",
	},
};

interface CourseStatusBadgeProps {
	course: Course;
}
export default function CourseStatusBadge({ course }: CourseStatusBadgeProps) {
	const status = getCourseStatus(course);
	const { title, color } = statusMap[status];

	return <Badge className={cn(color, `hover:${color}/80`)}>{title}</Badge>;
}

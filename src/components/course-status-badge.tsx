import { cn, getCourseStatus } from "@/lib/utils";
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
	plannedSemester?: number;
	grade?: number;
}
export default function CourseStatusBadge({ grade, plannedSemester }: CourseStatusBadgeProps) {
	const status = getCourseStatus(plannedSemester, grade);
	const { title, color } = statusMap[status];

	return <Badge className={cn(color, `hover:${color}/80`)}>{title}</Badge>;
}

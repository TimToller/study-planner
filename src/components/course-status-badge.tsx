import { getCourseStatus } from "@/lib/semester";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarDays, CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { Badge } from "./ui/badge";

export const statusMap = {
  unplanned: {
    title: "Unplanned",
    color: "border-border bg-muted text-muted-foreground",
    icon: CircleDashed,
  },
  planned: {
    title: "Planned",
    color: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    icon: CalendarDays,
  },
  current: {
    title: "Current",
    color: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: Clock3,
  },
  graded: {
    title: "Completed",
    color: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  failed: {
    title: "Failed",
    color: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
    icon: AlertCircle,
  },
};

interface CourseStatusBadgeProps {
  plannedSemester?: number | "accredited";
  grade?: number;
}
export default function CourseStatusBadge({ grade, plannedSemester }: CourseStatusBadgeProps) {
  const status = getCourseStatus(plannedSemester, grade);
  const { title, color, icon: Icon } = statusMap[status];

  return (
    <Badge variant="outline" className={cn("gap-1 whitespace-nowrap", color)}>
      <Icon className="h-3 w-3" /> {title}
    </Badge>
  );
}

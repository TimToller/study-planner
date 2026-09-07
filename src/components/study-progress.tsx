import { cn } from "@/lib/utils";
import { personalCoursesAtom, planningInfoAtom } from "@/store/planning";
import { useAtomValue } from "jotai";
import { AlertTriangle } from "lucide-react";

const DEGREE_ECTS = 180;

export default function StudyProgress({ compact = false }: { compact?: boolean }) {
  const courses = useAtomValue(personalCoursesAtom);
  const { errors, warnings } = useAtomValue(planningInfoAtom);
  const completedECTS = courses
    .filter((course) => course.grade !== undefined && course.grade <= 4)
    .reduce((sum, course) => sum + course.ects, 0);
  const plannedECTS = courses
    .filter((course) => !(course.grade !== undefined && course.grade <= 4) && course.plannedSemester !== undefined)
    .reduce((sum, course) => sum + course.ects, 0);
  const completedWidth = Math.min(100, (completedECTS / DEGREE_ECTS) * 100);
  const plannedWidth = Math.min(100 - completedWidth, (plannedECTS / DEGREE_ECTS) * 100);

  return (
    <div className={cn("min-w-0", compact ? "w-full max-w-sm" : "w-full")}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-bold tabular-nums text-foreground">
          {completedECTS} <span className="font-normal text-muted-foreground">/ {DEGREE_ECTS} ECTS completed</span>
        </span>
        <span className="shrink-0 text-muted-foreground">{Math.round(completedWidth)}%</span>
      </div>
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={DEGREE_ECTS}
        aria-valuenow={completedECTS}
        aria-label={`${completedECTS} of ${DEGREE_ECTS} ECTS completed; ${plannedECTS} ECTS planned`}
      >
        <div className="bg-[hsl(var(--success))]" style={{ width: `${completedWidth}%` }} />
        <div className="bg-primary/75" style={{ width: `${plannedWidth}%` }} />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary/75" /> {plannedECTS} planned
          </span>
        </div>
        {(errors.length > 0 || warnings.length > 0) && (
          <span
            className={cn(
              "flex items-center gap-1",
              errors.length > 0 ? "text-destructive" : "text-amber-700 dark:text-amber-300",
            )}
          >
            <AlertTriangle className="h-3 w-3" />
            {errors.length > 0
              ? `${errors.length} plan ${errors.length === 1 ? "issue" : "issues"}`
              : `${warnings.length} warnings`}
          </span>
        )}
      </div>
    </div>
  );
}

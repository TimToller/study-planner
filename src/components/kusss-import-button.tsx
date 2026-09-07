import { customCoursesAtom } from "@/store/customCourses";
import { gradesAtom } from "@/store/grades";
import { planningAtom } from "@/store/planning";
import { rawCoursesAtom, startingSemesterAtom } from "@/store/settings";
import { useAtom, useAtomValue } from "jotai";
import { Download } from "lucide-react";
import { toast } from "sonner";
import KusssImportDialog from "./kusss-import-dialog";
import { Button, type ButtonProps } from "./ui/button";

type KusssImportButtonProps = Pick<ButtonProps, "className" | "size" | "variant"> & {
  iconOnly?: boolean;
  label?: string;
};

export default function KusssImportButton({
  className,
  iconOnly = false,
  label = "Import",
  size = "default",
  variant = "outline",
}: KusssImportButtonProps) {
  const rawCourses = useAtomValue(rawCoursesAtom);
  const startingSemester = useAtomValue(startingSemesterAtom);
  const [, setStartingSemester] = useAtom(startingSemesterAtom);
  const [, setPlanning] = useAtom(planningAtom);
  const [, setGrades] = useAtom(gradesAtom);
  const [, setCustomCourses] = useAtom(customCoursesAtom);

  return (
    <KusssImportDialog
      rawCourses={rawCourses}
      startingSemester={startingSemester}
      trigger={
        <Button className={className} size={size} variant={variant}>
          <Download className="h-4 w-4" />
          {!iconOnly && label}
          <span className="sr-only">Import from myJKU</span>
        </Button>
      }
      onImport={({ grades, planning, customCourses, firstGradedSemester }) => {
        if (!grades.length && !planning.length && !customCourses.length) {
          toast.error("No matching courses found for this programme");
          return;
        }

        setCustomCourses((current) => {
          const next = new Map(current.map((course) => [`${course.type} ${course.name}`, course]));
          for (const course of customCourses) next.set(`${course.type} ${course.name}`, course);
          return Array.from(next.values());
        });

        setGrades((current) => {
          const next = new Map(current.map((entry) => [entry.name, entry.grade]));
          for (const grade of grades) next.set(grade.name, grade.grade);
          return Array.from(next.entries()).map(([name, grade]) => ({ name, grade }));
        });

        setPlanning((current) => {
          const next = new Map(current.map((entry) => [entry.name, entry.plannedSemester]));
          for (const plan of planning) next.set(plan.name, plan.plannedSemester);
          return Array.from(next.entries()).map(([name, plannedSemester]) => ({ name, plannedSemester }));
        });

        if (firstGradedSemester) setStartingSemester(firstGradedSemester);
        toast.success(`Imported ${grades.length} grades and ${planning.length} semester assignments`);
      }}
    />
  );
}

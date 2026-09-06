import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDefaultUnmatchedVariant, KusssGradeResponse, parseKusssGrades } from "@/lib/kusss-import";
import { Course, CourseGrading, CoursePlan, CustomCourse, Semester } from "@/types/courses";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface KusssImportDialogProps {
  rawCourses: Course<string>[];
  startingSemester: Semester;
  onImport: (payload: {
    grades: CourseGrading[];
    planning: CoursePlan[];
    customCourses: CustomCourse[];
    firstGradedSemester?: Semester;
  }) => void;
  triggerLabel?: string;
  autoDetectStartingSemester?: boolean;
}

const isKusssGradeResponse = (value: unknown): value is KusssGradeResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return !!data.certificates && typeof data.certificates === "object" && !Array.isArray(data.certificates);
};

const parseKusssJson = (text: string): KusssGradeResponse | null => {
  if (!text.trim()) {
    return null;
  }

  try {
    const data: unknown = JSON.parse(text);

    return isKusssGradeResponse(data) ? data : null;
  } catch {
    return null;
  }
};

export default function KusssImportDialog({
  rawCourses,
  startingSemester,
  onImport,
  triggerLabel = "Import from my.jku.at",
  autoDetectStartingSemester = false,
}: KusssImportDialogProps) {
  const [kusssText, setKusssText] = useState("");
  const [open, setOpen] = useState(false);
  const [clipboardInfo, setClipboardInfo] = useState<string | null>(null);
  const [unmatchedVariants, setUnmatchedVariants] = useState<Record<number, CustomCourse["variant"]>>({});

  const kusssData = useMemo(() => parseKusssJson(kusssText), [kusssText]);

  const parsedKusss = useMemo(() => {
    if (!kusssData) {
      return {
        rows: [],
        grades: [],
        planning: [],
        customCourses: [],
        firstGradedSemester: undefined,
      };
    }

    const parsed = parseKusssGrades(kusssData, rawCourses, startingSemester, unmatchedVariants);

    if (
      !autoDetectStartingSemester ||
      !parsed.firstGradedSemester ||
      (parsed.firstGradedSemester.year === startingSemester.year &&
        parsed.firstGradedSemester.type === startingSemester.type)
    ) {
      return parsed;
    }

    return parseKusssGrades(kusssData, rawCourses, parsed.firstGradedSemester, unmatchedVariants);
  }, [autoDetectStartingSemester, kusssData, rawCourses, startingSemester, unmatchedVariants]);

  const sortedRows = useMemo(
    () =>
      [...parsedKusss.rows].sort((a, b) => Number(Boolean(a.matchedCourseName)) - Number(Boolean(b.matchedCourseName))),
    [parsedKusss.rows],
  );

  const rowsNeedingManual = useMemo(
    () => parsedKusss.rows.filter((row) => !row.matchedCourseName).length,
    [parsedKusss.rows],
  );

  const tryReadClipboard = async ({ manual }: { manual: boolean }) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
      if (manual) {
        setClipboardInfo("Clipboard access is not available in this browser.");
      }

      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        if (manual) {
          setClipboardInfo("Clipboard is empty.");
        }

        return;
      }

      if (!parseKusssJson(clipboardText)) {
        if (manual) {
          setClipboardInfo("Clipboard does not contain a valid KUSSS certificates response.");
        }

        return;
      }

      setKusssText(clipboardText);
      setClipboardInfo("KUSSS data found in clipboard and loaded.");
    } catch {
      if (manual) {
        setClipboardInfo("Clipboard access was denied. Paste the JSON manually.");
      }
    }
  };

  useEffect(() => {
    if (!open) return;

    void tryReadClipboard({ manual: false });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Grades import</DialogTitle>

          <DialogDescription>Import your grades and course planning from my.jku.at.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <p>
              Step 1: Open{" "}
              <a
                href="https://my.jku.at/api2/student/certificates"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                the certificates API
              </a>
              . You may need to log in first.
            </p>

            <p>Step 2: Copy the complete JSON response (Ctrl+A, then Ctrl+C).</p>

            <p>Step 3: Paste it below or use the clipboard import.</p>

            <p>Step 4: Review the matched courses and import the data.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void tryReadClipboard({
                  manual: true,
                })
              }
            >
              Read clipboard
            </Button>

            {clipboardInfo && <p className="text-sm text-muted-foreground">{clipboardInfo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kusss-json">KUSSS API response</Label>

            <textarea
              id="kusss-json"
              value={kusssText}
              onChange={(event) => {
                setKusssText(event.target.value);
                setClipboardInfo(null);
              }}
              placeholder='{"certificates": {...}}'
              className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            />

            {kusssText.trim() && !kusssData && (
              <p className="text-sm text-destructive">
                This does not look like a valid KUSSS certificates API response.
              </p>
            )}
          </div>

          {parsedKusss.rows.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {parsedKusss.planning.length} course {parsedKusss.planning.length === 1 ? "planning" : "plannings"} and{" "}
                {parsedKusss.grades.length} {parsedKusss.grades.length === 1 ? "grade" : "grades"} could be imported.{" "}
                {rowsNeedingManual > 0 && (
                  <>
                    {rowsNeedingManual} {rowsNeedingManual === 1 ? "course could" : "courses could"} not be matched
                    automatically.
                  </>
                )}
              </p>

              <div className="max-h-80 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Matched</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sortedRows.map((row) => (
                      <TableRow
                        key={`${row.date}-${row.cleanTitle}-${row.id}`}
                        className={!row.matchedCourseName ? "bg-destructive/10 hover:bg-destructive/20" : undefined}
                      >
                        <TableCell>{row.date}</TableCell>

                        <TableCell>{row.cleanTitle}</TableCell>

                        <TableCell>{row.localType}</TableCell>

                        <TableCell>{row.gradeLabel}</TableCell>

                        <TableCell>
                          {row.plannedSemester === "accredited" ? "Accredited" : (row.semesterCode ?? "-")}
                        </TableCell>

                        <TableCell className={!row.matchedCourseName ? "font-medium text-destructive" : undefined}>
                          {row.matchedCourseName ? (
                            row.matchedCourseName
                          ) : (
                            <Select
                              value={unmatchedVariants[row.id] ?? getDefaultUnmatchedVariant(row.cleanTitle)}
                              onValueChange={(value) =>
                                setUnmatchedVariants((current) => ({
                                  ...current,
                                  [row.id]: value as CustomCourse["variant"],
                                }))
                              }
                            >
                              <SelectTrigger className="min-w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Free Elective">Free Elective</SelectItem>
                                <SelectItem value="Area of Specialization">Area of Specialization</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              onImport({
                grades: parsedKusss.grades,
                planning: parsedKusss.planning,
                customCourses: parsedKusss.customCourses,
                firstGradedSemester: parsedKusss.firstGradedSemester,
              });

              setKusssText("");
              setClipboardInfo(null);
              setOpen(false);
            }}
            disabled={
              parsedKusss.grades.length === 0 &&
              parsedKusss.planning.length === 0 &&
              parsedKusss.customCourses.length === 0
            }
          >
            Import data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

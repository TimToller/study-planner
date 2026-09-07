import KusssImportDialog from "@/components/kusss-import-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { rawCourses as aiRawCourses } from "@/data/ai/courses";
import { rawCourses as csRawCourses } from "@/data/cs/courses";
import { customCoursesAtom } from "@/store/customCourses";
import { gradesAtom } from "@/store/grades";
import { planningAtom } from "@/store/planning";
import { onboardingAtom, Program, programAtom, startingSemesterAtom } from "@/store/settings";
import { SemesterType } from "@/types/courses";
import { useAtom } from "jotai";
import { BookOpenCheck, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface OnboardingForm {
  program: Program | null;
  year: number | null;
  semester: SemesterType | null;
}

export default function OnboardingScreen() {
  // Jotai atoms for onboarding flow
  const [, setOnboardingCompleted] = useAtom(onboardingAtom);
  const [, setProgram] = useAtom(programAtom);
  const [startingSemester, setStartingSemester] = useAtom(startingSemesterAtom);
  const [planning, setPlanning] = useAtom(planningAtom);
  const [, setGrading] = useAtom(gradesAtom);
  const [, setCustomCourses] = useAtom(customCoursesAtom);

  // React Hook Form setup
  const form = useForm<OnboardingForm>({
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form;

  const selectedProgram = form.watch("program");
  const selectedYear = form.watch("year");
  const selectedSemester = form.watch("semester");

  const importRawCourses = selectedProgram === "CS" ? csRawCourses : aiRawCourses;
  const importStartingSemester =
    selectedYear && selectedSemester
      ? {
          year: selectedYear,
          type: selectedSemester,
        }
      : startingSemester;

  const onSubmit = ({ program, semester, year }: OnboardingForm) => {
    if (program === null || semester === null || year === null) {
      return;
    }

    if (planning.length === 0) {
      const semesterOffset = semester === "SS" ? 1 : 0;
      const recommendedPlan = (program === "AI" ? aiRawCourses : csRawCourses)
        .filter(
          (
            course,
          ): course is (typeof aiRawCourses)[number] & {
            recommendedSemester: number;
          } => course.recommendedSemester !== null,
        )
        .map((course) => ({
          name: course.name,
          plannedSemester: course.recommendedSemester + semesterOffset,
        }));

      setPlanning(recommendedPlan);
    }

    setProgram(program);
    setStartingSemester({ year: year, type: semester });
    setOnboardingCompleted(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-3 sm:p-7">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-lg"
        >
          <header className="border-b bg-primary/[0.035] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpenCheck className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Set up your study plan</h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Choose your programme and starting semester. The planner will prepare the recommended curriculum,
                  which you can change at any time.
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-7 p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-[32px_1fr]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </span>
              <div className="space-y-2">
                <h2 className="font-bold text-foreground">Choose your bachelor’s programme</h2>
                <FormField
                  name="program"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Program</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value ?? ""}
                          onValueChange={(value) => field.onChange(value as Program)}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        >
                          <ToggleGroupItem
                            value="AI"
                            aria-label="Artificial Intelligence"
                            className="h-auto justify-start px-4 py-3 text-left"
                          >
                            <span>
                              <strong className="block">Artificial Intelligence</strong>
                              <span className="text-sm text-muted-foreground">AI bachelor’s curriculum</span>
                            </span>
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="CS"
                            aria-label="Computer Science"
                            className="h-auto justify-start px-4 py-3 text-left"
                          >
                            <span>
                              <strong className="block">Computer Science</strong>
                              <span className="text-sm text-muted-foreground">CS bachelor’s curriculum</span>
                            </span>
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[32px_1fr]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </span>
              <div className="space-y-2">
                <h2 className="font-bold text-foreground">When did you start?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    name="year"
                    control={control}
                    rules={{
                      required: "Year is required",
                      min: { value: 1900, message: "Year must be ≥ 1900" },
                      max: { value: 2099, message: "Year must be ≤ 2099" },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="year">Year</FormLabel>
                        <FormControl>
                          <Input
                            id="year"
                            type="number"
                            min={1900}
                            max={2099}
                            step={1}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* Semester toggle */}
                  <FormField
                    name="semester"
                    control={control}
                    rules={{ required: "Semester is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="semester">Semester</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value ?? ""}
                            onValueChange={(val) => field.onChange(val as SemesterType)}
                            className="grid grid-cols-2 gap-2"
                          >
                            <ToggleGroupItem value="WS" aria-label="Winter Semester">
                              Winter
                            </ToggleGroupItem>
                            <ToggleGroupItem value="SS" aria-label="Summer Semester">
                              Summer
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Semester labels and imported dates use this as their starting point.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[32px_1fr]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                3
              </span>
              <div>
                <h2 className="font-bold text-foreground">Import existing results (optional)</h2>
                <p className="mb-3 mt-1 text-sm text-muted-foreground">
                  Importing from myJKU can fill grades and past semesters automatically.
                </p>
                <KusssImportDialog
                  rawCourses={importRawCourses}
                  startingSemester={importStartingSemester}
                  triggerLabel="Import Grades"
                  onImport={({ grades, planning, customCourses, firstGradedSemester }) => {
                    if (!grades.length && !planning.length && !customCourses.length) {
                      toast.error("No matching courses found for selected program.");
                      return;
                    }

                    setCustomCourses((current) => {
                      const next = new Map(current.map((course) => [`${course.type} ${course.name}`, course]));
                      for (const course of customCourses) {
                        next.set(`${course.type} ${course.name}`, course);
                      }
                      return Array.from(next.values());
                    });

                    setGrading((current) => {
                      const next = new Map(current.map((entry) => [entry.name, entry.grade]));
                      for (const grade of grades) {
                        next.set(grade.name, grade.grade);
                      }
                      return Array.from(next.entries()).map(([name, grade]) => ({
                        name,
                        grade,
                      }));
                    });

                    setPlanning((current) => {
                      const next = new Map(current.map((entry) => [entry.name, entry.plannedSemester]));
                      for (const plan of planning) {
                        next.set(plan.name, plan.plannedSemester);
                      }
                      return Array.from(next.entries()).map(([name, plannedSemester]) => ({
                        name,
                        plannedSemester,
                      }));
                    });

                    const importedProgram = selectedProgram ?? "AI";
                    const importedStartingSemester = firstGradedSemester ?? importStartingSemester;

                    form.reset({
                      program: importedProgram,
                      year: importedStartingSemester.year,
                      semester: importedStartingSemester.type,
                    });

                    setProgram(importedProgram);
                    setStartingSemester(importedStartingSemester);
                    setOnboardingCompleted(true);

                    toast.success(`Imported ${grades.length} grades and ${planning.length} semesters.`);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" /> Your data is stored in this browser.
              </p>
              <Button type="submit" disabled={!isValid} className="sm:min-w-44">
                Create study plan
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

import { getGroupAccentColor, round } from "@/lib/utils";
import { gradesAtom } from "@/store/grades";
import { courseGroupsAtom } from "@/store/settings";
import {
  courseImportanceAtom,
  groupStatsAtom,
  resetSimulationGradesAtom,
  setLowerBoundSimulationGradesAtom,
  setSimulationGradesAtom,
  simulationGoalAtom,
  simulationGoalReachableAtom,
  simulationGradesAtom,
  simulationGradesAverageAtom,
  type SimulationGoal,
} from "@/store/simulation";
import { useAtom } from "jotai";
import { Check, CircleAlert, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formatAverage = (value: number | undefined) =>
  value === undefined || Number.isNaN(value) ? "–" : round(value).toFixed(2).replace(/\.00$/, "");

export default function CourseFocus() {
  const [simulationGoal, setSimulationGoal] = useAtom(simulationGoalAtom);
  const [grades] = useAtom(gradesAtom);
  const [simGrades] = useAtom(simulationGradesAtom);
  const [, setSimGrades] = useAtom(setSimulationGradesAtom);
  const [, resetSimGrades] = useAtom(resetSimulationGradesAtom);
  const [, calculateTargets] = useAtom(setLowerBoundSimulationGradesAtom);
  const [groups] = useAtom(courseGroupsAtom);
  const [stats] = useAtom(groupStatsAtom);
  const [courseImpacts] = useAtom(courseImportanceAtom);
  const [goalReachable] = useAtom(simulationGoalReachableAtom);
  const [simulationAverages] = useAtom(simulationGradesAverageAtom);
  const [showRecordedCourses, setShowRecordedCourses] = useState<Record<string, boolean>>({});

  const groupView = useMemo(() => {
    const realMap = new Map(grades.map((grade) => [grade.name, grade.grade]));
    const simMap = new Map(simGrades.map((grade) => [grade.name, grade.grade]));
    const courseImpactMap = new Map(courseImpacts.map((course) => [course.courseName, course]));

    return groups.map((group) => {
      const groupStat = stats.find((candidate) => candidate.name === group.name);
      const courses = group.courses
        .map((course) => {
          const key = `${course.type} ${course.subject.name}`;
          const courseImpact = courseImpactMap.get(key);
          return {
            key,
            ects: course.ects,
            realGrade: realMap.get(key),
            simGrade: simMap.get(key),
            impact: courseImpact?.impact ?? "low",
            structuralImpact: courseImpact?.structuralImpact ?? 0,
          };
        })
        .sort((a, b) => {
          if (a.realGrade !== undefined && b.realGrade === undefined) return 1;
          if (a.realGrade === undefined && b.realGrade !== undefined) return -1;
          const impactRank = { high: 3, medium: 2, low: 1 };
          return (
            impactRank[b.impact as keyof typeof impactRank] - impactRank[a.impact as keyof typeof impactRank] ||
            b.structuralImpact - a.structuralImpact ||
            a.key.localeCompare(b.key)
          );
        });

      return {
        name: group.name,
        courses,
        average: groupStat?.average,
        rounded: groupStat?.rounded,
        optimisticAverage: groupStat?.optimisticAverage,
        allRecorded: courses.every((course) => course.realGrade !== undefined),
        allTargetsSet: courses.every((course) => course.realGrade !== undefined || course.simGrade !== undefined),
      };
    });
  }, [grades, groups, courseImpacts, simGrades, stats]);

  const setGrade = (courseName: string, value: string) =>
    setSimGrades({
      name: courseName,
      grade: value === "none" ? undefined : (Number(value) as 1 | 2 | 3 | 4 | 5),
    });

  return (
    <Card className="shadow-none" id="course-focus">
      <CardHeader className="border-b p-5 sm:p-6">
        <h2 className="text-xl font-bold text-foreground">Course Focus</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Calculate workable target grades, then adjust individual courses to test another outcome.
        </p>
      </CardHeader>

      <div className="z-30 grid gap-4 border-b bg-card/95 p-4 backdrop-blur md:sticky md:top-16 lg:grid-cols-[minmax(220px,300px)_auto_1fr_auto] lg:items-end">
        <label className="space-y-1.5 text-sm font-bold text-foreground">
          Goal
          <Select onValueChange={(goal) => setSimulationGoal(goal as SimulationGoal)} value={simulationGoal}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="passedWithDistinction">Graduate with distinction</SelectItem>
                <SelectItem value="allA">Every group rounds to 1</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => calculateTargets()}>
            <Sparkles className="h-4 w-4" /> Calculate targets
          </Button>
          <Button variant="outline" onClick={() => resetSimGrades()} disabled={simGrades.length === 0}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
        <div className="flex gap-6 lg:justify-end">
          <SummaryValue label="Course average" value={formatAverage(simulationAverages.courseAverage)} />
          <SummaryValue label="Group average" value={formatAverage(simulationAverages.groupAverage)} />
        </div>
        <div className="lg:self-center">
          <GoalStatus reachable={goalReachable.reachable} />
        </div>
      </div>

      {!goalReachable.reachable && goalReachable.reasons.length > 0 && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-foreground sm:px-6">
          <p className="font-bold text-destructive">What prevents this goal</p>
          <ul className="mt-1.5 space-y-1">
            {goalReachable.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <CardContent className="p-0">
        <div className="border-b px-5 py-3 text-sm text-muted-foreground sm:px-6">
          Suggested grades are estimates. Recorded grades stay fixed and appear muted for context.
        </div>
        <Accordion
          type="multiple"
          defaultValue={groupView
            .filter((group) => group.courses.some((course) => course.realGrade === undefined))
            .map((group) => group.name)}
        >
          {groupView.map((group) => {
            const accent = getGroupAccentColor(group.name);
            const recordedCourses = group.courses.filter((course) => course.realGrade !== undefined);
            const visibleCourses = showRecordedCourses[group.name]
              ? group.courses
              : group.courses.filter((course) => course.realGrade === undefined);
            return (
              <AccordionItem key={group.name} value={group.name} className="border-b last:border-b-0">
                <AccordionTrigger className="min-w-0 max-w-full gap-4 overflow-hidden px-5 py-4 hover:no-underline sm:px-6">
                  <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-foreground">{group.name}</span>
                      <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                        {group.allRecorded
                          ? "All grades recorded"
                          : group.allTargetsSet
                            ? "All targets set"
                            : `${group.courses.filter((course) => course.realGrade === undefined).length} targets open`}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <RoundedGroupGrade grade={group.rounded} />
                    <span className="hidden text-right text-sm sm:block">
                      <span className="block font-bold text-foreground">Average {formatAverage(group.average)}</span>
                      <span className="text-muted-foreground">Best case {formatAverage(group.optimisticAverage)}</span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 sm:px-6">
                  {recordedCourses.length > 0 && (
                    <div className="mb-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowRecordedCourses((current) => ({ ...current, [group.name]: !current[group.name] }))
                        }
                      >
                        {showRecordedCourses[group.name] ? "Hide" : "Show"} {recordedCourses.length} recorded{" "}
                        {recordedCourses.length === 1 ? "course" : "courses"}
                      </Button>
                    </div>
                  )}
                  <div className="overflow-hidden rounded-lg border">
                    {visibleCourses.map((course) => {
                      const fixed = course.realGrade !== undefined;
                      const impactLabel = course.impact === "high" ? "High impact" : "Medium impact";
                      return (
                        <div
                          key={course.key}
                          className={`grid gap-3 border-b px-3 py-3 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center ${
                            fixed ? "bg-muted/35 opacity-60" : "bg-card"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-foreground">{course.key}</p>
                              <span className="text-sm text-muted-foreground">{course.ects} ECTS</span>
                              {!fixed && course.impact !== "low" && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                  {impactLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          {fixed ? (
                            <span className="rounded-md border bg-background px-3 py-2 text-sm font-bold tabular-nums">
                              Fixed: {course.realGrade}
                            </span>
                          ) : (
                            <label className="flex items-center justify-between gap-3 text-sm font-bold text-muted-foreground sm:justify-end">
                              Target grade
                              <Select
                                value={course.simGrade?.toString() ?? ""}
                                onValueChange={(value) => setGrade(course.key, value)}
                              >
                                <SelectTrigger className="w-24 bg-background">
                                  <SelectValue placeholder="–" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {[1, 2, 3, 4, 5].map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()}>
                                      {grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function RoundedGroupGrade({ grade }: { grade: number | undefined }) {
  const normalizedGrade = grade === undefined || Number.isNaN(grade) ? undefined : grade;
  const tone =
    normalizedGrade === 1
      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : normalizedGrade === 2
        ? "border-lime-500/35 bg-lime-500/10 text-lime-700 dark:text-lime-300"
        : normalizedGrade === 3
          ? "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : normalizedGrade === 4
            ? "border-orange-500/35 bg-orange-500/10 text-orange-700 dark:text-orange-300"
            : normalizedGrade === 5
              ? "border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-300"
              : "border-muted-foreground/25 bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex min-w-16 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${tone}`}
      aria-label={`Rounded group grade: ${normalizedGrade ?? "not available"}`}
    >
      <span className="text-[10px] font-bold leading-none">Grade</span>
      <span className="text-xl font-bold leading-none tabular-nums">{normalizedGrade ?? "–"}</span>
    </span>
  );
}

function GoalStatus({ reachable }: { reachable: boolean }) {
  return (
    <div
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
        reachable ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"
      }`}
    >
      {reachable ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
      {reachable ? "Goal is achievable" : "Goal is not achievable"}
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

import CourseFocus from "@/components/course-focus";
import ScholarshipRecommendation from "@/components/scholarship-reccomend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatSemester } from "@/lib/semester";
import { getGroupAccentColor, round, roundGrade } from "@/lib/utils";
import { courseGradeAverageAtom, groupGradesAverageAtom, groupGradesRoundedAtom } from "@/store/grades";
import { personalCoursesAtom } from "@/store/planning";
import { startingSemesterAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { BarChart3, BookOpenCheck, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";

const gradeColors = ["#16806f", "#3578d4", "#b87416", "#d97706", "#d34848"];
const gradeChartConfig = { count: { label: "Courses", color: "hsl(var(--primary))" } } satisfies ChartConfig;
const gradeProgressChartConfig = {
  cumulativeECTS: { label: "ECTS graded", color: "#3578d4" },
} satisfies ChartConfig;
const curriculumChartConfig = { totalECTS: { label: "ECTS" } } satisfies ChartConfig;

export default function GradesScreen() {
  const [courseGradeAverage] = useAtom(courseGradeAverageAtom);
  const [groupGradesRounded] = useAtom(groupGradesRoundedAtom);
  const [groupGradesAverage] = useAtom(groupGradesAverageAtom);
  const [courses] = useAtom(personalCoursesAtom);
  const [startingSemester] = useAtom(startingSemesterAtom);

  const completedCourses = courses.filter((course) => course.grade !== undefined && course.grade <= 4);
  const completedECTS = completedCourses.reduce((sum, course) => sum + course.ects, 0);
  const validGroupGrades = groupGradesRounded.map((group) => group.average).filter((grade) => !isNaN(grade));
  const overallGroupGrade =
    validGroupGrades.length > 0
      ? roundGrade(validGroupGrades.reduce((sum, grade) => sum + grade, 0) / validGroupGrades.length)
      : undefined;
  const gradeDistribution = [1, 2, 3, 4, 5].map((grade) => ({
    grade: grade.toString(),
    count: courses.filter((course) => course.grade === grade).length,
  }));
  const gradeProgressBySemester = Array.from(
    courses
      .filter(
        (course): course is typeof course & { grade: number; plannedSemester: number } =>
          course.grade !== undefined && typeof course.plannedSemester === "number",
      )
      .reduce((bySemester, course) => {
        bySemester.set(course.plannedSemester, (bySemester.get(course.plannedSemester) ?? 0) + course.ects);
        return bySemester;
      }, new Map<number, number>()),
  )
    .sort(([semesterA], [semesterB]) => semesterA - semesterB)
    .reduce<{ semester: string; cumulativeECTS: number }[]>((progress, [semester, completedECTS]) => {
      const previousTotal = progress.length > 0 ? progress[progress.length - 1].cumulativeECTS : 0;
      progress.push({
        semester: formatSemester(semester, startingSemester, { simple: true }),
        cumulativeECTS: previousTotal + completedECTS,
      });
      return progress;
    }, []);
  const curriculum = groupGradesAverage.map((group) => ({
    ...group,
    color: getGroupAccentColor(group.name),
    remainingECTS: group.totalECTS - group.gradedECTS,
  }));
  const totalCurriculumECTS = curriculum.reduce((sum, group) => sum + group.totalECTS, 0);

  return (
    <section className="m-2 flex h-full flex-col gap-5 py-3 sm:m-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Grades and progress</h1>
        <p className="mt-1 text-base text-muted-foreground">
          See what is complete, understand the curriculum, and calculate the grades needed for your goal.
        </p>
      </header>

      <Card className="shadow-none">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
          <Metric label="Course average" value={courseGradeAverage ? round(courseGradeAverage).toString() : "–"} />
          <Metric label="Group grade" value={overallGroupGrade?.toString() ?? "–"} />
          <Metric label="Bachelor completed" value={`${completedECTS} ECTS`} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="border-b p-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" /> Grade distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">Recorded course components by grade.</p>
            </CardHeader>
            <CardContent className="p-5">
              <ChartContainer config={gradeChartConfig} className="h-64 w-full aspect-auto">
                <BarChart
                  accessibilityLayer
                  data={gradeDistribution}
                  margin={{ top: 12, right: 8, bottom: 0, left: -20 }}
                >
                  <XAxis dataKey="grade" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={entry.grade} fill={gradeColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="border-b p-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" /> Semester progress
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Cumulative ECTS with recorded grades, grouped by planned semester.
              </p>
            </CardHeader>
            <CardContent className="p-5">
              {gradeProgressBySemester.length > 0 ? (
                <ChartContainer config={gradeProgressChartConfig} className="h-64 w-full aspect-auto">
                  <LineChart
                    accessibilityLayer
                    data={gradeProgressBySemester}
                    margin={{ top: 12, right: 0, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="semester" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          labelFormatter={(_label, payload) => payload?.[0]?.payload?.semester ?? ""}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="cumulativeECTS"
                      stroke="var(--color-cumulativeECTS)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "var(--color-cumulativeECTS)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Add a planned semester to a graded course to see your progress here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpenCheck className="h-5 w-5 text-primary" /> Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">Every curriculum group, sized by its required ECTS.</p>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-64 h-64">
                  <ChartContainer config={curriculumChartConfig} className="w-full h-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                      <Pie
                        data={curriculum
                          .flatMap((group) => [
                            {
                              name: group.name,
                              value: group.gradedECTS,
                              color: group.color,
                              type: "completed",
                            },
                            group.remainingECTS > 0 && {
                              name: `${group.name} (remaining)`,
                              value: group.remainingECTS,
                              color: group.color,
                              type: "remaining",
                            },
                          ])
                          .filter(Boolean)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={1}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      >
                        {curriculum
                          .flatMap((group) => [
                            <Cell key={`${group.name}-completed`} fill={group.color} />,
                            group.remainingECTS > 0 && (
                              <Cell key={`${group.name}-remaining`} fill={group.color} opacity={0.2} />
                            ),
                          ])
                          .filter(Boolean)}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <strong className="text-3xl font-bold tabular-nums text-foreground">{completedECTS}</strong>
                    <span className="text-sm text-muted-foreground">of {totalCurriculumECTS} ECTS</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {curriculum.map((group) => {
                  const percentage = (group.gradedECTS / group.totalECTS) * 100;
                  return (
                    <div key={group.name}>
                      <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
                        <span className="flex items-center gap-2 font-bold text-foreground min-w-0">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="truncate">{group.name}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground text-xs">
                          {group.gradedECTS}/{group.totalECTS}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: group.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CourseFocus />
      <ScholarshipRecommendation />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm:text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

import { formatSemester } from "@/lib/semester";
import { cn, round } from "@/lib/utils";
import { isScholarshipApplicationPeriod, recentCourseAverageAtom, SCHOLARSHIP_CHANCES, type ScholarshipChance } from "@/store/scholarship";
import { startingSemesterAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { CalendarCheck, CalendarX, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

const chanceColorClasses: Record<ScholarshipChance, string> = {
  [SCHOLARSHIP_CHANCES.notEligible]: "text-red-500",
  [SCHOLARSHIP_CHANCES.low]: "text-red-500",
  [SCHOLARSHIP_CHANCES.moderate]: "text-yellow-500",
  [SCHOLARSHIP_CHANCES.good]: "text-green-500",
  [SCHOLARSHIP_CHANCES.veryGood]: "text-green-500",
};

export default function ScholarshipRecommendation() {
  const [{ average, ects, latestSemester, chances, points }] = useAtom(recentCourseAverageAtom);
  const [startSemester] = useAtom(startingSemesterAtom);

  const hasEstimate = !(
    latestSemester === undefined ||
    ects === undefined ||
    average === undefined ||
    chances === undefined ||
    points === undefined
  );
  const applicationPeriodOpen = isScholarshipApplicationPeriod();

  return (
    <div id="merit-scholarship" className="flex scroll-mt-4 flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Merit Scholarship</h2>
        {hasEstimate ? (
          <>
            <p>
              Looking at the past two semesters {formatSemester(latestSemester, startSemester, { simple: true })} &{" "}
              {formatSemester(latestSemester - 1, startSemester, { simple: true })} you appear to have a course average of{" "}
              <b>{round(average)}</b> and completed <b>{ects}</b> ECTS.
            </p>
            <p>
              With these results, you probably have <span className={cn("font-bold", chanceColorClasses[chances])}>{chances}</span> chances
              of receiving a merit scholarship (750€–1500€).
            </p>
          </>
        ) : (
          <p>Add your grades and semester assignments to see a rough scholarship estimate.</p>
        )}
      </header>
      <Alert className={applicationPeriodOpen ? "border-emerald-500/60" : undefined}>
        {applicationPeriodOpen ? <CalendarCheck className="h-4 w-4" /> : <CalendarX className="h-4 w-4" />}
        <AlertTitle>{applicationPeriodOpen ? "Application reminder is active" : "Outside the application reminder period"}</AlertTitle>
        <AlertDescription>
          {applicationPeriodOpen
            ? "It is currently October 1–31. Check the current requirements and submit your merit scholarship application in time."
            : "The planner shows its annual merit scholarship application reminder from October 1 through October 31."}
        </AlertDescription>
      </Alert>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Further Info</AlertTitle>
        <AlertDescription>
          Notice that getting such a scholarship is <b>highly dependent on different factors</b> like how many other students are applying
          and the overall budget for scholarships, this is just a <b>very rough estimate</b> and not a guarantee. The real current formula
          for calculating ranking scores of students is not very transparent and rather complicated. Typically the application period for
          merit scholarships is at the start of October, but it's best to confirm the exact dates and requirements well in advance.
          <div className="mt-4">
            <Button asChild>
              <a href="https://www.jku.at/en/degree-programs/students/scholarships/merit-scholarships/" target="_blank" rel="noreferrer">
                View official scholarship information
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

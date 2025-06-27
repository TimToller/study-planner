import { formatSemester } from "@/lib/semester";
import { cn, round } from "@/lib/utils";
import { recentCourseAverageAtom } from "@/store/scholarship";
import { startingSemesterAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export default function ScholarshipRecommendation() {
	const [{ average, ects, latestSemester, chances, points }] = useAtom(recentCourseAverageAtom);
	const [startSemester] = useAtom(startingSemesterAtom);

	if (
		latestSemester === undefined ||
		ects === undefined ||
		average === undefined ||
		chances === undefined ||
		points === undefined
	) {
		return null;
	}

	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<h2 className="text-2xl font-bold">Merit Scholarship</h2>
				<p>
					Looking at the past two semesters {formatSemester(latestSemester, startSemester, { simple: true })} &{" "}
					{formatSemester(latestSemester - 1, startSemester, { simple: true })} you appear to had a course average of{" "}
					<b>{round(average)}</b> and did <b>{ects}</b> ECTS.
				</p>
				<p>
					With these results, you probably have{" "}
					<span
						className={cn(
							"font-bold text-green-500",
							chances === "Low" && "text-red-500",
							chances === "Moderate" && "text-yellow-500"
						)}>
						{chances}
					</span>{" "}
					chances of receiving a merit scholarship (750€-1500€).
				</p>
			</header>
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Further Info</AlertTitle>
				<AlertDescription>
					Notice that getting such a scholarship is <b>highly dependent on different factors</b> like how many other students are
					applying and the overall budget for scholarships, this is just a <b>very rough estimate</b> and not a guarantee. The
					real current formula for calculating ranking scores of students is not very transparent and rather complicated.
					Typically the application period for merit scholarships is at the start of October, but it's best to inform yourself
					about the exact dates and requirements well in advance. More information can be found
					<a href="https://www.jku.at/en/degree-programs/students/scholarships/merit-scholarships/" className="underline ml-1">
						here
					</a>
					.
				</AlertDescription>
			</Alert>
		</div>
	);
}

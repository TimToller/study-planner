import CourseFocus from "@/components/course-focus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { average, round } from "@/lib/utils";
import {
	courseGradeAverageAtom,
	groupGradesAverageAtom,
	groupGradesRoundedAtom,
	passedWithDistinctionAtom,
} from "@/store/grades";
import { useAtom } from "jotai";

export default function GradesScreen() {
	const [courseGradeAverage] = useAtom(courseGradeAverageAtom);
	const [groupGradesRounded] = useAtom(groupGradesRoundedAtom);
	const [groupGradesAverage] = useAtom(groupGradesAverageAtom);

	const [{ distinction, moreThanHalfOne, noThree }] = useAtom(passedWithDistinctionAtom);

	return (
		<section className="h-full grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 grid-rows-4 m-4">
			<Card>
				<CardHeader>
					<CardTitle>Average</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-row justify-between">
						<h2 className="text-lg">Course Average:</h2>
						<h3 className="text-lg font-bold">{(courseGradeAverage && round(courseGradeAverage)) || "-"}</h3>
					</div>
					<div className="flex flex-row justify-between">
						<h2 className="text-lg">Group Average:</h2>
						<h3 className="text-lg font-bold">
							{(groupGradesRounded.length && round(average(groupGradesRounded.map((g) => g.average).filter((g) => !isNaN(g))))) ||
								"-"}
						</h3>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Distinction</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-row justify-between">
						<h2 className="text-lg">No Grade 3:</h2>
						<h3 className="text-lg font-bold">{noThree ? "TRUE" : "FALSE"}</h3>
					</div>
					<div className="flex flex-row justify-between">
						<h2 className="text-lg">More than half Grade 1:</h2>
						<h3 className="text-lg font-bold">{moreThanHalfOne ? "TRUE" : "FALSE"}</h3>
					</div>
					<div className="flex flex-row justify-between">
						<h2 className="text-lg">Passed with distinction</h2>
						<h3 className="text-lg font-bold">{distinction ? "TRUE" : "FALSE"}</h3>
					</div>
				</CardContent>
			</Card>
			{groupGradesAverage.map(({ average, gradedECTS, name, totalECTS }) => (
				<Card>
					<CardHeader>
						<div className="flex flex-col gap-2">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">ECTS</span>
								<span className="text-sm font-medium">
									{gradedECTS}/{totalECTS} ({round((gradedECTS / totalECTS) * 100)}%)
								</span>
							</div>
							<Progress
								value={round((gradedECTS / totalECTS) * 100)}
								className={"w-full"}
								indicatorColor={(gradedECTS >= totalECTS && "bg-green-500") || undefined}
							/>
						</div>
						<CardTitle className="text-lg">{name}</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 justify-between">
						<div className="">
							<div className="flex flex-row justify-between">
								<h2 className="text-lg">Average Grade:</h2>
								<h3 className="text-lg font-bold">{round(average) || "-"}</h3>
							</div>
							<div className="flex flex-row justify-between">
								<h2 className="text-lg">Rounded Grade:</h2>
								<h3 className="text-lg font-bold">{round(average, 0) || "-"}</h3>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
			<CourseFocus />
		</section>
	);
}

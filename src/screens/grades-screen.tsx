import CourseFocus from "@/components/course-focus";
import ScholarshipRecommendation from "@/components/scholarship-reccomend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GROUP_REQUIRED_ECTS } from "@/lib/requirements";
import { average, round, roundGrade } from "@/lib/utils";
import {
	courseGradeAverageAtom,
	groupGradesAverageAtom,
	groupGradesRoundedAtom,
	passedWithDistinctionAtom,
} from "@/store/grades";
import { personalCoursesAtom } from "@/store/planning";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";

function colorClasses(rounded: number | undefined) {
	if (rounded === 1) return "border-emerald-500 bg-emerald-50";
	if (rounded === 2) return "border-lime-500 bg-lime-50";
	if (rounded === 3) return "border-yellow-500 bg-yellow-50";
	if (rounded === 4) return "border-orange-500 bg-orange-50";
	if (rounded !== undefined && !isNaN(rounded)) return "border-red-500 bg-red-50";
	return "border-gray-300 bg-gray-50";
}

export default function GradesScreen() {
	const [courseGradeAverage] = useAtom(courseGradeAverageAtom);
	const [groupGradesRounded] = useAtom(groupGradesRoundedAtom);
	const [groupGradesAverage] = useAtom(groupGradesAverageAtom);
	const [courses] = useAtom(personalCoursesAtom);

	const [{ distinction, moreThanHalfOne, noThree }] = useAtom(passedWithDistinctionAtom);
	const hasCelebratedRef = useRef(false);

	const allCoursesGraded = useMemo(() => courses.length > 0 && courses.every((course) => course.grade !== undefined), [courses]);
	const requiredGroupsFilled = useMemo(
		() =>
			Object.keys(GROUP_REQUIRED_ECTS).every((groupName) => {
				const group = groupGradesAverage.find((g) => g.name === groupName);
				return !!group && group.gradedECTS >= group.totalECTS;
			}),
		[groupGradesAverage],
	);
	const canCelebrate = allCoursesGraded && requiredGroupsFilled;

	const fireConfetti = useCallback(async () => {
		const { default: confetti } = await import("canvas-confetti");
		const count = 200;
		const defaults = { origin: { y: 0.7 } };

		const fire = (particleRatio: number, options: Parameters<typeof confetti>[0]) => {
			confetti({
				...defaults,
				...options,
				particleCount: Math.floor(count * particleRatio),
			});
		};

		fire(0.25, { spread: 26, startVelocity: 55 });
		fire(0.2, { spread: 60 });
		fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
		fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
		fire(0.1, { spread: 120, startVelocity: 45 });
	}, []);

	useEffect(() => {
		if (canCelebrate && !hasCelebratedRef.current) {
			hasCelebratedRef.current = true;
			void fireConfetti();
		}

		if (!canCelebrate) {
			hasCelebratedRef.current = false;
		}
	}, [canCelebrate, fireConfetti]);

	return (
		<section className="h-full m-3 sm:m-4 flex flex-col gap-4">
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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
								{(groupGradesRounded.length &&
									roundGrade(average(groupGradesRounded.map((g) => g.average).filter((g) => !isNaN(g))))) ||
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
						{canCelebrate && (
							<Button variant="outline" onClick={() => void fireConfetti()}>
								Replay Celebration
							</Button>
						)}
					</CardContent>
				</Card>
				{groupGradesAverage.map(({ average, gradedECTS, name, totalECTS }) => (
					<Card key={name} className={`border-2 ${colorClasses(roundGrade(average))}`}>
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
									<h3 className="text-lg font-bold">{roundGrade(average) || "-"}</h3>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<ScholarshipRecommendation />
			<CourseFocus />
		</section>
	);
}

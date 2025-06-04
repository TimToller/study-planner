import { gradesAtom } from "@/store/grades";
import { courseGroupsAtom } from "@/store/settings";
import {
	courseImportanceAtom,
	groupStatsAtom,
	resetSimulationGradesAtom,
	setSimulationGradesAtom,
	SimulationGoal,
	simulationGoalAtom,
	simulationGoalReachableAtom,
	simulationGradesAtom,
} from "@/store/simulation";
import { useAtom } from "jotai";
import { Check, Eye, EyeOff, Info, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function colorClasses(rounded: number | undefined) {
	if (rounded === 1) return "border-emerald-500 bg-emerald-50";
	if (rounded === 2) return "border-lime-500 bg-lime-50";
	if (rounded === 3) return "border-yellow-500 bg-yellow-50";
	if (rounded === 4) return "border-orange-500 bg-orange-50";
	if (rounded !== undefined && !isNaN(rounded)) return "border-red-500 bg-red-50";
	return "border-gray-300 bg-gray-50";
}

export default function CourseFocus() {
	const [simulationGoal, setSimulationGoal] = useAtom(simulationGoalAtom);

	const [grades] = useAtom(gradesAtom);
	const [simGrades] = useAtom(simulationGradesAtom);
	const [, setSimGrades] = useAtom(setSimulationGradesAtom);
	const [, resetSimGrades] = useAtom(resetSimulationGradesAtom);
	const [groups] = useAtom(courseGroupsAtom);
	const [stats] = useAtom(groupStatsAtom);
	const [importance] = useAtom(courseImportanceAtom);

	const [goalReachable] = useAtom(simulationGoalReachableAtom);

	const [showGraded, setShowGraded] = useState<Record<string, boolean>>({});
	const toggleShowGraded = (g: string) => setShowGraded((s) => ({ ...s, [g]: !s[g] }));

	const groupView = useMemo(() => {
		const realMap = new Map(grades.map((g) => [g.name, g.grade]));
		const simMap = new Map(simGrades.map((g) => [g.name, g.grade]));
		const importanceMap = new Map(importance.map((i) => [i.courseName, i]));

		return groups.map((group) => {
			const groupStat = stats.find((s) => s.name === group.name);

			const courses = group.courses.map((c) => {
				const key = `${c.type} ${c.name}`;
				const real = realMap.get(key);
				const simulated = simMap.get(key);
				const important = importanceMap.get(key);

				return {
					key,
					ects: c.ects,
					realGrade: real,
					simGrade: simulated,
					importance: important?.importance ?? 0,
					explanation: important?.explanation ?? "",
				};
			});

			const gradedECTS = groupStat?.gradedECTS || 0;
			const fullyGraded = gradedECTS >= groupStat!.totalECTS;

			return {
				name: group.name,
				rounded: groupStat?.rounded,
				courses,
				fullyGraded,
				average: groupStat?.average,
				optimisticAverage: groupStat?.optimisticAverage,
			};
		});
	}, [grades, simGrades, groups, stats, importance]);

	const defaultOpen = groupView.filter((g) => !g.fullyGraded).map((g) => g.name);

	const handleGradeChange = (courseName: string, value: string) => {
		if (value === "None") {
			setSimGrades({ name: courseName, grade: undefined });
		} else {
			setSimGrades({ name: courseName, grade: Number(value) as 1 | 2 | 3 | 4 | 5 });
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<h2 className="text-2xl font-bold">Course Focus</h2>
				<p>Use the planner below to "Simulate" which grades you would need to reach your goals and which courses to focus on.</p>
			</header>

			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Usage</AlertTitle>
				<AlertDescription>
					Adjust hypothetical grades in the dropdowns. Collapsible headers are color-coded by their current rounded average. You
					will see both the average of each group and the group upper-bound, i.e. the average if all remaining courses are graded
					with a 1.
					<br />
					<br />
					The ⚡ Emojis are an indicator as to which courses are important for your goal. The more ⚡ Emojis, the more important
					the course is for your goal. Courses with lots of ECTS, in groups with few total ECTS have the largest impact.
					<br />
					<br />
					Use this tool with caution and only as a rough guide,{" "}
					<b>I can not guarantee that every calculation was done correctly</b>. If you have found a bug or know a way how to
					improve this, please create a PR
					<a href="https://github.com/TimToller/study-planner/compare" className="underline ml-1">
						here
					</a>
					.
				</AlertDescription>
			</Alert>

			{/* Goal picker */}
			<div className="flex flex-row gap-4 items-center">
				<h3 className="text-lg">Goal:</h3>
				<Select onValueChange={(g) => setSimulationGoal(g as SimulationGoal)} value={simulationGoal}>
					<SelectTrigger className="w-56">
						<SelectValue placeholder="Select a goal" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="passed">Passed</SelectItem>
							<SelectItem value="passedWithDistinction">Passed with Distinction</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<Button variant="outline" size="sm" onClick={() => resetSimGrades()} className="ml-auto">
					Reset Simulation
				</Button>
			</div>

			{goalReachable.reachable ? (
				<Alert className="border-emerald-500/50 text-emerald-500 ">
					<Check className="h-4 w-4 !text-emerald-500" />
					<AlertTitle>Goal achievable!</AlertTitle>
					<AlertDescription>
						Great! You're on track to reach your goal. Find out which grades will help you the most.
					</AlertDescription>
				</Alert>
			) : (
				<Alert className="border-destructive/50 text-destructive">
					<X className="h-4 w-4 !text-destructive" />
					<AlertTitle>Goal not achievable!</AlertTitle>
					<AlertDescription>
						Unfortunately, you won't reach your goal with the current grades. {goalReachable.reasons.join(" ")}
					</AlertDescription>
				</Alert>
			)}

			{/* Groups accordion */}
			<Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2">
				{groupView.map((g) => (
					<AccordionItem key={g.name} value={g.name} className={`border-2 rounded-md ${colorClasses(g.rounded)}`}>
						<AccordionTrigger className="px-4 py-2 flex items-center gap-2">
							<span className="font-semibold flex-1">{g.name}</span>
							{g.rounded !== undefined && !isNaN(g.rounded) && (
								<>
									<span className="text-sm font-mono">Ø {g.average?.toPrecision(3)}</span>
									{g.average !== g.optimisticAverage && (
										<span className="text-sm font-mono">≥ {g.optimisticAverage?.toPrecision(3)}</span>
									)}
								</>
							)}
							{g.fullyGraded && <span className="text-xs text-gray-500">Fully graded</span>}
						</AccordionTrigger>
						<AccordionContent className="bg-white px-4 py-3 space-y-4">
							{/* Toggle graded‑courses visibility */}
							{g.courses.some((c) => c.realGrade !== undefined) && (
								<Button size="sm" variant="outline" onClick={() => toggleShowGraded(g.name)} className="mb-2">
									{showGraded[g.name] ? (
										<span className="flex items-center gap-1">
											<EyeOff className="h-4 w-4" /> Hide graded courses
										</span>
									) : (
										<span className="flex items-center gap-1">
											<Eye className="h-4 w-4" /> Show graded courses
										</span>
									)}
								</Button>
							)}

							<div className="flex flex-col gap-3">
								{g.courses
									.filter((c) => c.realGrade === undefined || showGraded[g.name])
									.sort((a, b) => b.importance - a.importance)
									.map((c) => (
										<div key={c.key} className="flex flex-row gap-4 items-start border p-3 rounded-md">
											<div className="flex-1">
												<p className="font-medium">
													{c.key}
													<span className="ml-2 text-xs text-gray-500">{c.ects} ECTS</span>
													{c.realGrade === undefined && (
														<span className="ml-2 text-xs text-gray-500">{"⚡".repeat(Math.ceil(c.importance * 5))}</span>
													)}
												</p>
												{c.explanation && <p className="text-xs text-gray-600 mt-1">{c.explanation}</p>}
											</div>
											{/* Grade column */}
											{c.realGrade !== undefined ? (
												<span className="text-sm font-mono">{c.realGrade}</span>
											) : (
												<Select value={c.simGrade?.toString() ?? ""} onValueChange={(v) => handleGradeChange(c.key, v)}>
													<SelectTrigger className="w-20">
														<SelectValue placeholder="-" />
													</SelectTrigger>
													<SelectContent side="top">
														<SelectGroup>
															{["None", "1", "2", "3", "4", "5"].map((g) => (
																<SelectItem key={g} value={g}>
																	{g}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
											)}
										</div>
									))}
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}

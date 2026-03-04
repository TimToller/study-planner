import KusssImportDialog from "@/components/kusss-import-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { rawCourses as aiRawCourses } from "@/data/ai/courses";
import { rawCourses as csRawCourses } from "@/data/cs/courses";
import { gradesAtom } from "@/store/grades";
import { planningAtom } from "@/store/planning";
import { onboardingAtom, Program, programAtom, startingSemesterAtom } from "@/store/settings";
import { SemesterType } from "@/types/courses";
import { useAtom } from "jotai";
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
					(course): course is (typeof aiRawCourses)[number] & { recommendedSemester: number } =>
						course.recommendedSemester !== null,
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
		<div className="w-full min-h-screen flex items-center flex-col p-3 sm:p-7 justify-center bg-gray-50">
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full space-y-8 bg-white p-4 sm:p-6 rounded-2xl shadow-md">
					{/* --- Section: My Program is: --- */}
					<div className="space-y-2">
						<h3 className="text-lg font-semibold">My Program is:</h3>
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
											className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											<ToggleGroupItem value="AI" aria-label="Artificial Intelligence">
												Artificial Intelligence
											</ToggleGroupItem>
											<ToggleGroupItem value="CS" aria-label="Computer Science">
												Computer Science
											</ToggleGroupItem>
										</ToggleGroup>
									</FormControl>
									<FormMessage className="text-sm text-red-500" />
								</FormItem>
							)}
						/>
					</div>
					<div className="space-y-2">
						<h3 className="text-lg font-semibold">I started in:</h3>
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
												className="grid grid-cols-2 gap-2">
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
						<p className="text-sm text-gray-500 text-center">(You can change these settings later)</p>
					</div>
					<div className="pt-4">
						<KusssImportDialog
							rawCourses={importRawCourses}
							startingSemester={importStartingSemester}
							triggerLabel="Import from KUSSS"
							onImport={({ grades, planning }) => {
								if (!grades.length && !planning.length) {
									toast.error("No matching courses found for selected program.");
									return;
								}

								setGrading((current) => {
									const next = new Map(current.map((entry) => [entry.name, entry.grade]));
									for (const grade of grades) {
										next.set(grade.name, grade.grade);
									}
									return Array.from(next.entries()).map(([name, grade]) => ({ name, grade }));
								});

								setPlanning((current) => {
									const next = new Map(current.map((entry) => [entry.name, entry.plannedSemester]));
									for (const plan of planning) {
										next.set(plan.name, plan.plannedSemester);
									}
									return Array.from(next.entries()).map(([name, plannedSemester]) => ({ name, plannedSemester }));
								});

								toast.success(`Imported ${grades.length} grades and ${planning.length} semesters from KUSSS text.`);
							}}
						/>
					</div>
					<div className="pt-1">
						<Button type="submit" disabled={!isValid} className="w-full">
							Next
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

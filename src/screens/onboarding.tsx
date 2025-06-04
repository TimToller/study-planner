import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { onboardingAtom, Program, programAtom, startingSemesterAtom } from "@/store/settings";
import { SemesterType } from "@/types/courses";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";

interface OnboardingForm {
	program: Program | null;
	year: number | null;
	semester: SemesterType | null;
}

export default function OnboardingScreen() {
	// Jotai atoms for onboarding flow
	const [, setOnboardingCompleted] = useAtom(onboardingAtom);
	const [, setProgram] = useAtom(programAtom);
	const [, setStartingSemester] = useAtom(startingSemesterAtom);

	// React Hook Form setup
	const form = useForm<OnboardingForm>({
		mode: "onChange",
	});

	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = form;

	const onSubmit = ({ program, semester, year }: OnboardingForm) => {
		if (program === null || semester === null || year === null) {
			return;
		}
		setProgram(program);
		setStartingSemester({ year: year, type: semester });
		setOnboardingCompleted(true);
	};

	return (
		<div className="w-full min-h-screen flex items-center flex-col p-7 justify-center bg-gray-50">
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full space-y-8 bg-white p-6 rounded-2xl shadow-md">
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
											className="grid grid-cols-2 gap-2">
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
						<div className="grid grid-cols-2 gap-4">
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
						<Button type="submit" disabled={!isValid} className="w-full">
							Next
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

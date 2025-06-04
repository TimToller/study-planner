"use client";
import { customCoursesAtom } from "@/store/customCourses";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const variants = ["Free Elective", "Area of Specialization"] as const;
const types = ["UE", "VL", "PR", "SE", "KV"] as const;

const courseSchema = z.object({
	name: z.string().min(1, "Name is required"),
	ects: z.preprocess((val) => {
		if (typeof val === "string" || typeof val === "number") {
			const parsed = parseFloat(val as string);
			return isNaN(parsed) ? undefined : parsed;
		}
		return val;
	}, z.number().min(0, "ECTS must be at least 0")),
	variant: z.enum(variants),
	type: z.enum(types),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CustomCourseForm() {
	const [, setCustomCourses] = useAtom(customCoursesAtom);
	const [visible, setVisible] = useState(false);
	const form = useForm<CourseFormValues>({
		resolver: zodResolver(courseSchema),
		defaultValues: {
			name: "",
			ects: 3,
			variant: "Area of Specialization",
			type: "KV",
		},
	});

	const onSubmit = (data: CourseFormValues) => {
		const course = {
			name: data.name,
			variant: data.variant,
			ects: data.ects,
			type: data.type,
		};

		setCustomCourses((prev) => [...prev, course]);

		form.reset();
		console.log("Custom course created", course);
		setVisible(false);
	};

	return (
		<Dialog open={visible} onOpenChange={setVisible}>
			<DialogTrigger asChild>
				<Button className="mt-4">Add custom course</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create custom course</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Course name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="ects"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ECTS</FormLabel>
									<FormControl>
										<Input type="number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="variant"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Variant</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{variants.map((variant) => (
													<SelectItem key={variant} value={variant}>
														{variant.charAt(0).toUpperCase() + variant.slice(1)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{types.map((type) => (
													<SelectItem key={type} value={type}>
														{type}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit">Create</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

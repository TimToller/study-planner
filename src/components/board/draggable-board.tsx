"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSemester } from "@/lib/semester";
import { cn, getGroupColor } from "@/lib/utils";
import { customCoursesAtom } from "@/store/customCourses";
import { personalCoursesAtom, planningInfoAtom, setPlanningAtom } from "@/store/planning";
import { startingSemesterAtom } from "@/store/settings";
import { Course } from "@/types/courses";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	PointerSensor,
	UniqueIdentifier,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import CustomCourseForm from "./custom-course-form";

function DragItem({ course }: { course: Course }) {
	if (!course) return null;
	return (
		<div
			className="p-2 rounded-md shadow-lg cursor-grabbing text-foreground"
			style={{ backgroundColor: getGroupColor(course.group) }}>
			<div className="font-medium">{course.name}</div>
			<div className="text-sm">
				{[
					`${course.ects} ECTS`,
					course.available,
					course.grade !== undefined && `Grade: ${course.grade}`,
					(course.group === "Free Elective" || course.group === "Area of Specialization") && course.group,
				]
					.filter((e) => e !== false && e !== undefined)
					.join(" | ")}
			</div>
		</div>
	);
}

function DroppableContainer({ id, children }: { id: string; children: React.ReactNode }) {
	const { setNodeRef, isOver } = useDroppable({ id });
	return (
		<div
			ref={setNodeRef}
			className={`min-h-[150px] h-full space-y-2 p-2 bg-primary-foreground rounded-md ${
				isOver ? "!bg-secondary" : ""
			} transition-colors`}>
			{children}
		</div>
	);
}

function SortableItem({
	course,
	containerId,
	info,
}: {
	course: Course<string>;
	containerId: string;
	info?: "error" | "warning" | "recommendation";
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: course.id,
		data: { containerId },
	});

	const [, setCustomCourses] = useAtom(customCoursesAtom);
	const [, updatePlanning] = useAtom(setPlanningAtom);

	const removeCustomCourse = (id: string) => {
		updatePlanning({ name: id, plannedSemester: undefined });
		setCustomCourses((prev) => prev.filter((course) => `${course.type} ${course.name}` !== id));
	};

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1,
		backgroundColor: getGroupColor(course.group),
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn(
				`p-2 rounded-md shadow-sm cursor-move transition-colors text-foreground`,
				info && "border-4 border-gray-400",
				info === "warning" && "border-yellow-400",
				info === "error" && "border-red-400"
			)}>
			<div className="relative">
				<div>
					<div className="font-medium">{course.name}</div>
					<div className="text-sm">
						{[
							`${course.ects} ECTS`,
							course.available,
							course.grade !== undefined && `Grade: ${course.grade}`,
							(course.group === "Free Elective" || course.group === "Area of Specialization") && course.group,
						]
							.filter((e) => e !== false && e !== undefined)
							.join(" | ")}
					</div>
				</div>
				{(course.group === "Free Elective" || course.group === "Area of Specialization") && (
					<Button
						size={"icon"}
						variant={"destructive"}
						className="w-4 h-4 absolute -top-2 -right-2"
						onClick={() => removeCustomCourse(course.id)}>
						<X />
					</Button>
				)}
			</div>
		</div>
	);
}

export default function DraggableBoard() {
	const [courses] = useAtom(personalCoursesAtom);
	const [, planCourse] = useAtom(setPlanningAtom);

	const [startSemester] = useAtom(startingSemesterAtom);

	const [columns, setColumns] = useState<Record<string, { id: string; title: string; courses: Course[] }>>({
		search: {
			id: "search",
			title: "Available Courses",
			courses: [],
		},
	});

	useEffect(() => {
		setColumns({
			search: {
				id: "search",
				title: "Available Courses",
				courses: courses.filter((course) => !course.plannedSemester),
			},
			semester1: {
				id: "semester1",
				title: `Semester ${formatSemester(1, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 1),
			},
			semester2: {
				id: "semester2",
				title: `Semester ${formatSemester(2, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 2),
			},
			semester3: {
				id: "semester3",
				title: `Semester ${formatSemester(3, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 3),
			},
			semester4: {
				id: "semester4",
				title: `Semester ${formatSemester(4, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 4),
			},
			semester5: {
				id: "semester5",
				title: `Semester ${formatSemester(5, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 5),
			},
			semester6: {
				id: "semester6",
				title: `Semester ${formatSemester(6, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 6),
			},
			semester7: {
				id: "semester7",
				title: `Semester ${formatSemester(7, startSemester)}`,
				courses: courses.filter((course) => course.plannedSemester === 7),
			},
			accredited: {
				id: "accredited",
				title: "Accredited Courses",
				courses: courses.filter((course) => course.plannedSemester === "accredited"),
			},
		});
	}, [courses, startSemester]);

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	const findContainer = (courseId: UniqueIdentifier): UniqueIdentifier | null => {
		for (const containerId in columns) {
			if (columns[containerId].courses.find((c) => c.name === courseId)) {
				return containerId;
			}
		}
		return null;
	};

	const findCourseById = (courseId: UniqueIdentifier) => {
		for (const containerId in columns) {
			const course = columns[containerId].courses.find((course) => course.id === courseId);
			if (course) return course;
		}
		return null;
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeContainer = findContainer(active.id);
		let overContainer = findContainer(over.id);
		if (!overContainer) {
			overContainer = over.id;
		}
		if (!activeContainer || !overContainer) return;

		// Reordering within the same container.
		if (activeContainer === overContainer) {
			const container = columns[activeContainer];
			const oldIndex = container.courses.findIndex((course) => course.id === active.id);
			const newIndex = container.courses.findIndex((course) => course.id === over.id);
			if (oldIndex === -1 || newIndex === -1) return;
			if (oldIndex !== newIndex) {
				const newCourses = arrayMove(container.courses, oldIndex, newIndex);
				setColumns({
					...columns,
					[activeContainer]: { ...container, courses: newCourses },
				});
			}
		} else {
			// Moving between containers.
			const sourceColumn = columns[activeContainer];
			const destColumn = columns[overContainer];
			const sourceIndex = sourceColumn.courses.findIndex((course) => course.id === active.id);
			if (sourceIndex === -1) return;
			const movingCourse = sourceColumn.courses[sourceIndex];

			const newSourceCourses = [...sourceColumn.courses];
			newSourceCourses.splice(sourceIndex, 1);

			let destIndex = destColumn.courses.findIndex((course) => course.id === over.id);
			if (destIndex === -1) {
				destIndex = destColumn.courses.length;
			}
			const newDestCourses = [...destColumn.courses];
			newDestCourses.splice(destIndex, 0, movingCourse);

			setColumns({
				...columns,
				[activeContainer]: { ...sourceColumn, courses: newSourceCourses },
				[overContainer]: { ...destColumn, courses: newDestCourses },
			});
			planCourse({
				name: movingCourse.name,
				plannedSemester:
					overContainer === "accredited" ? overContainer : parseInt((overContainer as string).replace("semester", ""), 10),
			});
		}
	};
	const [{ errors, recommendations, warnings }] = useAtom(planningInfoAtom);

	const getInfo = (courseId: UniqueIdentifier) => {
		const course = findCourseById(courseId);
		if (!course) return;
		const error = errors.find((e) => e.courses?.some((c) => c.name === course.name));
		if (error) return "error";
		const warning = warnings.find((w) => w.courses?.some((c) => c.name === course.name));
		if (warning) return "warning";
		const recommendation = recommendations.find((r) => r.courses?.some((c) => c.name === course.name));
		if (recommendation) return "recommendation";
		return;
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={({ active }) => setActiveId(active.id)}
			onDragEnd={(event) => {
				handleDragEnd(event);
				setActiveId(null);
			}}
			onDragCancel={() => setActiveId(null)}>
			<div className="flex flex-row h-full gap-4 p-4 relative">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
					{Object.values(columns)
						.filter((col) => !col.id.startsWith("search"))
						.sort((a, b) => parseInt(a.id.replace("semester", ""), 10) - parseInt(b.id.replace("semester", ""), 10))
						.map((column) => {
							const totalEcts = column.courses.reduce((sum, course) => sum + course.ects, 0);
							return (
								<Card key={column.id} className="shadow-md flex flex-col">
									<CardHeader className="flex items-center justify-between">
										<CardTitle className="text-lg font-semibold">
											{column.title}
											{totalEcts > 0 && <span className="ml-2 text-sm text-secondary-foreground">(ECTS: {totalEcts})</span>}
										</CardTitle>
									</CardHeader>
									<CardContent className="h-full">
										<DroppableContainer id={column.id}>
											<SortableContext items={column.courses.map((course) => course.id)} strategy={verticalListSortingStrategy}>
												{column.courses.map((course) => (
													<SortableItem key={course.id} course={course} containerId={column.id} info={getInfo(course.id)} />
												))}
											</SortableContext>
										</DroppableContainer>
									</CardContent>
								</Card>
							);
						})}
				</div>
				<div className="h-[95vh] rounded-md p-2 border-2 shadow-md sticky top-2 bottom-2 min-w-[300px]">
					<ScrollArea className="h-full p-2">
						<h2 className="text-xl font-semibold mb-4 text-foreground">Available Courses</h2>
						<DroppableContainer id="search">
							<SortableContext items={columns.search.courses.map((course) => course.id)} strategy={verticalListSortingStrategy}>
								{columns.search.courses.map((course) => (
									<SortableItem key={course.id} course={course} containerId="search" />
								))}
							</SortableContext>
						</DroppableContainer>
						<CustomCourseForm />
					</ScrollArea>
				</div>
			</div>
			<DragOverlay>{activeId ? <DragItem course={findCourseById(activeId)!} /> : null}</DragOverlay>
		</DndContext>
	);
}

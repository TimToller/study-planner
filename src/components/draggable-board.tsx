"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatSemester } from "@/lib/semester";
import { personalCoursesAtom } from "@/store/planning";
import { startingSemesterAtom } from "@/store/settings";
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtom } from "jotai";
import { useState } from "react";

/**
 * Renders the dragged item in the overlay.
 */
function DragItem({ course }) {
	if (!course) return null;
	return (
		<div className="p-2 bg-gray-200 rounded-md shadow-lg cursor-grabbing">
			<div className="font-medium">{course.name}</div>
			<div className="text-sm text-gray-600">{course.ects} ECTS</div>
		</div>
	);
}

/**
 * Wraps each column so that even when empty it registers as a droppable area.
 */
function DroppableContainer({ id, children }) {
	const { setNodeRef, isOver } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={`min-h-[150px] h-full space-y-2 p-2 bg-gray-50 rounded-md ${isOver ? "bg-blue-50" : ""}`}>
			{children}
		</div>
	);
}

/**
 * Renders a sortable (draggable) item for a course.
 */
function SortableItem({ course, containerId }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: course.id,
		data: { containerId },
	});

	// While dragging, hide the original item so only the overlay is visible.
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="p-2 bg-gray-200 rounded-md shadow-sm cursor-move transition-colors">
			<div className="font-medium">{course.name}</div>
			<div className="text-sm text-gray-600">{course.ects} ECTS</div>
		</div>
	);
}

export default function DraggableBoard() {
	const [courses] = useAtom(personalCoursesAtom);

	const [startSemester] = useAtom(startingSemesterAtom);

	const [columns, setColumns] = useState({
		search: {
			id: "search",
			title: "Available Courses",
			courses: courses.map((c) => ({ ...c, id: c.name })),
		},
		semester1: { id: "semester1", title: `Semester ${formatSemester(1, startSemester)}`, courses: [] },
		semester2: { id: "semester2", title: `Semester ${formatSemester(2, startSemester)}`, courses: [] },
		semester3: { id: "semester3", title: `Semester ${formatSemester(3, startSemester)}`, courses: [] },
		semester4: { id: "semester4", title: `Semester ${formatSemester(4, startSemester)}`, courses: [] },
		semester5: { id: "semester5", title: `Semester ${formatSemester(5, startSemester)}`, courses: [] },
		semester6: { id: "semester6", title: `Semester ${formatSemester(6, startSemester)}`, courses: [] },
		semester7: { id: "semester7", title: `Semester ${formatSemester(7, startSemester)}`, courses: [] },
		accredited: { id: "semester-accredited", title: "Accredited Courses", courses: [] },
	});

	// Track the currently dragged course id.
	const [activeId, setActiveId] = useState(null);

	// Configure pointer sensor (drag activation after 5px movement).
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	/**
	 * Helper to find which container holds a course by its id.
	 */
	const findContainer = (courseId) => {
		for (const containerId in columns) {
			if (columns[containerId].courses.find((course) => course.id === courseId)) {
				return containerId;
			}
		}
		return null;
	};

	/**
	 * Helper to get the course object from its id.
	 */
	const findCourseById = (courseId) => {
		for (const containerId in columns) {
			const course = columns[containerId].courses.find((course) => course.id === courseId);
			if (course) return course;
		}
		return null;
	};

	/**
	 * Handles drag end events: determines whether the course was re-ordered
	 * within the same container or moved between containers.
	 */
	const handleDragEnd = (event) => {
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
		}
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
			<div className="grid grid-cols-5 h-full gap-4 p-4">
				<div className="grid grid-cols-4 gap-4 col-span-4">
					{Object.values(columns)
						.filter((col) => col.id.startsWith("semester"))
						.sort((a, b) => parseInt(a.id.replace("semester", ""), 10) - parseInt(b.id.replace("semester", ""), 10))
						.map((column) => {
							const totalEcts = column.courses.reduce((sum, course) => sum + course.ects, 0);
							return (
								<Card key={column.id} className="bg-white shadow-md flex flex-col">
									<CardHeader className="flex items-center justify-between">
										<CardTitle className="text-lg font-semibold">
											{column.title}
											{totalEcts > 0 && <span className="ml-2 text-sm text-gray-600">(ECTS: {totalEcts})</span>}
										</CardTitle>
									</CardHeader>
									<CardContent className="h-full">
										<DroppableContainer id={column.id}>
											<SortableContext items={column.courses.map((course) => course.id)} strategy={verticalListSortingStrategy}>
												{column.courses.map((course) => (
													<SortableItem key={course.id} course={course} containerId={column.id} />
												))}
											</SortableContext>
										</DroppableContainer>
									</CardContent>
								</Card>
							);
						})}
				</div>

				{/* Available Courses */}
				<ScrollArea className="h-full max-h-screen overflow-y-auto rounded-md p-4 border-2 border-gray-300 bg-white shadow-md">
					<h2 className="text-xl font-semibold mb-4">Available Courses</h2>
					<DroppableContainer id="search">
						<SortableContext items={columns.search.courses.map((course) => course.id)} strategy={verticalListSortingStrategy}>
							{columns.search.courses.map((course) => (
								<SortableItem key={course.id} course={course} containerId="search" />
							))}
						</SortableContext>
					</DroppableContainer>
				</ScrollArea>
			</div>

			{/* Drag overlay to ensure the dragged item is rendered on top */}
			<DragOverlay>{activeId ? <DragItem course={findCourseById(activeId)} /> : null}</DragOverlay>
		</DndContext>
	);
}

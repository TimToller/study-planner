"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSemester } from "@/lib/semester";
import { cn, getGroupAccentColor, getGroupColor } from "@/lib/utils";
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
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  GripVertical,
  Lightbulb,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import CustomCourseForm, { VARIANT_MAP } from "./custom-course-form";

function DragItem({ course }: { course: Course }) {
  if (!course) return null;
  return (
    <div
      className="w-72 rounded-lg border border-l-4 bg-card p-3 text-foreground shadow-xl"
      style={{ borderLeftColor: getGroupAccentColor(course.group) }}
    >
      <div className="font-bold">{course.name}</div>
      <div className="mt-1 text-sm text-muted-foreground">
        {[
          `${course.ects} ECTS`,
          course.available,
          course.grade !== undefined && `Grade: ${course.grade}`,
          VARIANT_MAP.includes(course.group) && course.group,
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
      className={cn(
        "h-full min-h-[150px] space-y-2 rounded-lg border border-dashed bg-muted/25 p-2 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
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
    borderLeftColor: getGroupAccentColor(course.group),
  };

  const InfoIcon =
    info === "error" ? AlertCircle : info === "warning" ? AlertTriangle : info === "recommendation" ? Lightbulb : null;
  const infoLabel =
    info === "error"
      ? "Plan issue"
      : info === "warning"
        ? "Plan warning"
        : info === "recommendation"
          ? "Recommendation"
          : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border border-l-4 p-3 text-foreground shadow-sm transition-[opacity,box-shadow] hover:shadow-md",
        "cursor-grab active:cursor-grabbing",
        info === "warning" && "ring-1 ring-amber-500/50",
        info === "error" && "ring-2 ring-destructive/60",
      )}
    >
      <div className="relative flex gap-2.5">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="font-bold leading-snug">{course.name}</div>
            {InfoIcon && (
              <span
                title={infoLabel ?? undefined}
                aria-label={infoLabel ?? undefined}
                className={cn(
                  "shrink-0",
                  info === "error" && "text-destructive",
                  info === "warning" && "text-amber-700 dark:text-amber-300",
                  info === "recommendation" && "text-primary",
                )}
              >
                <InfoIcon className="h-4 w-4" />
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md bg-background/75 px-1.5 py-0.5 font-bold tabular-nums">{course.ects} ECTS</span>
            {course.available && (
              <span className="inline-flex items-center gap-1 rounded-md bg-background/75 px-1.5 py-0.5">
                <CalendarDays className="h-3 w-3" /> {course.available}
              </span>
            )}
            {course.grade !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md bg-background/75 px-1.5 py-0.5 font-bold",
                  course.grade <= 4 ? "text-[hsl(var(--success))]" : "text-destructive",
                )}
              >
                {course.grade <= 4 && <CheckCircle2 className="h-3 w-3" />} Grade {course.grade}
              </span>
            )}
            {VARIANT_MAP.includes(course.group) && (
              <span className="rounded-md bg-background/75 px-1.5 py-0.5">{course.group}</span>
            )}
          </div>
        </div>
        {VARIANT_MAP.includes(course.group) && (
          <Button
            size={"icon"}
            variant={"destructive"}
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={() => removeCustomCourse(course.id)}
            aria-label={`Remove ${course.name}`}
          >
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
  const [availableCourseSearch, setAvailableCourseSearch] = useState("");

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
    if (!over) {
      const course = findCourseById(active.id);
      if (course?.plannedSemester !== undefined) {
        planCourse({ name: course.name, plannedSemester: undefined });
      }
      return;
    }

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
          overContainer === "search"
            ? undefined
            : overContainer === "accredited"
              ? overContainer
              : parseInt((overContainer as string).replace("semester", ""), 10),
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
  const normalizedAvailableCourseSearch = availableCourseSearch.trim().toLowerCase();
  const visibleAvailableCourses = columns.search.courses.filter(
    (course) =>
      normalizedAvailableCourseSearch.length === 0 ||
      course.name.toLowerCase().includes(normalizedAvailableCourseSearch) ||
      course.type.toLowerCase().includes(normalizedAvailableCourseSearch) ||
      course.group.toLowerCase().includes(normalizedAvailableCourseSearch),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="relative flex h-full flex-col gap-4 p-2 sm:p-4 lg:flex-row">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.values(columns)
            .filter((col) => !col.id.startsWith("search"))
            .sort((a, b) => parseInt(a.id.replace("semester", ""), 10) - parseInt(b.id.replace("semester", ""), 10))
            .map((column) => {
              const totalEcts = column.courses.reduce((sum, course) => sum + course.ects, 0);
              return (
                <Card key={column.id} className="flex flex-col shadow-none">
                  <CardHeader className="sticky top-16 z-20 rounded-t-xl border-b bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">{column.title}</CardTitle>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{totalEcts} ECTS</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-full p-3">
                    {column.id.startsWith("semester") && (
                      <div className="mb-3">
                        <WorkloadMeter ects={totalEcts} />
                      </div>
                    )}
                    <DroppableContainer id={column.id}>
                      <SortableContext
                        items={column.courses.map((course) => course.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {column.courses.map((course) => (
                          <SortableItem
                            key={course.id}
                            course={course}
                            containerId={column.id}
                            info={getInfo(course.id)}
                          />
                        ))}
                      </SortableContext>
                    </DroppableContainer>
                  </CardContent>
                </Card>
              );
            })}
        </div>
        <aside className="h-[60vh] w-full rounded-xl border bg-card p-3 lg:sticky lg:top-32 lg:h-[calc(100vh-9rem)] lg:min-w-[310px] lg:max-w-[340px]">
          <ScrollArea className="h-full pr-2">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-foreground">Available courses</h2>
              <p className="text-sm text-muted-foreground">Drag a course into a semester to add it to your plan.</p>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={availableCourseSearch}
                onChange={(event) => setAvailableCourseSearch(event.target.value)}
                placeholder="Search courses..."
                aria-label="Search available courses"
                className="pl-9"
              />
            </div>
            <DroppableContainer id="search">
              <SortableContext
                items={visibleAvailableCourses.map((course) => course.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleAvailableCourses.map((course) => (
                  <SortableItem key={course.id} course={course} containerId="search" />
                ))}
                {visibleAvailableCourses.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">No available courses found.</p>
                )}
              </SortableContext>
            </DroppableContainer>
            <CustomCourseForm />
          </ScrollArea>
        </aside>
      </div>
      <DragOverlay>{activeId ? <DragItem course={findCourseById(activeId)!} /> : null}</DragOverlay>
    </DndContext>
  );
}

function WorkloadMeter({ ects }: { ects: number }) {
  const percentage = Math.min(100, (ects / 40) * 100);
  const state = ects > 40 ? "Overloaded" : ects > 33 ? "High" : ects >= 27 ? "Balanced" : ects > 0 ? "Light" : "Empty";
  const color =
    ects > 40
      ? "bg-destructive"
      : ects > 33
        ? "bg-amber-500"
        : ects >= 27
          ? "bg-[hsl(var(--success))]"
          : "bg-primary/65";

  return (
    <div>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-muted"
        aria-label={`${ects} ECTS, ${state} workload`}
      >
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
        <span className="absolute inset-y-0 left-3/4 w-px bg-foreground/50" title="30 ECTS target" />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{state}</span>
        <span>30 ECTS target</span>
      </div>
    </div>
  );
}

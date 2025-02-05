import { useDebounce } from "@/hooks/useDebounce";
import { getCourseStatus } from "@/lib/semester";
import { getGroupColor } from "@/lib/utils";
import { setGradesAtom } from "@/store/grades";
import { personalCoursesAtom, setPlanningAtom } from "@/store/planning";
import { searchQueryAtom, selectedGroupsAtom, selectedTypesAtom, sortFieldAtom, sortOrderAtom } from "@/store/tableOptions";
import { Course } from "@/types/courses";
import { useAtom } from "jotai";
import { Filter } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import CourseStatusBadge from "../course-status-badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import GradeSelect from "./grade-select";
import SemesterSelect from "./semester-select";

export default function CourseTable() {
	const [courses] = useAtom(personalCoursesAtom);

	const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
	const debounceSearchQuery = useDebounce(searchQuery, 200);
	const [sortField] = useAtom(sortFieldAtom);
	const [sortOrder] = useAtom(sortOrderAtom);

	const [selectedTypes, setSelectedTypes] = useAtom(selectedTypesAtom);
	const [selectedGroups, setSelectedGroups] = useAtom(selectedGroupsAtom);

	const filteredCourses = useMemo(() => {
		let filtered = [...courses];

		if (debounceSearchQuery) {
			const query = debounceSearchQuery.toLowerCase();
			filtered = filtered.filter((course) => {
				return (
					course.name.toLowerCase().includes(query) ||
					course.group.toLowerCase().includes(query) ||
					course.type.toLowerCase().includes(query) ||
					(course.available && course.available.toLowerCase().includes(query)) ||
					course.ects.toString().includes(query) ||
					(course.recommendedSemester !== null && course.recommendedSemester.toString().includes(query)) ||
					(course.plannedSemester !== undefined && course.plannedSemester.toString().includes(query)) ||
					(course.grade !== undefined && course.grade.toString().includes(query))
				);
			});
		}

		if (selectedTypes.length > 0) {
			filtered = filtered.filter((course) => selectedTypes.includes(course.type));
		}

		if (selectedGroups.length > 0) {
			filtered = filtered.filter((course) => selectedGroups.includes(course.group));
		}

		if (sortField) {
			filtered.sort((a, b) => {
				if (sortField === "status") {
					const statusA = getCourseStatus(a.plannedSemester, a.grade);
					const statusB = getCourseStatus(b.plannedSemester, b.grade);
					return sortOrder === "asc" ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
				}
				if (sortField === "plannedSemester") {
					let aVal = a[sortField] ?? 100;
					let bVal = b[sortField] ?? 100;
					aVal = aVal === "accredited" ? -1 : aVal;
					bVal = bVal === "accredited" ? -1 : bVal;
					return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
				}
				const aVal = a[sortField] ?? "";
				const bVal = b[sortField] ?? "";
				if (typeof aVal === "number" && typeof bVal === "number") {
					return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
				}
				if (typeof aVal === "string" && typeof bVal === "string") {
					return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
				}
				return 0;
			});
		}

		return filtered;
	}, [courses, debounceSearchQuery, selectedTypes, selectedGroups, sortField, sortOrder]);

	const activeFilterCount = selectedTypes.length + selectedGroups.length;

	return (
		<div className="p-4 flex flex-col">
			<div className="mb-4 flex flex-row gap-2 items-center justify-between w-full">
				<Input
					type="text"
					placeholder="Search courses..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-xs"
				/>
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" className="relative">
							<Filter className="w-4 h-4" />
							{activeFilterCount > 0 && (
								<span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white px-2 text-xs">
									{activeFilterCount}
								</span>
							)}
							<span className="ml-2">Filters</span>
						</Button>
					</SheetTrigger>
					<SheetContent className="w-64">
						<SheetHeader>
							<SheetTitle>Filters</SheetTitle>
						</SheetHeader>
						<div className="p-4 space-y-4 text-foreground">
							<div className="gap-2 flex flex-col">
								<h4 className="text-sm font-semibold">Course Type</h4>
								{["UE", "VL", "PR", "SE", "KV"].map((type) => (
									<div key={type} className="flex items-center gap-2 flex-row">
										<Checkbox
											checked={selectedTypes.includes(type)}
											onCheckedChange={(checked) => {
												if (checked) {
													setSelectedTypes((prev) => [...prev, type]);
												} else {
													setSelectedTypes((prev) => prev.filter((t) => t !== type));
												}
											}}
											id={type}
										/>
										<Label htmlFor={type} className="">
											{type}
										</Label>
									</div>
								))}
							</div>
							<div className="gap-2 flex flex-col">
								<h4 className="mb-2 text-sm font-semibold">Course Group</h4>
								{Array.from(new Set(courses.map((course) => course.group))).map((group) => (
									<div key={group} className="flex items-center gap-2 flex-row">
										<Checkbox
											checked={selectedGroups.includes(group)}
											onCheckedChange={(checked) => {
												if (checked) {
													setSelectedGroups((prev) => [...prev, group]);
												} else {
													setSelectedGroups((prev) => prev.filter((g) => g !== group));
												}
											}}
											id={group}
										/>
										<Label htmlFor={group}>{group}</Label>
									</div>
								))}
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
			<TableGuts filteredCourses={filteredCourses} />
		</div>
	);
}

function TableGuts({ filteredCourses }: { filteredCourses: Course[] }) {
	const [sortField, setSortField] = useAtom(sortFieldAtom);
	const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);

	const handleSort = (field: typeof sortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("asc");
		}
	};

	return (
		<Table className="w-full">
			<TableHeader>
				<TableRow>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
						Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("group")}>
						Group {sortField === "group" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("type")}>
						Type {sortField === "type" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
						Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("ects")}>
						ECTS {sortField === "ects" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("available")}>
						Available {sortField === "available" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("plannedSemester")}>
						Semester {sortField === "plannedSemester" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
					<TableHead className="cursor-pointer select-none" onClick={() => handleSort("grade")}>
						Grade {sortField === "grade" && (sortOrder === "asc" ? "↑" : "↓")}
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredCourses.map((course, idx) => (
					<MemoTableRow key={idx} {...course} />
				))}
			</TableBody>
		</Table>
	);
}

const MemoTableRow = React.memo(TableRowElement);

function TableRowElement({
	ects,
	group,
	name,
	recommendedSemester,
	type,
	available,
	grade,
	plannedSemester,
}: Pick<Course, "group" | "type" | "name" | "ects" | "available" | "recommendedSemester" | "plannedSemester" | "grade">) {
	const [, updateGrade] = useAtom(setGradesAtom);
	const [, updatePlanning] = useAtom(setPlanningAtom);

	const handleGradeChange = useCallback(
		(newGrade: number | undefined) => {
			updateGrade({ name, grade: newGrade });
		},
		[name, updateGrade]
	);

	const handleSemesterChange = useCallback(
		(newSemester: number | undefined) => {
			updatePlanning({ name, plannedSemester: newSemester });
		},
		[name, updatePlanning]
	);

	return (
		<TableRow>
			<TableCell>
				<CourseStatusBadge grade={grade} plannedSemester={plannedSemester} />
			</TableCell>
			<TableCell style={{ backgroundColor: getGroupColor(group) }}>{group}</TableCell>
			<TableCell>{type}</TableCell>
			<TableCell>{name}</TableCell>
			<TableCell>{ects}</TableCell>
			<TableCell>{available || "N/A"}</TableCell>
			<TableCell>
				<SemesterSelect semester={plannedSemester} onSemesterChange={handleSemesterChange} />
			</TableCell>
			<TableCell>
				<GradeSelect grade={grade} onGradeChange={handleGradeChange} />
			</TableCell>
		</TableRow>
	);
}

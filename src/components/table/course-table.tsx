import { useDebounce } from "@/hooks/useDebounce";
import { getCourseStatus } from "@/lib/semester";
import { getGroupAccentColor } from "@/lib/utils";
import { setGradesAtom } from "@/store/grades";
import { personalCoursesAtom, setPlanningAtom } from "@/store/planning";
import {
  searchQueryAtom,
  selectedGroupsAtom,
  selectedGradesAtom,
  selectedTypesAtom,
  sortFieldAtom,
  sortOrderAtom,
} from "@/store/tableOptions";
import { Course } from "@/types/courses";
import { useAtom } from "jotai";
import { ArrowDown, ArrowUp, Filter, Search, X } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import CourseStatusBadge from "../course-status-badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
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
  const [selectedGrades, setSelectedGrades] = useAtom(selectedGradesAtom);

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

    if (selectedGrades.length > 0) {
      filtered = filtered.filter((course) => selectedGrades.includes(course.grade));
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
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || aVal === null) return bVal === undefined || bVal === null ? 0 : 1;
        if (bVal === undefined || bVal === null) return -1;
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
  }, [courses, debounceSearchQuery, selectedTypes, selectedGroups, selectedGrades, sortField, sortOrder]);

  const activeFilterCount = selectedTypes.length + selectedGroups.length + selectedGrades.length;
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedGroups([]);
    setSelectedGrades([]);
  };

  return (
    <div className="flex flex-col p-2 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by course, group, semester, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X /> Clear filters
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative flex-1 sm:flex-none">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
                <span className="ml-2">Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-[min(70vh,36rem)] w-[min(92vw,42rem)] overflow-y-auto p-0"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="font-bold">Filter courses</p>
                  <p className="text-sm text-muted-foreground">Selections update the list immediately.</p>
                </div>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
              <div className="grid gap-0 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="p-3">
                  <DropdownMenuLabel>Grade</DropdownMenuLabel>
                  {[1, 2, 3, 4, 5, undefined].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={`grade-${type ?? "ungraded"}`}
                      checked={selectedGrades.includes(type)}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) =>
                        setSelectedGrades((current) =>
                          checked ? [...current, type] : current.filter((grade) => grade !== type),
                        )
                      }
                    >
                      {type === undefined ? "Not graded" : `Grade ${type}`}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <div className="p-3">
                  <DropdownMenuLabel>Course type</DropdownMenuLabel>
                  {["UE", "VL", "PR", "SE", "KV"].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) =>
                        setSelectedTypes((current) =>
                          checked ? [...current, type] : current.filter((selected) => selected !== type),
                        )
                      }
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <div className="p-3">
                  <DropdownMenuLabel>Curriculum group</DropdownMenuLabel>
                  {Array.from(new Set(courses.map((course) => course.group))).map((group) => (
                    <DropdownMenuCheckboxItem
                      key={group}
                      checked={selectedGroups.includes(group)}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) =>
                        setSelectedGroups((current) =>
                          checked ? [...current, group] : current.filter((selected) => selected !== group),
                        )
                      }
                    >
                      <span className="truncate">{group}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator className="m-0" />
              <p className="px-4 py-2.5 text-sm text-muted-foreground">{filteredCourses.length} courses match</p>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filteredCourses.length}</strong> of {courses.length} courses
        </span>
        <span>Change semesters and grades directly below.</span>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <TableGuts filteredCourses={filteredCourses} />
      </div>
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

  const sortIndicator = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  return (
    <>
      <div className="divide-y md:hidden">
        {filteredCourses.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No courses match the current search and filters.
          </p>
        ) : (
          filteredCourses.map((course) => <MobileCourseCard key={course.id} course={course} />)
        )}
      </div>
      <div className="hidden md:block">
        <Table className="w-full">
          <TableHeader className="bg-muted/55">
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                <span className="flex items-center gap-1">Status {sortIndicator("status")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("group")}>
                <span className="flex items-center gap-1">Group {sortIndicator("group")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("type")}>
                <span className="flex items-center gap-1">Type {sortIndicator("type")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                <span className="flex items-center gap-1">Course {sortIndicator("name")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("ects")}>
                <span className="flex items-center gap-1">ECTS {sortIndicator("ects")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("available")}>
                <span className="flex items-center gap-1">Offered {sortIndicator("available")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("plannedSemester")}>
                <span className="flex items-center gap-1">Semester {sortIndicator("plannedSemester")}</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("grade")}>
                <span className="flex items-center gap-1">Grade {sortIndicator("grade")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No courses match the current search and filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => <MemoTableRow key={course.id} {...course} />)
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function MobileCourseCard({ course }: { course: Course }) {
  const [, updateGrade] = useAtom(setGradesAtom);
  const [, updatePlanning] = useAtom(setPlanningAtom);

  return (
    <article className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold leading-snug">{course.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getGroupAccentColor(course.group) }}
            />
            <span className="truncate">{course.group}</span>
          </p>
        </div>
        <CourseStatusBadge grade={course.grade} plannedSemester={course.plannedSemester} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-bold">{course.type}</span>
        <span className="font-bold tabular-nums">{course.ects} ECTS</span>
        <span className="text-muted-foreground">
          {course.available ? `Offered ${course.available}` : "Offered any term"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5 text-sm font-bold text-muted-foreground">
          Semester
          <SemesterSelect
            semester={course.plannedSemester}
            onSemesterChange={(plannedSemester) => updatePlanning({ name: course.name, plannedSemester })}
          />
        </label>
        <label className="space-y-1.5 text-sm font-bold text-muted-foreground">
          Grade
          <GradeSelect grade={course.grade} onGradeChange={(grade) => updateGrade({ name: course.name, grade })} />
        </label>
      </div>
    </article>
  );
}

const MemoTableRow = React.memo(TableRowElement);

function TableRowElement({
  ects,
  group,
  name,
  type,
  available,
  grade,
  plannedSemester,
}: Pick<Course, "group" | "type" | "name" | "ects" | "available" | "plannedSemester" | "grade">) {
  const [, updateGrade] = useAtom(setGradesAtom);
  const [, updatePlanning] = useAtom(setPlanningAtom);

  const handleGradeChange = useCallback(
    (newGrade: number | undefined) => {
      updateGrade({ name, grade: newGrade });
    },
    [name, updateGrade],
  );

  const handleSemesterChange = useCallback(
    (newSemester: Course["plannedSemester"]) => {
      updatePlanning({ name, plannedSemester: newSemester });
    },
    [name, updatePlanning],
  );

  return (
    <TableRow>
      <TableCell>
        <CourseStatusBadge grade={grade} plannedSemester={plannedSemester} />
      </TableCell>
      <TableCell>
        <span className="flex min-w-36 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getGroupAccentColor(group) }} />
          {group}
        </span>
      </TableCell>
      <TableCell>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-bold">{type}</span>
      </TableCell>
      <TableCell className="min-w-56 font-bold">{name}</TableCell>
      <TableCell className="font-bold tabular-nums">{ects}</TableCell>
      <TableCell>
        {available ? (
          <span className="rounded-md border px-1.5 py-0.5 text-xs font-bold">{available}</span>
        ) : (
          <span className="text-muted-foreground">Any</span>
        )}
      </TableCell>
      <TableCell>
        <SemesterSelect semester={plannedSemester} onSemesterChange={handleSemesterChange} />
      </TableCell>
      <TableCell>
        <GradeSelect grade={grade} onGradeChange={handleGradeChange} />
      </TableCell>
    </TableRow>
  );
}

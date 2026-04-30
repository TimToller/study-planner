import { VARIANT_MAP } from "@/components/board/custom-course-form";
import { ExportSettings, ProgramMap } from "@/store/settings";
import { CourseGrading, CoursePlan, Semester, SemesterType, TYPE_MAP } from "@/types/courses";

const NO_VALUE = 0; // sentinel: semester/grade not set (real semesters start at 1)
const ACCREDITED = -1; // sentinel for the "accredited" string

type CompactCourse = [name: string, grade: number, semester: number];
type CompactCustom = [name: string, variant: number, ects: number, type: number];

interface CompactV1 {
	v: 1; // schema version — bump on breaking changes
	y: number; // starting year
	t: number; // starting semester type (index into SEMESTER_TYPE)
	p: number; // program (index into PROGRAM_MAP)
	f: number; // bitflags: 1=ignoreGraded, 2=onboardingCompleted
	c: CompactCourse[];
	x?: CompactCustom[];
}

export const compactSettings = (settings: ExportSettings): CompactV1 => {
	// A course name can appear in grades, planning, or both.
	// Merge by name so we only pay for the name once.
	const merged = new Map<string, { grade?: number; sem?: number }>();

	for (const g of settings.grades) {
		const entry = merged.get(g.name) ?? {};
		entry.grade = g.grade;
		merged.set(g.name, entry);
	}

	for (const p of settings.planning) {
		const entry = merged.get(p.name) ?? {};
		entry.sem = p.plannedSemester === "accredited" ? ACCREDITED : p.plannedSemester;
		merged.set(p.name, entry);
	}

	const c: CompactCourse[] = Array.from(merged, ([name, { grade, sem }]) => [name, grade ?? NO_VALUE, sem ?? NO_VALUE]);

	const f = (settings.settings.ignoreGraded ? 1 : 0) | (settings.settings.onboardingCompleted ? 2 : 0);

	const compact: CompactV1 = {
		v: 1,
		y: settings.settings.startingSemester.year,
		t: SemesterType.indexOf(settings.settings.startingSemester.type),
		p: ProgramMap.indexOf(settings.settings.program),
		f,
		c,
	};

	if (settings.customCourses?.length) {
		compact.x = settings.customCourses.map((cc) => [
			cc.name,
			VARIANT_MAP.indexOf(cc.variant),
			cc.ects,
			TYPE_MAP.indexOf(cc.type),
		]);
	}

	return compact;
};

export const decompactSettings = (compactRaw: string): ExportSettings => {
	const data = JSON.parse(compactRaw) as { v: number };

	switch (data.v) {
		case 1:
			return fromCompactV1(data as unknown as CompactV1);
		default:
			return JSON.parse(compactRaw) as ExportSettings; // fallback for unrecognized versions
	}
};

const fromCompactV1 = (data: CompactV1): ExportSettings => {
	const grades: CourseGrading[] = [];
	const planning: CoursePlan[] = [];

	for (const [name, grade, sem] of data.c) {
		if (grade !== NO_VALUE) grades.push({ name, grade });
		if (sem !== NO_VALUE) {
			planning.push({
				name,
				plannedSemester: sem === ACCREDITED ? "accredited" : sem,
			});
		}
	}

	const result: ExportSettings = {
		grades,
		planning,
		settings: {
			startingSemester: {
				year: data.y,
				type: SemesterType[data.t],
			} as Semester,
			ignoreGraded: (data.f & 1) !== 0,
			program: ProgramMap[data.p],
			onboardingCompleted: (data.f & 2) !== 0,
		},
	};

	if (data.x?.length) {
		result.customCourses = data.x.map(([name, variant, ects, type]) => ({
			name,
			variant: VARIANT_MAP[variant],
			ects,
			type: TYPE_MAP[type],
		}));
	}

	return result;
};

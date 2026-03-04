import { Course, CourseGrading, CoursePlan, Semester } from "@/types/courses";

const GRADE_MAP: Record<string, number> = {
	"sehr gut": 1,
	gut: 2,
	befriedigend: 3,
	genügend: 4,
	"nicht genügend": 5,
};

const COURSE_LINE_REGEX =
	/^(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+(sehr gut|gut|befriedigend|genügend|nicht genügend)\s+([A-Z0-9]+)\s+([A-Z]{2,3})\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+\d+\s*$/i;

type IndexedCourse = {
	name: string;
	normalizedName: string;
	normalizedTitleOnly: string;
	course: Course<string>;
};

export type ParsedKusssRow = {
	date: string;
	title: string;
	cleanTitle: string;
	gradeLabel: string;
	grade?: number;
	type: string;
	semesterCode?: string;
	matchedCourseName?: string;
	plannedSemester?: number | "accredited";
};

export type ParsedKusssResult = {
	rows: ParsedKusssRow[];
	grades: CourseGrading[];
	planning: CoursePlan[];
};

export const looksLikeKusssGradeText = (text: string) => {
	const normalized = text.toLowerCase();
	return (
		normalized.includes("kusss") &&
		(normalized.includes("course assessments") ||
			normalized.includes("recognized assessments") ||
			normalized.includes("date\ttitle\tgrade"))
	);
};

const normalizeTitle = (value: string) => {
	const translated = value
		.toLowerCase()
		.replace(/algorithmen und datenstrukturen\s+1/g, "algorithms and data structures 1")
		.replace(/algorithmen und datenstrukturen\s+2/g, "algorithms and data structures 2")
		.replace(/&/g, " and ")
		.replace(/\biii\b/g, "3")
		.replace(/\bii\b/g, "2")
		.replace(/\bi\b/g, "1");

	return translated
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9 ]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

const extractSemesterCode = (title: string): string | undefined => {
	const match = title.match(/\(\d+\s*,\s*(\d{4}[WS])\)/i);
	return match?.[1]?.toUpperCase();
};

const cleanTitle = (title: string) =>
	title
		.replace(/\(\d+\s*,\s*\d{4}[WS]\)/gi, "")
		.replace(/\(recognized\)/gi, "")
		.replace(/\s+/g, " ")
		.trim();

const isRecognizedHeading = (line: string) => {
	const normalized = line.trim().toLowerCase();
	return (
		normalized === "recognized course certificates (ilas)" ||
		normalized === "recognized assessments" ||
		normalized === "recognized exams"
	);
};

const semesterSerial = (semester: Semester) => {
	if (semester.type === "WS") return semester.year * 2;
	return semester.year * 2 - 1;
};

const parseSemesterCode = (semesterCode: string): Semester | undefined => {
	const match = semesterCode.match(/^(\d{4})([WS])$/i);
	if (!match) return undefined;
	const year = Number(match[1]);
	const type = match[2].toUpperCase() === "W" ? "WS" : "SS";
	return { year, type };
};

const toPlannedSemester = (startSemester: Semester, semesterCode?: string) => {
	if (!semesterCode) return undefined;
	const parsed = parseSemesterCode(semesterCode);
	if (!parsed) return undefined;

	const index = semesterSerial(parsed) - semesterSerial(startSemester) + 1;
	if (index < 1) return undefined;
	return index;
};

const buildCourseIndex = (rawCourses: Course<string>[]) => {
	const indexed: IndexedCourse[] = [];
	const startsWithTypePrefix = (value: string) => /^(UE|VL|KV|SE|PR|VO|KO)\s+/i.test(value);
	for (const course of rawCourses) {
		indexed.push({
			name: course.name,
			normalizedName: normalizeTitle(course.name),
			normalizedTitleOnly: normalizeTitle(course.name.replace(/^[A-Z]{2,3}\s+/, "")),
			course,
		});
		for (const legacyName of course.legacyNames ?? []) {
			const fullLegacyName = startsWithTypePrefix(legacyName) ? legacyName : `${course.type} ${legacyName}`;
			indexed.push({
				name: fullLegacyName,
				normalizedName: normalizeTitle(fullLegacyName),
				normalizedTitleOnly: normalizeTitle(fullLegacyName.replace(/^[A-Z]{2,3}\s+/, "")),
				course,
			});
		}
	}
	return indexed;
};

const resolveCourse = (indexedCourses: IndexedCourse[], type: string, title: string) => {
	const normalizedType = type === "VO" ? "VL" : type;
	const normalized = normalizeTitle(`${normalizedType} ${title}`);
	const exact = indexedCourses.find((c) => c.normalizedName === normalized);
	if (exact) return exact.course;

	const withoutSuffix = title.split(" - ")[0]?.trim();
	if (withoutSuffix) {
		const normalizedWithoutSuffix = normalizeTitle(`${normalizedType} ${withoutSuffix}`);
		const fallback = indexedCourses.find((c) => c.normalizedName === normalizedWithoutSuffix);
		if (fallback) return fallback.course;
	}

	const normalizedTitleOnly = normalizeTitle(title);
	const titleMatches = indexedCourses.filter((c) => c.normalizedTitleOnly === normalizedTitleOnly);
	if (titleMatches.length > 0) {
		const preferred = titleMatches.find((candidate) => candidate.course.type === "VL");
		return (preferred ?? titleMatches[0]).course;
	}

	return undefined;
};

export const parseKusssGradeText = (
	text: string,
	rawCourses: Course<string>[],
	startingSemester: Semester,
): ParsedKusssResult => {
	const rows: ParsedKusssRow[] = [];
	const indexedCourses = buildCourseIndex(rawCourses);

	const gradeMap = new Map<string, number>();
	const planningMap = new Map<string, number | "accredited">();
	let inRecognizedSection = false;

	for (const rawLine of text.split("\n")) {
		const line = rawLine.trim();
		if (!line) continue;

		if (isRecognizedHeading(line)) {
			inRecognizedSection = true;
			continue;
		}

		if (/^(course assessments|interim course assessments|assessments of the last|exams)\b/i.test(line)) {
			inRecognizedSection = false;
		}

		const match = line.match(COURSE_LINE_REGEX);
		if (!match) continue;

		const [, date, title, gradeLabelRaw, , type] = match;
		const gradeLabel = gradeLabelRaw.toLowerCase();
		const grade = GRADE_MAP[gradeLabel];
		const semesterCode = extractSemesterCode(title);
		const normalizedTitle = cleanTitle(title);
		const matchedCourse = resolveCourse(indexedCourses, type, normalizedTitle);
		const recognizedFromTitle = /\(recognized\)/i.test(title);
		const isRecognized = inRecognizedSection || recognizedFromTitle;
		const plannedSemester = isRecognized ? "accredited" : toPlannedSemester(startingSemester, semesterCode);

		rows.push({
			date,
			title,
			cleanTitle: normalizedTitle,
			gradeLabel,
			grade,
			type,
			semesterCode,
			matchedCourseName: matchedCourse?.name,
			plannedSemester,
		});

		if (matchedCourse && grade !== undefined && !gradeMap.has(matchedCourse.name)) {
			gradeMap.set(matchedCourse.name, grade);
		}
		if (matchedCourse && plannedSemester !== undefined) {
			const existing = planningMap.get(matchedCourse.name);
			if (existing === undefined || plannedSemester === "accredited") {
				planningMap.set(matchedCourse.name, plannedSemester);
			}
		}
	}

	const grades: CourseGrading[] = Array.from(gradeMap.entries()).map(([name, grade]) => ({ name, grade }));
	const planning: CoursePlan[] = Array.from(planningMap.entries()).map(([name, plannedSemester]) => ({ name, plannedSemester }));

	return { rows, grades, planning };
};

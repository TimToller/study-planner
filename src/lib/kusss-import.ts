import { Course, CourseGrading, CoursePlan, CourseType, CustomCourse, Semester } from "@/types/courses";

const GRADE_MAP: Record<string, number> = {
  excellent: 1,
  good: 2,
  satisfactory: 3,
  sufficient: 4,
  insufficient: 5,
};

/**
 * KUSSS uses English API course-type codes, while our course data
 * uses the usual JKU/German abbreviations.
 */
const COURSE_TYPE_MAP: Record<string, string[]> = {
  LE: ["VL", "VO"],
  TU: ["UE"],
  TO: ["KO"],
  CC: ["KV"],
  SE: ["SE"],
  PC: ["PR"],
};

const toLocalCourseType = (apiType: string): CourseType => {
  const localType = COURSE_TYPE_MAP[apiType.toUpperCase()]?.[0];

  return (localType as CourseType | undefined) ?? "KV";
};

type KusssCourse = {
  courseClass?: {
    courseType?: string | null;
    courseTypeLongForm?: string | null;
    ects?: number | null;
    hoursPerWeek?: number | null;
  } | null;

  courseClassVariant?: {
    shortForm?: string | null;
    title?: string | null;
  } | null;

  courseNr?: string | null;
  subtitle?: string | null;
  termId?: string | null;
};

type KusssCertificate = {
  type?: string | null;
  certId?: number | null;
  examDate?: string | null;
  gradeDescription?: string | null;
  positive?: boolean | null;
  ects?: number | null;
  hoursPerWeek?: number | null;
  course?: KusssCourse | null;
};

export type KusssGradeResponse = {
  certificates: Record<string, KusssCertificate[]>;
};

type IndexedCourse = {
  normalizedName: string;
  normalizedTitleOnly: string;
  course: Course<string>;
};

export type ParsedKusssRow = {
  id: number;
  date: string;
  title: string;
  cleanTitle: string;
  gradeLabel: string;
  grade?: number;
  type: string;
  localType: CourseType;
  ects: number;
  semesterCode?: string;
  matchedCourseName?: string;
  plannedSemester?: number | "accredited";
};

export type ParsedKusssResult = {
  rows: ParsedKusssRow[];
  grades: CourseGrading[];
  planning: CoursePlan[];
  customCourses: CustomCourse[];
  firstGradedSemester?: Semester;
};

export const getDefaultUnmatchedVariant = (title: string): CustomCourse["variant"] =>
  /\bspecial topics\b/i.test(title) ? "Area of Specialization" : "Free Elective";

const normalizeTitle = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const semesterSerial = (semester: Semester) => (semester.type === "WS" ? semester.year * 2 : semester.year * 2 - 1);

const parseSemesterCode = (semesterCode: string): Semester | undefined => {
  const match = semesterCode.match(/^(\d{4})([WS])$/i);

  if (!match) return undefined;

  return {
    year: Number(match[1]),
    type: match[2].toUpperCase() === "W" ? "WS" : "SS",
  };
};

const toPlannedSemester = (startingSemester: Semester, semesterCode?: string): number | "accredited" | undefined => {
  if (!semesterCode) return undefined;

  const semester = parseSemesterCode(semesterCode);

  if (!semester) return undefined;

  const index = semesterSerial(semester) - semesterSerial(startingSemester) + 1;

  return index >= 1 ? index : "accredited";
};

const buildCourseIndex = (rawCourses: Course<string>[]): IndexedCourse[] => {
  const indexed: IndexedCourse[] = [];

  const addCourse = (course: Course<string>, name: string) => {
    indexed.push({
      normalizedName: normalizeTitle(name),
      normalizedTitleOnly: normalizeTitle(name.replace(/^[A-Z]{2,3}\s+/, "")),
      course,
    });
  };

  for (const course of rawCourses) {
    addCourse(course, course.name);

    for (const legacyName of course.legacyNames ?? []) {
      const hasTypePrefix = /^[A-Z]{2,3}\s+/i.test(legacyName);

      addCourse(course, hasTypePrefix ? legacyName : `${course.type} ${legacyName}`);
    }
  }

  return indexed;
};

const resolveCourse = (indexedCourses: IndexedCourse[], apiType: string, title: string) => {
  const normalizedApiType = apiType.toUpperCase();

  const localTypes = COURSE_TYPE_MAP[normalizedApiType] ?? [normalizedApiType];

  const baseTitle = title.split(" - ")[0]?.trim() || title;

  const titleCandidates = [...new Set([title, baseTitle])];

  /**
   * First try title + course type.
   */
  for (const candidateTitle of titleCandidates) {
    for (const type of localTypes) {
      const normalized = normalizeTitle(`${type} ${candidateTitle}`);

      const match = indexedCourses.find((candidate) => candidate.normalizedName === normalized);

      if (match) {
        return match.course;
      }
    }
  }

  /**
   * Fall back to title-only matching.
   *
   * This also handles KUSSS types for which we do not have
   * an explicit local mapping.
   */
  for (const candidateTitle of titleCandidates) {
    const normalized = normalizeTitle(candidateTitle);

    const matches = indexedCourses.filter((candidate) => candidate.normalizedTitleOnly === normalized);

    if (matches.length === 0) {
      continue;
    }

    /**
     * If several courses share the same title, prefer one whose
     * type corresponds to the KUSSS type.
     */
    const typeMatch = matches.find((candidate) => localTypes.includes(candidate.course.type.toUpperCase()));

    if (typeMatch) {
      return typeMatch.course;
    }

    if (matches.length === 1) {
      return matches[0].course;
    }

    return undefined;
  }

  return undefined;
};

export const parseKusssGrades = (
  data: KusssGradeResponse,
  rawCourses: Course<string>[],
  startingSemester: Semester,
  unmatchedVariants: Record<number, CustomCourse["variant"]> = {},
): ParsedKusssResult => {
  const rows: ParsedKusssRow[] = [];

  const gradeMap = new Map<string, number>();

  const planningMap = new Map<string, number | "accredited">();

  const customCoursesMap = new Map<string, CustomCourse>();
  let firstGradedSemester: Semester | undefined;

  const indexedCourses = buildCourseIndex(rawCourses);

  /**
   * Flatten all semester groups.
   *
   * Newest first means that if the same course occurs multiple
   * times, the newest grade is imported.
   */
  const certificates = Object.entries(data.certificates)
    .flatMap(([bucketSemester, certificates]) =>
      certificates.map((certificate) => ({
        bucketSemester,
        certificate,
      })),
    )
    .sort((a, b) => (b.certificate.examDate ?? "").localeCompare(a.certificate.examDate ?? ""));

  for (const { bucketSemester, certificate } of certificates) {
    if (certificate.type !== "COURSE_CERTIFICATE" && certificate.type !== "RECOGNIZED_COURSE_CERTIFICATE") {
      continue;
    }

    const course = certificate.course;

    const baseTitle = course?.courseClassVariant?.title?.trim();

    if (!baseTitle) {
      continue;
    }

    const subtitle = course?.subtitle?.trim();

    const title = subtitle ? `${baseTitle} - ${subtitle}` : baseTitle;

    const apiType = course?.courseClass?.courseType?.trim() ?? "";

    const gradeLabel = certificate.gradeDescription?.trim() ?? "";

    const grade = GRADE_MAP[gradeLabel.toLowerCase()];

    const matchedCourse = resolveCourse(indexedCourses, apiType, title);

    const isRecognized = certificate.type === "RECOGNIZED_COURSE_CERTIFICATE";

    /**
     * course.termId describes the actual semester the course
     * belongs to.
     *
     * The outer KUSSS certificate bucket can occasionally differ,
     * so it is only used as a fallback.
     */
    const semesterCode = course?.termId?.trim() || bucketSemester || undefined;
    const courseSemester = semesterCode ? parseSemesterCode(semesterCode) : undefined;

    if (
      grade !== undefined &&
      courseSemester &&
      (!firstGradedSemester || semesterSerial(courseSemester) < semesterSerial(firstGradedSemester))
    ) {
      firstGradedSemester = courseSemester;
    }

    const plannedSemester = isRecognized ? "accredited" : toPlannedSemester(startingSemester, semesterCode);

    rows.push({
      id: rows.length,
      date: certificate.examDate ?? "",
      title,
      cleanTitle: title,
      gradeLabel,
      grade,
      type: apiType,
      localType: toLocalCourseType(apiType),
      ects: certificate.ects ?? course?.courseClass?.ects ?? 0,
      semesterCode,
      matchedCourseName: matchedCourse?.name,
      plannedSemester,
    });

    if (!matchedCourse) {
      const variant = unmatchedVariants[rows.length - 1] ?? getDefaultUnmatchedVariant(title);
      const customCourse: CustomCourse = {
        name: title,
        variant,
        ects: certificate.ects ?? course?.courseClass?.ects ?? 0,
        type: toLocalCourseType(apiType),
      };
      const customCourseKey = `${customCourse.type} ${customCourse.name}`;

      customCoursesMap.set(customCourseKey, customCourse);

      const importedCourseName = customCourseKey;

      if (grade !== undefined && !gradeMap.has(importedCourseName)) {
        gradeMap.set(importedCourseName, grade);
      }

      if (plannedSemester !== undefined) {
        const existing = planningMap.get(importedCourseName);

        if (existing === undefined || plannedSemester === "accredited") {
          planningMap.set(importedCourseName, plannedSemester);
        }
      }
    }

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

  const grades: CourseGrading[] = Array.from(gradeMap, ([name, grade]) => ({
    name,
    grade,
  }));

  const planning: CoursePlan[] = Array.from(planningMap, ([name, plannedSemester]) => ({
    name,
    plannedSemester,
  }));

  return {
    rows,
    grades,
    planning,
    customCourses: Array.from(customCoursesMap.values()),
    firstGradedSemester,
  };
};

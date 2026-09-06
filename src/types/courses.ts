export const SemesterType = ["WS", "SS"] as const;
export type SemesterType = (typeof SemesterType)[number];

export const TYPE_MAP = ["UE", "VL", "PR", "SE", "KV"] as const;
export type CourseType = (typeof TYPE_MAP)[number];
export type SteopRole = "core" | "additional";

export interface CourseSubject<Catalog extends string = string, Key extends string = string, Name extends string = string> {
  readonly catalog: Catalog;
  readonly key: Key;
  readonly name: Name;
}

type CourseSubjectMap<Catalog extends string, Names extends Record<string, string>> = {
  readonly [Key in keyof Names]: CourseSubject<Catalog, Extract<Key, string>, Names[Key]>;
};

export const defineCourseSubjects = <const Catalog extends string, const Names extends Record<string, string>>(
  catalog: Catalog,
  names: Names,
): CourseSubjectMap<Catalog, Names> =>
  Object.fromEntries(Object.entries(names).map(([key, name]) => [key, { catalog, key, name }])) as CourseSubjectMap<Catalog, Names>;

export interface Semester {
  year: number;
  type: SemesterType;
}
export interface CourseDefinition<Name extends string = string> {
  subject: CourseSubject<string, string, Name>;
  ects: number;
  available?: SemesterType;
  recommendedSemester: number | null;
  legacyNames?: string[];
  type: CourseType;
  steop?: SteopRole;
}

export interface Course<Name extends string = string> extends CourseDefinition<Name> {
  id: string;
  /** The user-facing label, including the course type (for example, `VL Logic`). */
  name: string;
  group: string;
  plannedSemester?: number | "accredited";
  grade?: number;
  notUsedForDistinction?: boolean;
}

export interface CourseGroup<Name extends string = string> {
  name: string;
  courses: readonly CourseDefinition<Name>[];
}

export const defineCourseGroups = <const Groups extends readonly CourseGroup<string>[]>(groups: Groups) => groups;

export type CourseSubjectOf<Groups extends readonly CourseGroup<string>[]> = Groups[number]["courses"][number]["subject"];

export interface CourseGrading {
  name: string;
  grade: number;
}

export interface CoursePlan {
  name: string;
  plannedSemester?: number | "accredited";
}

export interface CustomCourse {
  name: string;
  variant: "Free Elective" | "Area of Specialization";
  ects: number;
  type: CourseType;
}

import { roundGrade, weightedAverage } from "@/lib/utils";

export type CourseImpactLevel = "low" | "medium" | "high";

export interface CourseImpactCourse {
  name: string;
  ects: number;
  /** A recorded grade. Omit this for a course that is still unfinished. */
  grade?: number;
}

export interface CourseImpact {
  level: CourseImpactLevel;
  structuralImpact: number;
  pivotal: boolean;
}

export interface CourseImpactEntry extends CourseImpact {
  courseName: string;
}

const impactLevel = (structuralImpact: number, pivotal: boolean): CourseImpactLevel => {
  if (pivotal || structuralImpact >= 0.5) return "high";
  if (structuralImpact >= 0.2) return "medium";
  return "low";
};

const isValidECTS = (ects: number) => Number.isFinite(ects) && ects > 0;

/**
 * Calculates an unfinished course's absolute effect on its group's final grade.
 * Recorded grades stay fixed; every other unfinished course is assumed to be a 1.
 */
export function calculateCourseImpact(courseName: string, courses: readonly CourseImpactCourse[]): CourseImpact {
  const course = courses.find((candidate) => candidate.name === courseName);
  const totalGroupECTS = courses.reduce((total, candidate) => total + candidate.ects, 0);

  if (!course || !isValidECTS(course.ects) || !Number.isFinite(totalGroupECTS) || totalGroupECTS <= 0) {
    return { level: "low", structuralImpact: 0, pivotal: false };
  }

  const structuralImpact = course.ects / totalGroupECTS;
  const roundedGradeWith = (courseGrade: number) => {
    const average = weightedAverage(
      courses.map((candidate) => ({
        number: candidate.name === courseName ? courseGrade : (candidate.grade ?? 1),
        weight: candidate.ects,
      })),
    );

    return roundGrade(average);
  };

  const bestRoundedGrade = roundedGradeWith(1);
  const pivotal = roundedGradeWith(2) > bestRoundedGrade;

  return {
    level: impactLevel(structuralImpact, pivotal),
    structuralImpact,
    pivotal,
  };
}

/** Returns impact data for unfinished courses only; recorded courses never receive an impact badge. */
export function calculateUngradedCourseImpacts(courses: readonly CourseImpactCourse[]): CourseImpactEntry[] {
  return courses
    .filter((course) => course.grade === undefined)
    .map((course) => ({ courseName: course.name, ...calculateCourseImpact(course.name, courses) }))
    .sort((a, b) => {
      const impactRank = { high: 3, medium: 2, low: 1 };
      return (
        impactRank[b.level] - impactRank[a.level] ||
        b.structuralImpact - a.structuralImpact ||
        a.courseName.localeCompare(b.courseName)
      );
    });
}

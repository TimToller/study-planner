import { Course, CoursePlan } from "@/types/courses";

import { getCourseByName } from "@/lib/course";
import { AREA_OF_SPECIALIZATION_REQUIRED_ECTS, FREE_ELECTIVE_REQUIRED_ECTS } from "@/lib/requirements";
import { getSemester } from "@/lib/semester";
import { evaluateSteop, STEOP_RULES } from "@/lib/steop";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { gradesAtom } from "./grades";
import { dependenciesAtom, ignoreGradedAtom, programAtom, rawCoursesAtom, startingSemesterAtom } from "./settings";

export const planningAtom = atomWithStorage<CoursePlan[]>("semester-plans", []);

export const normalizePlannedSemester = (semester: unknown): CoursePlan["plannedSemester"] => {
  if (semester === "accredited") return semester;
  if (typeof semester === "number" && Number.isInteger(semester) && semester > 0) return semester;
  return undefined;
};

export const setPlanningAtom = atom(null, (get, set, course: CoursePlan) => {
  const current = get(planningAtom);
  const index = current.findIndex((p) => p.name === course.name);
  const plannedSemester = normalizePlannedSemester(course.plannedSemester);

  if (plannedSemester === undefined) {
    if (index !== -1) {
      const updated = [...current];
      updated.splice(index, 1);
      set(planningAtom, updated);
    }
    return;
  }
  if (index === -1) {
    set(planningAtom, [...current, { ...course, plannedSemester }]);
  } else {
    const updated = [...current];
    updated[index] = { ...course, plannedSemester };
    set(planningAtom, updated);
  }
});

export const personalCoursesAtom = atom((get) => {
  const grades = get(gradesAtom);
  const planning = get(planningAtom);
  const plannedSemesters = new Map(planning.map((plan) => [plan.name, normalizePlannedSemester(plan.plannedSemester)]));

  return get(rawCoursesAtom).map((c) => ({
    ...c,
    grade: grades.find((p) => p.name === c.name)?.grade,
    plannedSemester: plannedSemesters.get(c.name),
  }));
});

export interface PlanningInfo {
  message: string;
  courses?: Course<string>[];
}
export const planningInfoAtom = atom((get) => {
  const planning = get(planningAtom).flatMap((plan) => {
    const plannedSemester = normalizePlannedSemester(plan.plannedSemester);
    return plannedSemester === undefined ? [] : [{ ...plan, plannedSemester }];
  });
  const startingSemester = get(startingSemesterAtom);
  const ignoreGraded = get(ignoreGradedAtom);
  const grades = get(gradesAtom);
  const program = get(programAtom);
  const rawCourses = get(rawCoursesAtom);

  const errors: PlanningInfo[] = [];
  const warnings: PlanningInfo[] = [];
  const recommendations: PlanningInfo[] = [];

  const semesterECTSMap = new Map<string, number>();

  let freeElectiveECTS = 0;
  let aosECTS = 0;

  planning.forEach((course) => {
    const courseData = getCourseByName(get(rawCoursesAtom), course.name);
    if (!courseData) {
      console.log(course.name);

      return;
    }

    if (course.plannedSemester === undefined || course.plannedSemester === "accredited") {
      return;
    }

    if (courseData?.group === "Free Elective") {
      freeElectiveECTS += courseData.ects;
    } else if (courseData?.group === "Area of Specialization") {
      aosECTS += courseData.ects;
    }

    if (ignoreGraded && grades.find((g) => g.name === course.name)?.grade !== undefined) {
      return;
    }

    const semesterECTS = semesterECTSMap.get(course.plannedSemester?.toString()) ?? 0;
    semesterECTSMap.set(course.plannedSemester?.toString(), semesterECTS + courseData.ects);

    //check WS or SS
    if (courseData.available !== undefined) {
      const planned = getSemester(course.plannedSemester!, startingSemester);
      if (planned.type !== courseData.available) {
        errors.push({
          message: `Course **${course.name}** is only available in **${courseData.available}**`,
          courses: [courseData],
        });
      }
    }

    //check VL and UE in same semester
    if (courseData.type === "UE") {
      const courseVL = planning.find((plan) => {
        const plannedCourse = getCourseByName(rawCourses, plan.name);
        return (
          plannedCourse?.subject === courseData.subject &&
          plan.plannedSemester !== "accredited" &&
          plannedCourse.type === "VL"
        );
      });
      const courseVLData = courseVL ? getCourseByName(rawCourses, courseVL.name) : undefined;

      if (
        courseVL &&
        courseVLData &&
        course.plannedSemester !== courseVL.plannedSemester &&
        courseData.recommendedSemester === courseVLData.recommendedSemester
      ) {
        warnings.push({
          message: `Course **${course.name}** should ideally be taken in the same semester as the lecture`,
          courses: rawCourses.filter((candidate) => candidate.subject === courseData.subject),
        });
      }
    }

    //check dependencies
    const courseDependencies =
      get(dependenciesAtom).find((dependency) => dependency.course === courseData.subject)?.dependencies ?? [];
    for (const dependency of courseDependencies) {
      const requiredCourses = rawCourses.filter((candidate) => candidate.subject === dependency.course);
      const missingCourses = requiredCourses.filter(
        (c) =>
          !planning.some(
            (p) =>
              p.name === c.name &&
              (p.plannedSemester === "accredited" || p.plannedSemester! <= (course.plannedSemester as number)!),
          ),
      );
      if (missingCourses.length > 0) {
        switch (dependency.type) {
          case "hard":
            errors.push({
              message: `Course **${course.name}** strongly depends on **${missingCourses.map((c) => c.name).join(", ")}**`,
              courses: [courseData],
            });
            break;
          case "soft":
            warnings.push({
              message: `Course **${course.name}** requires some of the knowledge of **${missingCourses.map((c) => c.name).join(", ")}**`,
              courses: [courseData],
            });
            break;
          case "recommended":
            recommendations.push({
              message: `Before doing **${course.name}**, you could do **${missingCourses.map((c) => c.name).join(", ")}**`,
              courses: [courseData],
            });
            break;
        }
      }
    }
  });

  semesterECTSMap.forEach((ects, semester) => {
    if (ects > 40) {
      recommendations.push({
        message: `You are planning **${ects} ECTS** in semester **${semester}**. I know you are ambitious, but maybe consider spreading it out a bit more ;)`,
      });
    }
  });

  if (freeElectiveECTS < FREE_ELECTIVE_REQUIRED_ECTS) {
    recommendations.push({
      message: `You have only **${freeElectiveECTS} ECTS** of free electives planned. You should still have to do **${
        FREE_ELECTIVE_REQUIRED_ECTS - freeElectiveECTS
      } ECTS** of free electives.`,
    });
  }

  if (aosECTS < AREA_OF_SPECIALIZATION_REQUIRED_ECTS) {
    recommendations.push({
      message: `You have only **${aosECTS} ECTS** of area of specialization planned. You should still have to do **${
        AREA_OF_SPECIALIZATION_REQUIRED_ECTS - aosECTS
      } ECTS** of area of specialization.`,
    });
  }

  const steopRule = STEOP_RULES[program];
  const steop = evaluateSteop(program, rawCourses, planning, grades);

  if (steop.completionSemester === null) {
    const missingECTS = Math.max(0, steopRule.requiredECTS - steop.projectedECTS);
    recommendations.push({
      message: `Your plan does not complete **StEOP**. Add at least **${missingECTS} more ECTS** from the program's StEOP core-course pool.`,
      courses: steop.unplannedCoreCourses,
    });
  }

  if (steop.restrictedCourses.length > 0) {
    errors.push({
      message: `Before completing **StEOP**, you may only complete its core courses and the designated additional-course pool. Move **${steop.restrictedCourses
        .map((course) => course.name)
        .join(", ")}** until after StEOP.`,
      courses: steop.restrictedCourses,
    });
  }

  if (steop.additionalECTSBeforeCompletion > steopRule.maxAdditionalECTS) {
    errors.push({
      message: `You planned **${steop.additionalECTSBeforeCompletion} additional ECTS** before completing StEOP; the ${program} limit is **${steopRule.maxAdditionalECTS} ECTS**.`,
      courses: steop.additionalCoursesBeforeCompletion,
    });
  }

  return { errors, warnings, recommendations };
});

import { describe, expect, it } from "vitest";

import { calculateCourseImpact, calculateUngradedCourseImpacts, type CourseImpactCourse } from "./course-impact";
import { roundGrade, weightedAverage } from "./utils";

const impactFor = (courses: CourseImpactCourse[], courseName: string) => calculateCourseImpact(courseName, courses);

describe("calculateCourseImpact", () => {
  describe("structural impact", () => {
    it("classifies a 9/9 ECTS Bachelor Thesis as high impact", () => {
      const courses = [{ name: "Bachelor Thesis", ects: 9 }] satisfies CourseImpactCourse[];

      const impact = impactFor(courses, "Bachelor Thesis");

      expect(impact.level).toBe("high");
      expect(impact.structuralImpact).toBe(1);
    });

    it.each([
      {
        label: "exactly 50%",
        targetEcts: 50,
        otherEcts: 50,
        expectedLevel: "high",
        expectedShare: 0.5,
      },
      {
        label: "just below 50%",
        targetEcts: 49,
        otherEcts: 51,
        expectedLevel: "medium",
        expectedShare: 0.49,
      },
      {
        label: "exactly 20%",
        targetEcts: 20,
        otherEcts: 80,
        expectedLevel: "medium",
        expectedShare: 0.2,
      },
      {
        label: "just below 20%",
        targetEcts: 19,
        otherEcts: 81,
        expectedLevel: "low",
        expectedShare: 0.19,
      },
    ] as const)(
      "classifies $label structural share correctly",
      ({ targetEcts, otherEcts, expectedLevel, expectedShare }) => {
        const courses = [
          { name: "Target", ects: targetEcts },
          { name: "Recorded", ects: otherEcts, grade: 1 },
        ] satisfies CourseImpactCourse[];

        const impact = impactFor(courses, "Target");

        expect(impact.level).toBe(expectedLevel);
        expect(impact.structuralImpact).toBeCloseTo(expectedShare);
        expect(impact.pivotal).toBe(false);
      },
    );

    it("classifies a typical medium-weight course as medium", () => {
      const courses = [
        { name: "Course", ects: 6 },
        { name: "Recorded", ects: 14, grade: 1 },
      ] satisfies CourseImpactCourse[];

      const impact = impactFor(courses, "Course");

      expect(impact.level).toBe("medium");
      expect(impact.structuralImpact).toBeCloseTo(0.3);
      expect(impact.pivotal).toBe(false);
    });

    it("leaves a small 1/30 ECTS course low when it is not pivotal", () => {
      const courses = [
        { name: "Large unfinished course", ects: 29 },
        { name: "Small course", ects: 1 },
      ] satisfies CourseImpactCourse[];

      const impact = impactFor(courses, "Small course");

      expect(impact.level).toBe("low");
      expect(impact.structuralImpact).toBeCloseTo(1 / 30);
      expect(impact.pivotal).toBe(false);
    });
  });

  describe("pivotal impact", () => {
    it("makes a small course high when 1 -> 2 loses the better rounded group grade", () => {
      const courses = [
        { name: "Recorded", ects: 15, grade: 2 },
        { name: "Other unfinished", ects: 14 },
        { name: "Small pivotal course", ects: 1 },
      ] satisfies CourseImpactCourse[];

      // Best case:
      // (15 * 2 + 14 * 1 + 1 * 1) / 30 = 1.50
      // Application rounds 1.50 down to group grade 1.
      //
      // Target = 2:
      // (15 * 2 + 14 * 1 + 1 * 2) / 30 = 1.533...
      // => group grade 2.

      const impact = impactFor(courses, "Small pivotal course");

      expect(impact.level).toBe("high");
      expect(impact.structuralImpact).toBeCloseTo(1 / 30);
      expect(impact.pivotal).toBe(true);
    });

    it("marks both unfinished courses high when both must be 1 to preserve the better group grade", () => {
      const courses = [
        { name: "Recorded", ects: 10, grade: 2 },
        { name: "A", ects: 5 },
        { name: "B", ects: 5 },
      ] satisfies CourseImpactCourse[];

      // A=1, B=1 => average 1.50 => rounded group grade 1
      // A=2, B=1 => average 1.75 => rounded group grade 2
      // A=1, B=2 => average 1.75 => rounded group grade 2

      expect(impactFor(courses, "A")).toMatchObject({
        level: "high",
        pivotal: true,
      });

      expect(impactFor(courses, "B")).toMatchObject({
        level: "high",
        pivotal: true,
      });
    });

    it("evaluates courses independently when two unfinished courses remain", () => {
      const courses = [
        { name: "Recorded grade 1", ects: 44, grade: 1 },
        { name: "Recorded grade 2", ects: 45, grade: 2 },
        { name: "Large open", ects: 10 },
        { name: "Small open", ects: 1 },
      ] satisfies CourseImpactCourse[];

      // Best case:
      // 44 + 90 + 10 + 1 = 145 / 100 = 1.45 => group 1
      //
      // Large open = 2:
      // 155 / 100 = 1.55 => group 2
      //
      // Small open = 2:
      // 146 / 100 = 1.46 => group 1

      expect(impactFor(courses, "Large open")).toMatchObject({
        level: "high",
        pivotal: true,
      });

      expect(impactFor(courses, "Small open")).toMatchObject({
        level: "low",
        pivotal: false,
      });
    });

    it("handles three unfinished courses and identifies only the pivotal one", () => {
      const courses = [
        { name: "Recorded grade 1", ects: 43, grade: 1 },
        { name: "Recorded grade 2", ects: 45, grade: 2 },
        { name: "Pivotal", ects: 10 },
        { name: "Small A", ects: 1 },
        { name: "Small B", ects: 1 },
      ] satisfies CourseImpactCourse[];

      // All unfinished = 1:
      // 43 + 90 + 10 + 1 + 1 = 145 / 100 = 1.45
      //
      // Pivotal = 2:
      // 155 / 100 = 1.55 => group worsens
      //
      // Small A/B = 2:
      // 146 / 100 = 1.46 => same group grade

      expect(impactFor(courses, "Pivotal")).toMatchObject({
        level: "high",
        pivotal: true,
      });

      expect(impactFor(courses, "Small A")).toMatchObject({
        level: "low",
        pivotal: false,
      });

      expect(impactFor(courses, "Small B")).toMatchObject({
        level: "low",
        pivotal: false,
      });
    });

    it("works at thresholds other than group grade 1 -> 2", () => {
      const courses = [
        { name: "Recorded grade 3", ects: 16, grade: 3 },
        { name: "Recorded grade 2", ects: 13, grade: 2 },
        { name: "Small pivotal course", ects: 1 },
      ] satisfies CourseImpactCourse[];

      // Course = 1:
      // (16*3 + 13*2 + 1) / 30 = 75/30 = 2.50
      // => rounded group grade 2
      //
      // Course = 2:
      // 76/30 = 2.533...
      // => rounded group grade 3

      const impact = impactFor(courses, "Small pivotal course");

      expect(impact.level).toBe("high");
      expect(impact.pivotal).toBe(true);
    });

    it("does not make the final remaining course high just because it is the last one", () => {
      const courses = [
        { name: "Recorded", ects: 29, grade: 1 },
        { name: "Final course", ects: 1 },
      ] satisfies CourseImpactCourse[];

      const impact = impactFor(courses, "Final course");

      expect(impact.level).toBe("low");
      expect(impact.structuralImpact).toBeCloseTo(1 / 30);
      expect(impact.pivotal).toBe(false);
    });

    it("does not call a small course pivotal when 1 -> 2 preserves the same group grade", () => {
      const courses = [
        { name: "Recorded grade 1", ects: 7, grade: 1 },
        { name: "Recorded grade 2", ects: 2, grade: 2 },
        { name: "Open", ects: 1 },
      ] satisfies CourseImpactCourse[];

      // Open = 1 => average 1.2 => group 1
      // Open = 2 => average 1.3 => group 1
      //
      // Even though a sufficiently bad grade such as 5 would eventually
      // worsen the group result, this course does NOT "have to be a 1".
      //
      // Pivotal means the 1 -> 2 step itself loses the better group grade.

      const impact = impactFor(courses, "Open");

      expect(impact.level).toBe("low");
      expect(impact.pivotal).toBe(false);
    });
  });

  describe("independence from current group performance", () => {
    it("does not inflate impact merely because the current group average is worse", () => {
      const strongGroup = [
        { name: "Recorded", ects: 29, grade: 1 },
        { name: "Open", ects: 1 },
      ] satisfies CourseImpactCourse[];

      const weakerGroup = [
        { name: "Recorded", ects: 29, grade: 2 },
        { name: "Open", ects: 1 },
      ] satisfies CourseImpactCourse[];

      const strongImpact = impactFor(strongGroup, "Open");
      const weakerImpact = impactFor(weakerGroup, "Open");

      expect(strongImpact).toEqual(weakerImpact);
      expect(strongImpact).toMatchObject({
        level: "low",
        pivotal: false,
      });
    });
  });

  describe("invalid ECTS", () => {
    it.each([
      {
        label: "zero",
        courses: [{ name: "Target", ects: 0 }],
      },
      {
        label: "NaN",
        courses: [{ name: "Target", ects: Number.NaN }],
      },
      {
        label: "negative",
        courses: [{ name: "Target", ects: -1 }],
      },
    ])("handles $label total ECTS safely", ({ courses }) => {
      const impact = impactFor(courses satisfies CourseImpactCourse[], "Target");

      expect(impact).toEqual({
        level: "low",
        structuralImpact: 0,
        pivotal: false,
      });
    });
  });
});

describe("calculateUngradedCourseImpacts", () => {
  it("does not produce impact entries for recorded courses", () => {
    const courses = [
      { name: "Recorded", ects: 5, grade: 1 },
      { name: "Open", ects: 5 },
    ] satisfies CourseImpactCourse[];

    const impacts = calculateUngradedCourseImpacts(courses);

    expect(impacts.map((impact) => impact.courseName)).toEqual(["Open"]);
  });

  it("returns no impact entries when all courses are recorded", () => {
    const courses = [
      { name: "A", ects: 5, grade: 1 },
      { name: "B", ects: 5, grade: 2 },
    ] satisfies CourseImpactCourse[];

    expect(calculateUngradedCourseImpacts(courses)).toEqual([]);
  });

  it("orders unfinished courses by impact level, then structural share, then name", () => {
    const courses = [
      { name: "Recorded", ects: 10, grade: 1 },

      // 50 / 100 => High
      { name: "High", ects: 50 },

      // 20 / 100 => Medium
      { name: "Medium", ects: 20 },

      // Both 10 / 100 => Low; alphabetical fallback decides order.
      { name: "Low B", ects: 10 },
      { name: "Low A", ects: 10 },
    ] satisfies CourseImpactCourse[];

    const impacts = calculateUngradedCourseImpacts(courses);

    expect(impacts.map((impact) => impact.courseName)).toEqual(["High", "Medium", "Low A", "Low B"]);

    expect(impacts.map((impact) => impact.level)).toEqual(["high", "medium", "low", "low"]);
  });
});

describe("course impact integration with group-grade calculation", () => {
  it("uses the application's weighted-average and half-down rounding behavior", () => {
    const courses = [
      { name: "Recorded", ects: 15, grade: 2 },
      { name: "Other unfinished", ects: 14 },
      { name: "Threshold course", ects: 1 },
    ] satisfies CourseImpactCourse[];

    const averageAtOne = weightedAverage([
      { number: 2, weight: 15 },
      { number: 1, weight: 14 },
      { number: 1, weight: 1 },
    ]);

    const averageAtTwo = weightedAverage([
      { number: 2, weight: 15 },
      { number: 1, weight: 14 },
      { number: 2, weight: 1 },
    ]);

    expect(averageAtOne).toBe(1.5);
    expect(roundGrade(averageAtOne)).toBe(1);

    expect(averageAtTwo).toBeCloseTo(46 / 30);
    expect(roundGrade(averageAtTwo)).toBe(2);

    const impact = impactFor(courses, "Threshold course");

    expect(impact).toMatchObject({
      level: "high",
      pivotal: true,
    });
  });
});

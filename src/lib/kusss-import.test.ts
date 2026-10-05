import { describe, expect, it } from "vitest";
import { rawCourses } from "@/data/ai/courses";
import { KusssGradeResponse, parseKusssGrades } from "./kusss-import";

const parseCertificate = (title: string, type: string, gradeDescription: string, recognized = false) => {
  const data: KusssGradeResponse = {
    certificates: {
      "2024W": [
        {
          type: recognized ? "RECOGNIZED_COURSE_CERTIFICATE" : "COURSE_CERTIFICATE",
          examDate: "2025-02-03",
          gradeDescription,
          course: {
            courseClass: { courseType: type },
            courseClassVariant: { title },
            termId: recognized ? "" : "2024W",
          },
        },
      ],
    },
  };
  return parseKusssGrades(data, rawCourses, { year: 2024, type: "WS" });
};

describe("certificate import", () => {
  it.each([
    ["Sehr gut", 1],
    ["Gut", 2],
    ["Befriedigend", 3],
    ["Genügend", 4],
    ["Nicht genügend", 5],
    ["excellent", 1],
    ["good", 2],
  ])("imports the numeric grade for %s", (label, grade) => {
    expect(parseCertificate("Artificial Intelligence", "VL", label).grades).toEqual([
      { name: "VL Artificial Intelligence", grade },
    ]);
  });

  it.each([
    ["Artificial Intelligence", "VO", "VL Artificial Intelligence"],
    ["Algorithmen und Datenstrukturen 2", "VO", "VL Algorithms and Data Structures 2"],
    ["Algorithmen und Datenstrukturen 2", "UE", "UE Algorithms and Data Structures 2"],
  ])("matches %s (%s) to the catalog", (title, type, name) => {
    const parsed = parseCertificate(title, type, "Sehr gut");
    expect(parsed.rows[0].matchedCourseName).toBe(name);
    expect(parsed.grades).toEqual([{ name, grade: 1 }]);
    expect(parsed.planning).toEqual([{ name, plannedSemester: 1 }]);
    expect(parsed.customCourses).toEqual([]);
  });

  it("preserves the type and grade of unmatched German API courses", () => {
    const parsed = parseCertificate("Unlisted exercise", "UE", "Gut");
    expect(parsed.customCourses[0].type).toBe("UE");
    expect(parsed.grades).toEqual([{ name: "UE Unlisted exercise", grade: 2 }]);
  });

  it("imports recognized courses as accredited with their grade", () => {
    const parsed = parseCertificate("Algorithms and Data Structures 1", "VL", "Sehr gut", true);
    expect(parsed.grades).toEqual([{ name: "VL Algorithms and Data Structures 1", grade: 1 }]);
    expect(parsed.planning).toEqual([{ name: "VL Algorithms and Data Structures 1", plannedSemester: "accredited" }]);
  });
});

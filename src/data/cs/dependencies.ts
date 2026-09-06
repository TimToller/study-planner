import { courseGroups, csCourses } from "@/data/cs/courses";
import { defineDependencies } from "@/data/dependencies";

export const dependencies = defineDependencies(courseGroups, [
  {
    course: csCourses.discreteStructures,
    dependencies: [{ course: csCourses.logic, type: "hard" }],
  },
  {
    course: csCourses.digitalCircuits,
    dependencies: [{ course: csCourses.logic, type: "hard" }],
  },
  {
    course: csCourses.algebraForComputerScience,
    dependencies: [{ course: csCourses.discreteStructures, type: "hard" }],
  },
  {
    course: csCourses.algorithmsAndDataStructures1,
    dependencies: [{ course: csCourses.softwareDevelopment1, type: "hard" }],
  },
  {
    course: csCourses.softwareDevelopment2,
    dependencies: [{ course: csCourses.softwareDevelopment1, type: "hard" }],
  },
  {
    course: csCourses.electronics,
    dependencies: [{ course: csCourses.digitalCircuits, type: "soft" }],
  },
  {
    course: csCourses.computabilityAndComplexity,
    dependencies: [{ course: csCourses.discreteStructures, type: "hard" }],
  },
  {
    course: csCourses.algorithmsAndDataStructures2,
    dependencies: [{ course: csCourses.algorithmsAndDataStructures1, type: "hard" }],
  },
  {
    course: csCourses.systemsProgramming,
    dependencies: [
      { course: csCourses.softwareDevelopment1, type: "hard" },
      { course: csCourses.operatingSystems, type: "hard" },
    ],
  },
  {
    course: csCourses.computerNetworks,
    dependencies: [{ course: csCourses.operatingSystems, type: "hard" }],
  },
  {
    course: csCourses.databasesAndInformationSystems2,
    dependencies: [{ course: csCourses.databasesAndInformationSystems1, type: "hard" }],
  },
  {
    course: csCourses.formalModels,
    dependencies: [
      { course: csCourses.logic, type: "hard" },
      { course: csCourses.discreteStructures, type: "hard" },
    ],
  },
  {
    course: csCourses.computerGraphics,
    dependencies: [
      { course: csCourses.algebraForComputerScience, type: "hard" },
      { course: csCourses.algorithmsAndDataStructures2, type: "hard" },
    ],
  },
  {
    course: csCourses.practicalTrainingInSoftwareDevelopment2,
    dependencies: [{ course: csCourses.softwareDevelopment2, type: "hard" }],
  },
  {
    course: csCourses.computerArchitecture,
    dependencies: [{ course: csCourses.digitalCircuits, type: "hard" }],
  },
  {
    course: csCourses.artificialIntelligence,
    dependencies: [
      { course: csCourses.discreteStructures, type: "hard" },
      { course: csCourses.computabilityAndComplexity, type: "hard" },
      { course: csCourses.algorithmsAndDataStructures2, type: "hard" },
    ],
  },
  {
    course: csCourses.compilerConstruction,
    dependencies: [
      { course: csCourses.computabilityAndComplexity, type: "hard" },
      { course: csCourses.softwareDevelopment2, type: "hard" },
    ],
  },
  {
    course: csCourses.softwareEngineering,
    dependencies: [{ course: csCourses.softwareDevelopment2, type: "hard" }],
  },
  {
    course: csCourses.digitalSignalProcessing,
    dependencies: [
      { course: csCourses.algebraForComputerScience, type: "hard" },
      { course: csCourses.analysisForComputerScience, type: "hard" },
      { course: csCourses.digitalCircuits, type: "soft" },
      { course: csCourses.electronics, type: "hard" },
    ],
  },
  {
    course: csCourses.embeddedAndPervasiveSystems,
    dependencies: [
      { course: csCourses.computerNetworks, type: "hard" },
      { course: csCourses.statistics, type: "soft" },
      { course: csCourses.computerArchitecture, type: "soft" },
    ],
  },
]);

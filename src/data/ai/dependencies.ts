import { aiCourses, courseGroups } from "@/data/ai/courses";
import { defineDependencies } from "@/data/dependencies";

export const dependencies = defineDependencies(courseGroups, [
	{
		course: aiCourses.handsOnAiII,
		dependencies: [
			{ course: aiCourses.handsOnAiI, type: "hard" },
			{ course: aiCourses.programmingInPythonI, type: "hard" },
		],
	},
	{
		course: aiCourses.programmingInPythonII,
		dependencies: [{ course: aiCourses.programmingInPythonI, type: "hard" }],
	},
	{
		course: aiCourses.algorithmsAndDataStructuresI,
		dependencies: [{ course: aiCourses.programmingInPythonI, type: "hard" }],
	},
	{
		course: aiCourses.statisticsForAi,
		dependencies: [{ course: aiCourses.mathematicsForAiI, type: "recommended" }],
	},
	{
		course: aiCourses.mathematicsForAiII,
		dependencies: [{ course: aiCourses.mathematicsForAiI, type: "hard" }],
	},
	{
		course: aiCourses.artificialIntelligence,
		dependencies: [{ course: aiCourses.programmingInPythonI, type: "hard" }],
	},
	{
		course: aiCourses.algorithmsAndDataStructuresII,
		dependencies: [
			{ course: aiCourses.algorithmsAndDataStructuresI, type: "hard" },
			{ course: aiCourses.programmingInPythonI, type: "hard" },
		],
	},
	{
		course: aiCourses.machineLearningBasicTechniques,
		dependencies: [
			{ course: aiCourses.statisticsForAi, type: "soft" },
			{ course: aiCourses.mathematicsForAiII, type: "soft" },
		],
	},
	{
		course: aiCourses.visualization,
		dependencies: [{ course: aiCourses.programmingInPythonI, type: "hard" }],
	},
	{
		course: aiCourses.machineLearningSupervisedTechniques,
		dependencies: [
			{ course: aiCourses.programmingInPythonII, type: "hard" },
			{ course: aiCourses.mathematicsForAiII, type: "hard" },
			{ course: aiCourses.mathematicsForAiIII, type: "recommended" },
			{ course: aiCourses.machineLearningBasicTechniques, type: "recommended" },
		],
	},
	{
		course: aiCourses.mathematicsForAiIII,
		dependencies: [{ course: aiCourses.mathematicsForAiII, type: "hard" }],
	},
	{
		course: aiCourses.learningFromUserGeneratedData,
		dependencies: [{ course: aiCourses.programmingInPythonI, type: "hard" }],
	},
	{
		course: aiCourses.computationalDataAnalytics,
		dependencies: [{ course: aiCourses.machineLearningSupervisedTechniques, type: "recommended" }],
	},
	{
		course: aiCourses.formalModelsForAi,
		dependencies: [{ course: aiCourses.logic, type: "hard" }],
	},
	{
		course: aiCourses.machineLearningUnsupervisedTechniques,
		dependencies: [
			{ course: aiCourses.programmingInPythonII, type: "hard" },
			{ course: aiCourses.mathematicsForAiII, type: "hard" },
			{ course: aiCourses.mathematicsForAiIII, type: "soft" },
			{ course: aiCourses.machineLearningBasicTechniques, type: "soft" },
			{ course: aiCourses.machineLearningSupervisedTechniques, type: "soft" },
		],
	},
	{
		course: aiCourses.machineLearningAndPatternClassification,
		dependencies: [
			{ course: aiCourses.programmingInPythonI, type: "hard" },
			{ course: aiCourses.programmingInPythonII, type: "soft" },
			{ course: aiCourses.machineLearningSupervisedTechniques, type: "recommended" },
		],
	},
	{
		course: aiCourses.numericalOptimization,
		dependencies: [
			{ course: aiCourses.mathematicsForAiII, type: "hard" },
			{ course: aiCourses.mathematicsForAiIII, type: "recommended" },
		],
	},
	{
		course: aiCourses.practicalWorkInAi,
		dependencies: [{ course: aiCourses.seminarInAi, type: "recommended" }],
	},
	{
		course: aiCourses.introductionToComputationalStatistics,
		dependencies: [
			{ course: aiCourses.statisticsForAi, type: "hard" },
			{ course: aiCourses.machineLearningBasicTechniques, type: "soft" },
			{ course: aiCourses.mathematicsForAiII, type: "recommended" },
		],
	},
	{
		course: aiCourses.naturalLanguageProcessing,
		dependencies: [{ course: aiCourses.programmingInPythonI, type: "hard" }],
	},
	{
		course: aiCourses.computationalLogicsForAi,
		dependencies: [{ course: aiCourses.formalModelsForAi, type: "soft" }],
	},
	{
		course: aiCourses.reinforcementLearning,
		dependencies: [
			{ course: aiCourses.programmingInPythonI, type: "hard" },
			{ course: aiCourses.artificialIntelligence, type: "soft" },
		],
	},

	{
		course: aiCourses.digitalSignalProcessing,
		dependencies: [{ course: aiCourses.mathematicsForAiIII, type: "hard" }],
	},
	{
		course: aiCourses.bachelorThesis,
		dependencies: [{ course: aiCourses.practicalWorkInAi, type: "recommended" }],
	},
]);

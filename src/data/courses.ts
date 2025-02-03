import { Course, CourseGroup } from "@/types/courses";

export const courseGroups: CourseGroup[] = [
	{
		name: "AI Basics and Practical Training",
		courses: [
			{ type: "UE", name: "UE Hands-on AI I", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "VL", name: "VL Hands-on AI I", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "UE", name: "UE Hands-on AI II", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "VL Hands-on AI II", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "VL Introduction to AI", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "PR", name: "PR Practical Work in AI", ects: 7.5, available: "WS", recommendedSemester: 5 },
			{ type: "SE", name: "SE Seminar in AI", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "UE Artificial Intelligence", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "VL Artificial Intelligence", ects: 3, available: "WS", recommendedSemester: 3 },
		],
	},
	{
		name: "AI and Society",
		courses: [
			{ type: "VL", name: "VL Lecture Series Artificial Intelligence", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "KV", name: "KV Responsible AI", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "KV", name: "KV Technology and Society", ects: 3, available: "SS", recommendedSemester: 2 },
			{ name: "Gender Studies", ects: 3, available: "SS", recommendedSemester: 6 },
		],
	},
	{
		name: "Computer Science",
		courses: [
			{ type: "UE", name: "UE Programming in Python I", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "VL", name: "VL Programming in Python I", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "UE", name: "UE Programming in Python II", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "VL Programming in Python II", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "UE", name: "UE Algorithms and Data Structures I", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "VL Algorithms and Data Structures I", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "UE", name: "UE Algorithms and Data Structures II", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "VL Algorithms and Data Structures II", ects: 3, available: "WS", recommendedSemester: 3 },
		],
	},
	{
		name: "Data Science",
		courses: [
			{ type: "UE", name: "UE Statistics for AI", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "VL Statistics for AI", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "KV", name: "KV Machine Learning: Basic Techniques", ects: 3, available: "WS", recommendedSemester: 3 },
			{ type: "UE", name: "UE Visualization", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "VL Visualization", ects: 3, available: "WS", recommendedSemester: 3 },
			{ type: "UE", name: "UE Learning from User-generated Data", ects: 1.5, available: "SS", recommendedSemester: 4 },
			{ type: "VL", name: "VL Learning from User-generated Data", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "KV", name: "KV Computational Data Analytics", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "UE Introduction to Computational Statistics", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "VL", name: "VL Introduction to Computational Statistics", ects: 3, available: "WS", recommendedSemester: 5 },
			{ type: "UE", name: "UE Natural Language Processing", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "VL", name: "VL Natural Language Processing", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "UE", name: "UE Digital Signal Processing", ects: 1.5, available: "SS", recommendedSemester: 6 },
			{ type: "VL", name: "VL Digital Signal Processing", ects: 3, available: "SS", recommendedSemester: 6 },
		],
	},
	{
		name: "Bachelor Thesis",
		courses: [{ name: "Bachelor Thesis", ects: 9, recommendedSemester: 6 }],
	},
];

export const courses: Course[] = courseGroups.reduce((acc, group) => acc.concat(group.courses), [] as Course[]);

import {CourseGroup} from "@/types/courses";
import {generateRawCourses} from "@/data/courses.ts";

export type CourseName =
	| "Hands-on AI I"
	| "Introduction to AI"
	| "Lecture Series Artificial Intelligence"
	| "Responsible AI"
	| "Programming in Python I"
	| "Logic"
	| "Mathematics for AI I"
	| "Hands-on AI II"
	| "Technology and Society"
	| "Programming in Python II"
	| "Algorithms and Data Structures I"
	| "Statistics for AI"
	| "Mathematics for AI II"
	| "Artificial Intelligence"
	| "Algorithms and Data Structures II"
	| "Machine Learning: Basic Techniques"
	| "Visualization"
	| "Machine Learning: Supervised Techniques"
	| "Mathematics for AI III"
	| "Seminar in AI"
	| "Learning from User-generated Data"
	| "Computational Data Analytics"
	| "Formal Models"
	| "Machine Learning: Unsupervised Techniques"
	| "Machine Learning and Pattern Classification"
	| "Numerical Optimization"
	| "Practical Work in AI"
	| "Introduction to Computational Statistics"
	| "Natural Language Processing"
	| "Computational Logics for AI"
	| "Reinforcement Learning"
	| "Gender Studies"
	| "Digital Signal Processing"
	| "Bachelor Thesis";

export const courseGroups: CourseGroup<CourseName>[] = [
	{
		name: "AI Basics and Practical Training",
		courses: [
			{ type: "UE", name: "Hands-on AI I", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "VL", name: "Hands-on AI I", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "UE", name: "Hands-on AI II", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "Hands-on AI II", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "Introduction to AI", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "PR", name: "Practical Work in AI", ects: 7.5, available: "WS", recommendedSemester: 5 },
			{ type: "SE", name: "Seminar in AI", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "Artificial Intelligence", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "Artificial Intelligence", ects: 3, available: "WS", recommendedSemester: 3 },
		],
	},
	{
		name: "AI and Society",
		courses: [
			{ type: "VL", name: "Lecture Series Artificial Intelligence", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "KV", name: "Responsible AI", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "KV", name: "Technology and Society", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "KV", name: "Gender Studies", ects: 3, available: "SS", recommendedSemester: 6 },
		],
	},
	{
		name: "Computer Science",
		courses: [
			{ type: "UE", name: "Programming in Python I", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "VL", name: "Programming in Python I", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "UE", name: "Programming in Python II", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "Programming in Python II", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "UE", name: "Algorithms and Data Structures I", ects: 1.5, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "Algorithms and Data Structures I", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "UE", name: "Algorithms and Data Structures II", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "Algorithms and Data Structures II", ects: 3, available: "WS", recommendedSemester: 3 },
		],
	},
	{
		name: "Data Science",
		courses: [
			{ type: "UE", name: "Statistics for AI", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "Statistics for AI", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "KV", name: "Machine Learning: Basic Techniques", ects: 3, available: "WS", recommendedSemester: 3 },
			{ type: "UE", name: "Visualization", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "Visualization", ects: 3, available: "WS", recommendedSemester: 3 },
			{ type: "UE", name: "Learning from User-generated Data", ects: 1.5, available: "SS", recommendedSemester: 4 },
			{ type: "VL", name: "Learning from User-generated Data", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "KV", name: "Computational Data Analytics", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "Introduction to Computational Statistics", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "VL", name: "Introduction to Computational Statistics", ects: 3, available: "WS", recommendedSemester: 5 },
			{ type: "UE", name: "Natural Language Processing", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "VL", name: "Natural Language Processing", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "UE", name: "Digital Signal Processing", ects: 1.5, available: "SS", recommendedSemester: 6 },
			{ type: "VL", name: "Digital Signal Processing", ects: 3, available: "SS", recommendedSemester: 6 },
		],
	},
	{
		name: "Knowledge Representation and Reasoning",
		courses: [
			{ type: "UE", name: "Logic", ects: 1.5, available: "WS", recommendedSemester: 1 },
			{ type: "VL", name: "Logic", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "UE", name: "Formal Models", ects: 1.5, available: "SS", recommendedSemester: 4 },
			{ type: "VL", name: "Formal Models", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "Computational Logics for AI", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "VL", name: "Computational Logics for AI", ects: 3, available: "WS", recommendedSemester: 5 },
		],
	},
	{
		name: "Machine Learning and Perception",
		courses: [
			{ type: "UE", name: "Machine Learning: Supervised Techniques", ects: 1.5, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "Machine Learning: Supervised Techniques", ects: 3, available: "WS", recommendedSemester: 3 },
			{ type: "UE", name: "Machine Learning: Unsupervised Techniques", ects: 1.5, available: "SS", recommendedSemester: 4 },
			{ type: "VL", name: "Machine Learning: Unsupervised Techniques", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "Machine Learning and Pattern Classification", ects: 1.5, available: "SS", recommendedSemester: 4 },
			{ type: "VL", name: "Machine Learning and Pattern Classification", ects: 3, available: "SS", recommendedSemester: 4 },
			{ type: "UE", name: "Reinforcement Learning", ects: 1.5, available: "WS", recommendedSemester: 5 },
			{ type: "VL", name: "Reinforcement Learning", ects: 3, available: "WS", recommendedSemester: 5 },
		],
	},
	{
		name: "Mathematics",
		courses: [
			{ type: "UE", name: "Mathematics for AI I", ects: 3, available: "WS", recommendedSemester: 1 },
			{ type: "VL", name: "Mathematics for AI I", ects: 6, available: "WS", recommendedSemester: 1 },
			{ type: "UE", name: "Mathematics for AI II", ects: 3, available: "SS", recommendedSemester: 2 },
			{ type: "VL", name: "Mathematics for AI II", ects: 6, available: "SS", recommendedSemester: 2 },
			{ type: "UE", name: "Mathematics for AI III", ects: 3, available: "WS", recommendedSemester: 3 },
			{ type: "VL", name: "Mathematics for AI III", ects: 6, available: "WS", recommendedSemester: 3 },
			{ type: "UE", name: "Numerical Optimization", ects: 1.5, available: "SS", recommendedSemester: 4 },
			{ type: "VL", name: "Numerical Optimization", ects: 3, available: "SS", recommendedSemester: 4 },
		],
	},
	{
		name: "Bachelor Thesis",
		courses: [{ type: "SE", name: "Bachelor Thesis", ects: 9, recommendedSemester: 6 }],
	},
];

export const rawCourses = generateRawCourses(courseGroups)
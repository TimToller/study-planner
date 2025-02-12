import {Dependencies} from "@/types/dependencies";
import {CourseName} from "@/data/ai/courses";

export const dependencies: Dependencies<CourseName> = [
	{
		name: "Hands-on AI II",
		dependencies: [
			{ name: "Hands-on AI I", type: "hard" },
			{ name: "Programming in Python I", type: "hard" },
		],
	},
	{
		name: "Programming in Python II",
		dependencies: [{ name: "Programming in Python I", type: "hard" }],
	},
	{
		name: "Algorithms and Data Structures I",
		dependencies: [{ name: "Programming in Python I", type: "hard" }],
	},
	{
		name: "Statistics for AI",
		dependencies: [{ name: "Mathematics for AI I", type: "recommended" }],
	},
	{
		name: "Mathematics for AI II",
		dependencies: [{ name: "Mathematics for AI I", type: "hard" }],
	},
	{
		name: "Artificial Intelligence",
		dependencies: [{ name: "Programming in Python I", type: "hard" }],
	},
	{
		name: "Algorithms and Data Structures II",
		dependencies: [
			{ name: "Algorithms and Data Structures I", type: "hard" },
			{ name: "Programming in Python I", type: "hard" },
		],
	},
	{
		name: "Machine Learning: Basic Techniques",
		dependencies: [
			{ name: "Statistics for AI", type: "soft" },
			{ name: "Mathematics for AI II", type: "soft" },
		],
	},
	{
		name: "Visualization",
		dependencies: [{ name: "Programming in Python I", type: "hard" }],
	},
	{
		name: "Machine Learning: Supervised Techniques",
		dependencies: [
			{ name: "Programming in Python II", type: "hard" },
			{ name: "Mathematics for AI II", type: "hard" },
			{ name: "Mathematics for AI III", type: "recommended" },
			{ name: "Machine Learning: Basic Techniques", type: "recommended" },
		],
	},
	{
		name: "Mathematics for AI III",
		dependencies: [{ name: "Mathematics for AI II", type: "hard" }],
	},
	{
		name: "Learning from User-generated Data",
		dependencies: [{ name: "Programming in Python I", type: "hard" }],
	},
	{
		name: "Computational Data Analytics",
		dependencies: [{ name: "Machine Learning: Supervised Techniques", type: "recommended" }],
	},
	{
		name: "Formal Models",
		dependencies: [{ name: "Logic", type: "hard" }],
	},
	{
		name: "Machine Learning: Unsupervised Techniques",
		dependencies: [
			{ name: "Programming in Python II", type: "hard" },
			{ name: "Mathematics for AI II", type: "hard" },
			{ name: "Mathematics for AI III", type: "soft" },
			{ name: "Machine Learning: Basic Techniques", type: "soft" },
			{ name: "Machine Learning: Supervised Techniques", type: "soft" },
		],
	},
	{
		name: "Machine Learning and Pattern Classification",
		dependencies: [
			{ name: "Programming in Python I", type: "hard" },
			{ name: "Programming in Python II", type: "soft" },
			{ name: "Machine Learning: Supervised Techniques", type: "recommended" },
		],
	},
	{
		name: "Numerical Optimization",
		dependencies: [
			{ name: "Mathematics for AI II", type: "hard" },
			{ name: "Mathematics for AI III", type: "recommended" },
		],
	},
	{
		name: "Practical Work in AI",
		dependencies: [{ name: "Seminar in AI", type: "recommended" }],
	},
	{
		name: "Introduction to Computational Statistics",
		dependencies: [
			{ name: "Statistics for AI", type: "hard" },
			{ name: "Machine Learning: Basic Techniques", type: "soft" },
			{ name: "Mathematics for AI II", type: "recommended" },
		],
	},
	{
		name: "Natural Language Processing",
		dependencies: [{ name: "Programming in Python I", type: "hard" }],
	},
	{
		name: "Computational Logics for AI",
		dependencies: [{ name: "Formal Models", type: "soft" }],
	},
	{
		name: "Reinforcement Learning",
		dependencies: [
			{ name: "Programming in Python I", type: "hard" },
			{ name: "Artificial Intelligence", type: "soft" },
		],
	},

	{
		name: "Digital Signal Processing",
		dependencies: [{ name: "Mathematics for AI III", type: "hard" }],
	},
	{
		name: "Bachelor Thesis",
		dependencies: [{ name: "Practical Work in AI", type: "recommended" }],
	},
];

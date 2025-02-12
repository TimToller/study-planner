import {Dependencies} from "@/types/dependencies";
import {CourseName} from "@/data/cs/courses";

export const dependencies: Dependencies<CourseName> = [
    {
        name: "Discrete Structures",
        dependencies: [
            { name: "Logic", type: "hard" },
        ],
    },
    {
        name: "Digital Circuits",
        dependencies: [
            { name: "Logic", type: "hard" },
        ],
    },
    {
        name: "Algebra for Computer Science",
        dependencies: [
            { name: "Discrete Structures", type: "hard" },
        ],
    },
    {
        name: "Algorithms and Data Structures 1",
        dependencies: [
            { name: "Software Development 1", type: "hard" },
        ],
    },
    {
        name: "Software Development 2",
        dependencies: [
            { name: "Software Development 1", type: "hard" },
        ],
    },
    {
        name: "Electronics",
        dependencies: [
            { name: "Digital Circuits", type: "soft" },
        ],
    },
    {
        name: "Computability and Complexity",
        dependencies: [
            { name: "Discrete Structures", type: "hard" }
        ],
    },
    {
        name: "Algorithms and Data Structures 2",
        dependencies: [
            { name: "Algorithms and Data Structures 1", type: "hard" },
        ],
    },
    {
        name: "Systems Programming",
        dependencies: [
            { name: "Software Development 1", type: "hard" },
            { name: "Operating Systems", type: "hard" },
        ],
    },
    {
        name: "Computer Networks",
        dependencies: [
            { name: "Operating Systems", type: "hard" },
        ],
    },
    {
        name: "Databases and Information Systems 2",
        dependencies: [
            { name: "Databases and Information Systems 1", type: "hard" },
        ],
    },
    {
        name: "Formal Models",
        dependencies: [
            { name: "Logic", type: "hard" },
            { name: "Discrete Structures", type: "hard" },
        ],
    },
    {
        name: "Computer Graphics",
        dependencies: [
            { name: "Algebra for Computer Science", type: "hard" },
            { name: "Algorithms and Data Structures 2", type: "hard"},
        ],
    },
    {
        name: "Practical Training in Software Development 2",
        dependencies: [
            { name: "Software Development 2", type: "hard" },
        ],
    },
    {
        name: "Computer Architecture",
        dependencies: [
            { name: "Digital Circuits", type: "hard" },
        ],
    },
    {
        name: "Artificial Intelligence",
        dependencies: [
            { name: "Discrete Structures", type: "hard" },
            { name: "Computability and Complexity", type: "hard" },
            { name: "Algorithms and Data Structures 2", type: "hard" },
        ],
    },
    {
        name: "Compiler Construction",
        dependencies: [
            { name: "Computability and Complexity", type: "hard" },
            { name: "Software Development 2", type: "hard" },
        ],
    },
    {
        name: "Software Engineering",
        dependencies: [
            { name: "Software Development 2", type: "hard" },
        ],
    },
    {
        name: "Digital Signal Processing",
        dependencies: [
            { name: "Algebra for Computer Science", type: "hard" },
            { name: "Analysis for Computer Science", type: "hard" },
            { name: "Digital Circuits", type: "soft" },
            { name: "Electronics", type: "hard" },
        ],
    },
    {
        name: "Embedded and Pervasive Systems",
        dependencies: [
            { name: "Computer Networks", type: "hard" },
            { name: "Statistics", type: "soft" },
            { name: "Computer Architecture", type: "soft" },
        ],
    },
]
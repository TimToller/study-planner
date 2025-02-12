import {CourseGroup} from "@/types/courses";
import {generateRawCourses} from "@/data/courses.ts";

export type CourseName =
    "Propaedeutic" |
    "Discrete Structures" |
    "Logic" |
    "Algebra for Computer Science" |
    "Analysis for Computer Science" |
    "Computability and Complexity" |
    "Formal Models" |
    "Statistics" |
    "Digital Circuits" |
    "Electronics" |
    "Computer Architecture" |
    "Digital Signal Processing" |
    "Software Development 1" |
    "Software Development 2" |
    "Algorithms and Data Structures 1" |
    "Algorithms and Data Structures 2" |
    "Systems Programming" |
    "Practical Training in Software Development 2" |
    "Software Engineering" |
    "Operating Systems" |
    "Multimedia Systems" |
    "Computer Networks" |
    "Compiler Construction" |
    "Embedded and Pervasive Systems" |
    "Databases and Information Systems 1" |
    "Databases and Information Systems 2" |
    "Computer Graphics" |
    "Artificial Intelligence" |
    "Introduction to Machine Learning" |
    "Ethics and Gender Studies" |
    "Law for Computer Science" |
    "Techniques of Presentation and Team Work" |
    "Project Management" |
    "Economy for Computer Science"

export const courseGroups: CourseGroup<CourseName>[] = [
    {
        name: "Propaedeutic",
        courses: [
            { type: "KV", name: "Propaedeutic", ects: 1.5, available: "WS", recommendedSemester: 1 },
        ],
    },
    {
        name: "Theory",
        courses: [
            { type: "VL", name: "Discrete Structures", ects: 3, available: "WS", recommendedSemester: 1 },
            { type: "UE", name: "Discrete Structures", ects: 1.5, available: "WS", recommendedSemester: 1 },
            { type: "VL", name: "Logic", ects: 3, available: "WS", recommendedSemester: 1 },
            { type: "UE", name: "Logic", ects: 1.5, available: "WS", recommendedSemester: 1 },
            { type: "VL", name: "Algebra for Computer Science", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "UE", name: "Algebra for Computer Science", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "VL", name: "Analysis for Computer Science", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "UE", name: "Analysis for Computer Science", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "VL", name: "Computability and Complexity", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "UE", name: "Computability and Complexity", ects: 1.5, available: "WS", recommendedSemester: 3 },
            { type: "VL", name: "Formal Models", ects: 3, available: "SS", recommendedSemester: 4 },
            { type: "UE", name: "Formal Models", ects: 1.5, available: "SS", recommendedSemester: 4 },
            { type: "VL", name: "Statistics", ects: 3, available: "SS", recommendedSemester: 4 },
            { type: "UE", name: "Statistics", ects: 3, available: "SS", recommendedSemester: 4 },
        ],
    },
    {
        name: "Hardware",
        courses: [
            { type: "VL", name: "Digital Circuits", ects: 3, available: "WS", recommendedSemester: 1 },
            { type: "UE", name: "Digital Circuits", ects: 1.5, available: "WS", recommendedSemester: 1 },
            { type: "VL", name: "Electronics", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "UE", name: "Electronics", ects: 1.5, available: "SS", recommendedSemester: 2 },
            { type: "VL", name: "Computer Architecture", ects: 4.5, available: "SS", recommendedSemester: 4 },
            { type: "UE", name: "Computer Architecture", ects: 1.5, available: "SS", recommendedSemester: 4 },
            { type: "VL", name: "Digital Signal Processing", ects: 3, available: "SS", recommendedSemester: 6 },
            { type: "UE", name: "Digital Signal Processing", ects: 1.5, available: "SS", recommendedSemester: 6 },
        ],
    },
    {
        name: "Software",
        courses: [
            { type: "VL", name: "Software Development 1", ects: 3, recommendedSemester: 1 },
            { type: "UE", name: "Software Development 1", ects: 3, recommendedSemester: 1 },
            { type: "VL", name: "Software Development 2", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "UE", name: "Software Development 2", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "VL", name: "Algorithms and Data Structures 1", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "UE", name: "Algorithms and Data Structures 1", ects: 1.5, available: "SS", recommendedSemester: 2 },
            { type: "VL", name: "Algorithms and Data Structures 2", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "UE", name: "Algorithms and Data Structures 2", ects: 1.5, available: "WS", recommendedSemester: 3 },
            { type: "VL", name: "Systems Programming", ects: 1.5, available: "WS", recommendedSemester: 3 },
            { type: "UE", name: "Systems Programming", ects: 1.5, available: "WS", recommendedSemester: 3 },
            { type: "PR", name: "Practical Training in Software Development 2", ects: 3, available: "SS", recommendedSemester: 4 },
            { type: "VL", name: "Software Engineering", ects: 3, available: "WS", recommendedSemester: 5 },
            { type: "UE", name: "Software Engineering", ects: 1.5, available: "WS", recommendedSemester: 5 },
        ],
    },
    {
        name: "Systems",
        courses: [
            { type: "VL", name: "Operating Systems", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "UE", name: "Operating Systems", ects: 1.5, available: "SS", recommendedSemester: 2 },
            { type: "VL", name: "Multimedia Systems", ects: 3, available: "SS", recommendedSemester: 2 },
            { type: "UE", name: "Multimedia Systems", ects: 1.5, available: "SS", recommendedSemester: 2 },
            { type: "VL", name: "Computer Networks", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "UE", name: "Computer Networks", ects: 1.5, available: "WS", recommendedSemester: 3 },
            { type: "VL", name: "Compiler Construction", ects: 3, available: "WS", recommendedSemester: 5 },
            { type: "UE", name: "Compiler Construction", ects: 3, available: "WS", recommendedSemester: 5 },
            { type: "VL", name: "Embedded & Pervasive Systems", ects: 3, available: "SS", recommendedSemester: 6 },
            { type: "UE", name: "Embedded & Pervasive Systems", ects: 1.5, available: "SS", recommendedSemester: 6 },
        ],
    },
    {
        name: "Applications",
        courses: [
            { type: "VL", name: "Databases and Information Systems 1", ects: 3, available: "WS", recommendedSemester: 1 },
            { type: "UE", name: "Databases and Information Systems 1", ects: 3, available: "WS", recommendedSemester: 1 },
            { type: "VL", name: "Databases and Information Systems 2", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "UE", name: "Databases and Information Systems 2", ects: 1.5, available: "WS", recommendedSemester: 3 },
            { type: "VL", name: "Computer Graphics", ects: 3, available: "SS", recommendedSemester: 4 },
            { type: "UE", name: "Computer Graphics", ects: 1.5, available: "SS", recommendedSemester: 4 },
            { type: "VL", name: "Artificial Intelligence", ects: 3, available: "WS", recommendedSemester: 5 },
            { type: "UE", name: "Artificial Intelligence", ects: 1.5, available: "WS", recommendedSemester: 5 },
            { type: "VL", name: "Introduction to Machine Learning", ects: 3, available: "WS", recommendedSemester: 5 },
        ],
    },
    {
        name: "Complementary Skills",
        courses: [
            { type: "KV", name: "Ethics and Gender Studies", ects: 3, available: "WS", recommendedSemester: 1 },
            { type: "VL", name: "Law for Computer Science", ects: 3, available: "WS", recommendedSemester: 3 },
            { type: "KV", name: "Techniques of Presentation and Team Work", ects: 3, available: "SS", recommendedSemester: 4 },
            { type: "KV", name: "Project Management", ects: 3, available: "WS", recommendedSemester: 5 },
            { type: "VL", name: "Economy for Computer Science", ects: 3, available: "SS", recommendedSemester: 6 },
        ],
    },
    {
        name: "Bachelor Thesis",
        courses: [
            { type: "PR", name: "Project Practical", ects: 7.5, recommendedSemester: 6 },
        ],
    },
]

export const rawCourses = generateRawCourses(courseGroups)
export type DependencyType = "hard" | "soft" | "recommended";

export interface Dependency<CourseName extends string> {
    name: CourseName;
    type: DependencyType;
}

export interface CourseDependencies<CourseName extends string> {
    name: CourseName
    dependencies: Dependency<CourseName>[]
}

export type Dependencies<CourseName extends string> = CourseDependencies<CourseName>[]
import { Course } from "@/types/courses";
import { atom } from "jotai";

export const searchQueryAtom = atom("");
export const sortFieldAtom = atom<keyof Course | "status" | null>(null);
export const sortOrderAtom = atom<"asc" | "desc">("asc");
export const selectedTypesAtom = atom<string[]>([]);
export const selectedGroupsAtom = atom<string[]>([]);

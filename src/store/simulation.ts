import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { round, weightedAverage } from "@/lib/utils";
import { CourseGrading } from "@/types/courses";

import { courseGroupsAtom, rawCoursesAtom } from "@/store/settings";
import { gradesAtom } from "./grades";

export type SimulationGoal = "allA" | "passedWithDistinction";
export const simulationGoalAtom = atom<SimulationGoal>("passedWithDistinction");

export const simulationGradesAtom = atomWithStorage<CourseGrading[]>("simulationGrades", []);

export const setSimulationGradesAtom = atom(null, (get, set, course: CourseGrading) => {
	const current = get(simulationGradesAtom);
	const idx = current.findIndex((c) => c.name === course.name);

	if (course.grade === undefined) {
		if (idx !== -1) {
			const next = [...current];
			next.splice(idx, 1);
			set(simulationGradesAtom, next);
		}
		return;
	}

	if (idx === -1) {
		set(simulationGradesAtom, [...current, course]);
	} else {
		const next = [...current];
		next[idx] = course;
		set(simulationGradesAtom, next);
	}
});

export const resetSimulationGradesAtom = atom(null, (get, set) => {
	const current = get(simulationGradesAtom);
	if (current.length > 0) {
		set(simulationGradesAtom, []);
	}
});

const ectsMapAtom = atom((get) => {
	const m = new Map<string, number>();
	get(rawCoursesAtom).forEach((c) => m.set(c.name, c.ects));
	return m;
});

const combinedGradesAtom = atom((get) => {
	const real = get(gradesAtom);
	const sim = get(simulationGradesAtom);
	const names = new Set(real.map((g) => g.name));
	return [...real, ...sim.filter((s) => !names.has(s.name))];
});

export const groupStatsAtom = atom((get) => {
	const grades = get(combinedGradesAtom).filter((g) => g.grade !== undefined);
	const ects = get(ectsMapAtom);

	return get(courseGroupsAtom).map((group) => {
		const groupGrades = grades.filter((g) => group.courses.some((c) => `${c.type} ${c.name}` === g.name));

		const average = weightedAverage(
			groupGrades.map((g) => ({
				number: g.grade!,
				weight: ects.get(g.name) ?? 0,
			}))
		);

		const totalECTS = group.courses.reduce((sum, c) => sum + c.ects, 0);

		const gradedECTS = group.courses
			.filter((c) => grades.some((g) => g.name === `${c.type} ${c.name}`))
			.reduce((sum, c) => sum + c.ects, 0);

		const gradedSum = groupGrades.reduce((sum, g) => {
			const courseECTS = ects.get(g.name) ?? 0;
			return sum + g.grade! * courseECTS;
		}, 0);

		const ungradedECTS = totalECTS - gradedECTS;

		const optimisticAverage = totalECTS > 0 ? (gradedSum + 1 * ungradedECTS) / totalECTS : NaN;

		const rounded = round(average, 0);
		const optimisticRounded = round(optimisticAverage, 0);

		return {
			name: group.name,
			average,
			rounded,
			totalECTS,
			gradedECTS,
			optimisticRounded,
			optimisticAverage,
		} as const;
	});
});

export const passedWithDistinctionSimAtom = atom((get) => {
	const grouped = get(groupStatsAtom)
		.map((g) => g.rounded)
		.filter((a) => !isNaN(a));

	const noThreeOrWorse = grouped.every((a) => a < 3);
	const moreThanHalfAreOnes = grouped.filter((a) => a === 1).length > grouped.length / 2;
	const distinction = noThreeOrWorse && moreThanHalfAreOnes;

	return { distinction, noThreeOrWorse, moreThanHalfAreOnes } as const;
});

export const simulationGradesAverageAtom = atom((get) => {
	const allGrades = get(combinedGradesAtom).filter((g) => g.grade !== undefined);
	const ectsMap = get(ectsMapAtom);

	const courseAverage = weightedAverage(
		allGrades.map((g) => ({
			number: g.grade!,
			weight: ectsMap.get(g.name) ?? 0,
		}))
	);

	const groupAverages = get(groupStatsAtom)
		.map((g) => g.average)
		.filter((a) => !isNaN(a));
	const groupAverage =
		groupAverages.length > 0 ? groupAverages.reduce((sum, a) => sum + Math.round(a), 0) / groupAverages.length : NaN;

	return { courseAverage, groupAverage };
});

export const simulationGoalReachableAtom = atom((get) => {
	const goal = get(simulationGoalAtom);
	const allGrades = get(combinedGradesAtom);

	const hasFail = allGrades.filter((g) => g.grade !== undefined).some((g) => g.grade! >= 5);

	if (hasFail) {
		return {
			reachable: false,
			reasons: ["At least one already-graded course is 5 or worse."],
		} as const;
	}

	const groups = get(groupStatsAtom);
	const reasons: string[] = [];

	if (goal === "allA") {
		const notA = groups.find((g) => g.optimisticRounded > 1);
		if (notA) {
			reasons.push(
				`Group “${notA.name}” would end up rounding to ${notA.optimisticRounded}, even if every missing course were a 1.`
			);
		}
		return reasons.length > 0 ? ({ reachable: false, reasons } as const) : ({ reachable: true, reasons: [] } as const);
	}

	const tooHigh = groups.find((g) => g.optimisticRounded >= 3);
	if (tooHigh) {
		reasons.push(
			`Group “${tooHigh.name}” would end up rounding to ${tooHigh.optimisticRounded}, even if every missing course were a 1.`
		);
	}

	const countOnes = groups.filter((g) => g.optimisticRounded === 1).length;
	if (!(countOnes > groups.length / 2)) {
		reasons.push(`Only ${countOnes} out of ${groups.length} groups would round to 1 (optimistically).`);
	}

	if (reasons.length > 0) {
		return { reachable: false, reasons } as const;
	}
	return { reachable: true, reasons: [] } as const;
});

// Lower-bound algorithm, this is just 100% ChatGPT honestly
const gcd = (a: number, b: number): number => {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b !== 0) {
		const t = a % b;
		a = b;
		b = t;
	}
	return a;
};

/**
 * For one group: pick grades for missing courses (1..4) such that
 * - group average stays < bound
 * - grades are as "bad" as possible (push avg near bound)
 * - but "realistic": prefers 2/3 over 1/4 among equally-bad options
 */
function solveMissingGrades(opts: {
	missing: { key: string; ects: number }[];
	totalECTS: number;
	fixedSum: number; // Σ(realGrade*ects)
	bound: number; // 1.5 (must round to 1) or 2.5 (must stay <3)
}): Map<string, number> {
	const { missing, totalECTS, fixedSum, bound } = opts;
	const out = new Map<string, number>();
	if (missing.length === 0) return out;

	const EPS = 1e-6;

	const cap = (bound - EPS) * totalECTS - fixedSum; // max allowed sumMissing
	const baseline = missing.reduce((s, c) => s + 1 * c.ects, 0); // all missing = 1

	if (cap < baseline) {
		for (const c of missing) out.set(c.key, 1);
		return out;
	}

	// Reduce DP size using gcd of ECTS values
	let unit = missing[0].ects;
	for (const c of missing) unit = gcd(unit, c.ects);

	const w = missing.map((c) => Math.round(c.ects / unit));
	const budget = Math.floor((cap - baseline) / unit); // "extra points" budget above all-1s

	// "Realism" tie-breaker: avoid 1/4, neutral to 2, slight preference for 3.
	const realism = (grade: number) => {
		if (grade === 1) return -4;
		if (grade === 2) return 0;
		if (grade === 3) return 0.2;
		return -4; // 4
	};

	const n = missing.length;
	const NEG = -1e18;

	const dp = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(NEG));
	const take = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(0));
	dp[0][0] = 0;

	for (let i = 1; i <= n; i++) {
		for (let b = 0; b <= budget; b++) {
			for (let inc = 0; inc <= 3; inc++) {
				const cost = inc * w[i - 1];
				if (cost > b) break;
				const prev = dp[i - 1][b - cost];
				if (prev === NEG) continue;

				const grade = 1 + inc;
				const score = prev + realism(grade);

				if (score > dp[i][b]) {
					dp[i][b] = score;
					take[i][b] = inc;
				}
			}
		}
	}

	// Pick solution: primary = max used budget, secondary = max realism
	let bestB = 0;
	let bestScore = NEG;
	for (let b = 0; b <= budget; b++) {
		if (dp[n][b] === NEG) continue;
		if (b > bestB || (b === bestB && dp[n][b] > bestScore)) {
			bestB = b;
			bestScore = dp[n][b];
		}
	}

	let b = bestB;
	for (let i = n; i >= 1; i--) {
		const inc = take[i][b];
		out.set(missing[i - 1].key, 1 + inc);
		b -= inc * w[i - 1];
	}

	return out;
}

export const setLowerBoundSimulationGradesAtom = atom(null, (get, set) => {
	const goal = get(simulationGoalAtom);
	const real = get(gradesAtom);
	const existingSim = get(simulationGradesAtom);
	const groups = get(courseGroupsAtom);

	// Fixed grades = real + existing sim for courses that don't already have a real grade
	const realMap = new Map(real.map((g) => [g.name, g.grade] as const));
	const fixedMap = new Map(realMap);
	for (const s of existingSim) {
		if (s.grade === undefined) continue;
		if (!fixedMap.has(s.name)) fixedMap.set(s.name, s.grade);
	}

	type GroupInfo = {
		name: string;
		totalECTS: number;
		fixedECTS: number;
		fixedSum: number;
		missing: { key: string; ects: number }[];
		minAvg: number;
		maxAvg: number;
		forcedOne: boolean;
		forcedNotOne: boolean;
	};

	const computed: GroupInfo[] = groups.map((group) => {
		let totalECTS = 0;
		let fixedECTS = 0;
		let fixedSum = 0;
		const missing: { key: string; ects: number }[] = [];

		for (const c of group.courses) {
			const key = `${c.type} ${c.name}`;
			totalECTS += c.ects;

			const g = fixedMap.get(key);
			if (g !== undefined) {
				fixedECTS += c.ects;
				fixedSum += g * c.ects;
			} else {
				missing.push({ key, ects: c.ects });
			}
		}

		const missingECTS = totalECTS - fixedECTS;
		const minAvg = totalECTS > 0 ? (fixedSum + 1 * missingECTS) / totalECTS : NaN;
		const maxAvg = totalECTS > 0 ? (fixedSum + 4 * missingECTS) / totalECTS : NaN;

		return {
			name: group.name,
			totalECTS,
			fixedECTS,
			fixedSum,
			missing,
			minAvg,
			maxAvg,
			forcedOne: !isNaN(maxAvg) && maxAvg < 1.5,
			forcedNotOne: !isNaN(minAvg) && minAvg >= 1.5,
		};
	});

	// If not reachable given fixed constraints, best-effort: fill remaining with 1s (leave existing sim untouched)
	const violatesAllA = computed.some((g) => !isNaN(g.minAvg) && g.minAvg >= 1.5);
	const violatesDist = computed.some((g) => !isNaN(g.minAvg) && g.minAvg >= 2.5);

	if ((goal === "allA" && violatesAllA) || (goal === "passedWithDistinction" && violatesDist)) {
		const filled = computed.flatMap((g) => g.missing.map((m) => ({ name: m.key, grade: 1 })));
		const existingSimMap = new Map(existingSim.map((s) => [s.name, s.grade] as const));

		const merged = [...existingSim.filter((s) => s.grade !== undefined), ...filled.filter((f) => !existingSimMap.has(f.name))];

		set(simulationGradesAtom, merged);
		return;
	}

	// Decide per-group bound (same logic as before)
	const groupBound = new Map<string, 1.5 | 2.5>();
	if (goal === "allA") {
		for (const g of computed) groupBound.set(g.name, 1.5);
	} else {
		const G = computed.length;
		const requiredOnes = Math.floor(G / 2) + 1;

		const forcedOne = computed.filter((g) => g.forcedOne);
		const forcedNotOne = computed.filter((g) => g.forcedNotOne && !g.forcedOne);
		const flexible = computed.filter((g) => !g.forcedOne && !g.forcedNotOne);

		for (const g of forcedOne) groupBound.set(g.name, 1.5);
		for (const g of forcedNotOne) groupBound.set(g.name, 2.5);

		let ones = forcedOne.length;
		flexible.sort((a, b) => a.totalECTS - b.totalECTS);

		for (const g of flexible) {
			if (ones < requiredOnes) {
				groupBound.set(g.name, 1.5);
				ones++;
			} else {
				groupBound.set(g.name, 2.5);
			}
		}
	}

	// Only fill truly missing courses; keep existing simulations fixed
	const existingSimMap = new Map(existingSim.filter((s) => s.grade !== undefined).map((s) => [s.name, s] as const));
	const nextSim: CourseGrading[] = [...existingSimMap.values()];

	for (const g of computed) {
		if (g.missing.length === 0) continue;

		const bound = groupBound.get(g.name) ?? (goal === "allA" ? 1.5 : 2.5);

		const solved = solveMissingGrades({
			missing: g.missing,
			totalECTS: g.totalECTS,
			fixedSum: g.fixedSum,
			bound,
		});

		for (const c of g.missing) {
			if (existingSimMap.has(c.key)) continue; // shouldn't happen, but safe
			nextSim.push({ name: c.key, grade: solved.get(c.key) ?? 1 });
		}
	}

	set(simulationGradesAtom, nextSim);
});

export interface CourseImportance {
	courseName: string;
	groupName: string;
	ects: number;
	importance: number; // higher = more impactful
	explanation: string;
}

export const courseImportanceAtom = atom<CourseImportance[]>((get) => {
	// const ectsMap = get(ectsMapAtom);
	const combined = get(combinedGradesAtom);
	const gradedNames = new Set(combined.filter((g) => g.grade !== undefined).map((g) => g.name));
	const groups = get(groupStatsAtom);
	const targetGrade = 1;

	return get(courseGroupsAtom)
		.flatMap((group) => {
			const stats = groups.find((g) => g.name === group.name)!;

			const { average: groupAvg, gradedECTS, totalECTS } = stats;
			const distance = isNaN(groupAvg) ? 1 : Math.max(0, groupAvg - targetGrade) + 0.1; // +0.1 so zero distance ≠ drop to 0

			return group.courses
				.filter((c) => !gradedNames.has(`${c.type} ${c.name}`))
				.map((c) => {
					const courseKey = `${c.type} ${c.name}`;
					const ectsShare = c.ects / totalECTS; // share inside its group

					// Potential improvement if you score targetGrade in this course
					const newAvg = isNaN(groupAvg) ? targetGrade : (groupAvg * gradedECTS + targetGrade * c.ects) / (gradedECTS + c.ects);
					const improvement = isNaN(groupAvg) ? 0 : groupAvg - newAvg;

					// final score – tweak formula as you like
					const score = ectsShare * distance + improvement;

					// Human-readable explanation
					const reasonLines: string[] = [];
					reasonLines.push(`Worth ${c.ects} ECTS (${Math.round(ectsShare * 100)} % of the ${group.name} group).`);
					if (!isNaN(groupAvg)) {
						reasonLines.push(`Group average is ${groupAvg.toFixed(2)} → needs -${distance.toFixed(2)} to hit ${targetGrade}.`);
						reasonLines.push(
							`Scoring a ${targetGrade} here would shift the group average by -${improvement.toFixed(2)} to ${newAvg.toFixed(2)}.`
						);
					} else {
						reasonLines.push(`Group has no grades yet - this course will set the initial tone.`);
					}

					return {
						courseName: courseKey,
						groupName: group.name,
						ects: c.ects,
						importance: Number(score.toFixed(3)),
						explanation: reasonLines.join(" "),
					} satisfies CourseImportance;
				});
		})
		.sort((a, b) => b.importance - a.importance);
});

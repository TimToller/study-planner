import { formatSemester } from "@/lib/semester";
import { startingSemesterAtom } from "@/store/settings";
import { useAtom } from "jotai";
import React, { useCallback } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

interface SemesterSelectProps {
	semester?: number | "accredited";
	onSemesterChange: (newSemester: number | undefined) => void;
}

const SemesterSelect = React.memo(function SemesterSelect({ semester, onSemesterChange }: SemesterSelectProps) {
	const handleValueChange = useCallback(
		(newSemester: string) => {
			onSemesterChange(newSemester === "none" ? undefined : parseInt(newSemester, 10));
		},
		[onSemesterChange]
	);

	const [startingSemester] = useAtom(startingSemesterAtom);

	return (
		<Select onValueChange={handleValueChange} value={semester?.toString() ?? ""}>
			<SelectTrigger className="w-[200px]">
				<SelectValue placeholder="Select a semester" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Semester</SelectLabel>
					{new Array(8).fill(0).map((_, i) => (
						<SelectItem key={i} value={(i + 1).toString()}>
							{formatSemester(i + 1, startingSemester)}
						</SelectItem>
					))}
					<SelectItem value="accredited">Accredited</SelectItem>
					<SelectItem value="none">None</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
});

export default SemesterSelect;

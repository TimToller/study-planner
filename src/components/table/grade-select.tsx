import React, { useCallback } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

interface GradeSelectProps {
	grade?: number;
	onGradeChange: (newGrade: number | undefined) => void;
}

const GradeSelect = React.memo(function GradeSelect({ grade, onGradeChange }: GradeSelectProps) {
	const handleValueChange = useCallback(
		(newGrade: string) => {
			onGradeChange(newGrade === "none" ? undefined : parseInt(newGrade, 10));
		},
		[onGradeChange]
	);

	return (
		<Select onValueChange={handleValueChange} value={grade?.toString() ?? ""}>
			<SelectTrigger className="w-[200px]">
				<SelectValue placeholder="Select a grade" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Grades</SelectLabel>
					<SelectItem value="1">1 (Sehr gut)</SelectItem>
					<SelectItem value="2">2 (Gut)</SelectItem>
					<SelectItem value="3">3 (Befriedigend)</SelectItem>
					<SelectItem value="4">4 (Genügend)</SelectItem>
					<SelectItem value="5">5 (Nicht Genügend)</SelectItem>
					<SelectItem value="none">None</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
});

export default GradeSelect;

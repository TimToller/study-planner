import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { looksLikeKusssGradeText, parseKusssGradeText } from "@/lib/kusss-import";
import { Course, CourseGrading, CoursePlan, Semester } from "@/types/courses";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface KusssImportDialogProps {
	rawCourses: Course<string>[];
	startingSemester: Semester;
	onImport: (payload: { grades: CourseGrading[]; planning: CoursePlan[] }) => void;
	triggerLabel?: string;
}

export default function KusssImportDialog({
	rawCourses,
	startingSemester,
	onImport,
	triggerLabel = "Import from KUSSS",
}: KusssImportDialogProps) {
	const [kusssText, setKusssText] = useState("");
	const [open, setOpen] = useState(false);
	const [clipboardInfo, setClipboardInfo] = useState<string | null>(null);

	const parsedKusss = useMemo(
		() => parseKusssGradeText(kusssText, rawCourses, startingSemester),
		[kusssText, rawCourses, startingSemester],
	);

	const sortedRows = useMemo(
		() => [...parsedKusss.rows].sort((a, b) => Number(Boolean(a.matchedCourseName)) - Number(Boolean(b.matchedCourseName))),
		[parsedKusss.rows],
	);

	const rowsNeedingManual = useMemo(() => parsedKusss.rows.filter((row) => !row.matchedCourseName).length, [parsedKusss.rows]);

	const tryReadClipboard = async ({ manual }: { manual: boolean }) => {
		if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
			if (manual) setClipboardInfo("Clipboard access is not available in this browser.");
			return;
		}

		try {
			const clipboardText = await navigator.clipboard.readText();
			if (!clipboardText.trim()) {
				if (manual) setClipboardInfo("Clipboard is empty.");
				return;
			}

			if (!looksLikeKusssGradeText(clipboardText)) {
				if (manual) setClipboardInfo("Clipboard does not look like KUSSS grade text yet.");
				return;
			}

			setKusssText(clipboardText);
			setClipboardInfo("KUSSS text found in clipboard and loaded.");
		} catch {
			if (manual) setClipboardInfo("Clipboard access was denied. Paste the text manually.");
		}
	};

	useEffect(() => {
		if (!open) return;
		void tryReadClipboard({ manual: false });
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">{triggerLabel}</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>KUSSS text import</DialogTitle>
					<DialogDescription>Follow the steps below to import grades and course plannings from KUSSS text.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-1 text-sm">
						<p>
							Step 1: Open{" "}
							<a href="https://www.kusss.jku.at/kusss/gradeinfo.action" target="_blank" rel="noreferrer" className="underline">
								https://www.kusss.jku.at/kusss/gradeinfo.action
							</a>
						</p>
						<p>Step 2: Press cmd+a, then copy.</p>
						<p>Step 3: Paste below (or use clipboard import).</p>
						<p>Step 4: Review parsed table and import extracted data.</p>
					</div>
					<div className="flex items-center gap-2">
						<Button type="button" variant="outline" onClick={() => void tryReadClipboard({ manual: true })}>
							Read clipboard
						</Button>
						{clipboardInfo && <p className="text-sm text-muted-foreground">{clipboardInfo}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="kusss-text">KUSSS copied page text</Label>
						<textarea
							id="kusss-text"
							value={kusssText}
							onChange={(e) => setKusssText(e.target.value)}
							placeholder="Paste your copied KUSSS grade page text here..."
							className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					{parsedKusss.rows.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								{parsedKusss.planning.length} course plannings and {parsedKusss.grades.length} grades could be parsed.{" "}
								{rowsNeedingManual} rows should be done manually.
							</p>
							<div className="max-h-80 overflow-auto rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Course</TableHead>
											<TableHead>Grade</TableHead>
											<TableHead>Semester</TableHead>
											<TableHead>Matched</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sortedRows.map((row, index) => (
											<TableRow
												key={`${row.date}-${row.cleanTitle}-${index}`}
												className={!row.matchedCourseName ? "bg-destructive/10 hover:bg-destructive/20" : undefined}>
												<TableCell>{row.date}</TableCell>
												<TableCell>{row.cleanTitle}</TableCell>
												<TableCell>{row.gradeLabel}</TableCell>
												<TableCell>{row.plannedSemester === "accredited" ? "Accredited" : (row.semesterCode ?? "-")}</TableCell>
												<TableCell className={!row.matchedCourseName ? "text-destructive font-medium" : undefined}>
													{row.matchedCourseName ?? "No"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>
					)}
					<Button
						onClick={() => {
							onImport({ grades: parsedKusss.grades, planning: parsedKusss.planning });
							setOpen(false);
						}}
						disabled={parsedKusss.grades.length === 0 && parsedKusss.planning.length === 0}>
						Import extracted data
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

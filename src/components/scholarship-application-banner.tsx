import { CalendarCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { isScholarshipApplicationPeriod } from "@/store/scholarship";

const DISMISSED_YEAR_STORAGE_KEY = "scholarship-application-notice-dismissed-year";

export default function ScholarshipApplicationBanner({ onViewScholarship }: { onViewScholarship: () => void }) {
	const now = new Date();
	const currentYear = now.getFullYear().toString();
	const [dismissedYear, setDismissedYear] = useState(() => localStorage.getItem(DISMISSED_YEAR_STORAGE_KEY));

	if (!isScholarshipApplicationPeriod(now) || dismissedYear === currentYear) return null;

	const dismiss = () => {
		localStorage.setItem(DISMISSED_YEAR_STORAGE_KEY, currentYear);
		setDismissedYear(currentYear);
	};

	return (
		<header className="relative mb-4 w-full max-w-5xl rounded-lg border border-amber-300 bg-amber-50/80 px-4 py-3 pr-11 text-amber-950 shadow-sm dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-50">
			<Button
				variant="ghost"
				size="icon"
				onClick={dismiss}
				aria-label={`Dismiss scholarship application notice for ${currentYear}`}
				className="absolute right-1.5 top-1.5 h-8 w-8">
				<X className="h-4 w-4" />
			</Button>
			<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<CalendarCheck className="mt-0.5 h-5 w-5 shrink-0" />
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide dark:bg-amber-800">
								New reminder
							</span>
							<h1 className="font-semibold">Merit scholarship applications are open</h1>
						</div>
						<p className="mt-1 text-sm">October 1–31: check the requirements and submit your application in time.</p>
					</div>
				</div>
				<Button onClick={onViewScholarship} size="sm" variant="outline" className="shrink-0 bg-background/70">
					View grades & scholarship
				</Button>
			</div>
		</header>
	);
}

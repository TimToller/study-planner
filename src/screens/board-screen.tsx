import DraggableBoard from "@/components/board/draggable-board";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PlanningInfo, planningInfoAtom } from "@/store/planning";
import { ignoreGradedAtom } from "@/store/settings";
import { useAtom } from "jotai";

export default function BoardScreen() {
	const [{ errors, recommendations, warnings }] = useAtom(planningInfoAtom);

	const [ignoreGraded, setIgnoreGraded] = useAtom(ignoreGradedAtom);

	return (
		<section className="h-full flex flex-col gap-5">
			<div className="w-full">
				<DraggableBoard />
			</div>
			<Separator />
			<div className="flex items-center space-x-2 text-foreground">
				<Label htmlFor="ignore-graded">Ignore Graded Courses</Label>
				<Switch id="ignore-graded" checked={ignoreGraded} onCheckedChange={(c) => setIgnoreGraded(c)} />
			</div>
			{(!!errors.length || !!warnings.length || !!recommendations.length) && (
				<>
					<div className="">
						<InfoWrapper
							items={errors}
							textClassName="text-red-600"
							groupTitle="Errors"
							description="Should definitely be addressed. Either your study plan will not be possible or extremely hard."
						/>
						<InfoWrapper
							items={warnings}
							textClassName="text-yellow-600"
							groupTitle="Warnings"
							description="If you ignore these issues, it should be possible to keep up. It will probably require additional effort though."
						/>
						<InfoWrapper
							items={recommendations}
							groupTitle="Recommendations"
							description="It could be easier or less work if you follow these recommendations."
						/>
					</div>
				</>
			)}
		</section>
	);
}

function InfoWrapper({
	items,
	textClassName,
	groupTitle,
	description,
}: {
	items: PlanningInfo[];
	textClassName?: string;
	groupTitle: string;
	description: string;
}) {
	if (!items.length) return null;
	return (
		<div className="text-foreground">
			<h3 className={cn("text-xl font-bold", textClassName)}>
				{items.length} {groupTitle}
			</h3>
			<h4>{description}</h4>
			<ul className="list-disc list-inside">
				{items.map((item, i) => (
					<li key={i} className="text-lg">
						<BoldText text={item.message} />
					</li>
				))}
			</ul>
		</div>
	);
}

function BoldText({ text }: { text: string }) {
	const parts = text.split(/(\*\*[^*]+\*\*)/g);

	return (
		<span>
			{parts.map((part, index) =>
				part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part
			)}
		</span>
	);
}

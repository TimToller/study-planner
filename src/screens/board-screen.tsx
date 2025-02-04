import DraggableBoard from "@/components/board/draggable-board";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PlanningInfo, planningInfoAtom } from "@/store/planning";
import { useAtom } from "jotai";

export default function BoardScreen() {
	const [{ errors, recommendations, warnings }] = useAtom(planningInfoAtom);

	return (
		<section className="h-full flex flex-col gap-5">
			<div className="w-full">
				<DraggableBoard />
			</div>
			{(!!errors.length || !!warnings.length || !!recommendations.length) && (
				<>
					<Separator />
					<div className="">
						<InfoWrapper items={errors} textClassName="text-red-600" groupTitle="Errors" />
						<InfoWrapper items={warnings} textClassName="text-yellow-600" groupTitle="Warnings" />
						<InfoWrapper items={recommendations} groupTitle="Recommendations" />
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
}: {
	items: PlanningInfo[];
	textClassName?: string;
	groupTitle: string;
}) {
	if (!items.length) return null;
	return (
		<div>
			<h3 className={cn("text-xl font-bold", textClassName)}>
				{items.length} {groupTitle}
			</h3>
			<ul className="list-disc list-inside">
				{items.map((item) => (
					<li key={item.name} className="text-lg">
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

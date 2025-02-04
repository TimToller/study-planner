import DraggableBoard from "@/components/board/draggable-board";
import { Separator } from "@/components/ui/separator";

export default function BoardScreen() {
	return (
		<section className="h-full flex flex-col gap-5">
			<div className="w-full">
				<DraggableBoard />
			</div>
			<Separator />
			<div className="">
				<h2 className="text-2xl">Errors and Warnings</h2>
			</div>
		</section>
	);
}

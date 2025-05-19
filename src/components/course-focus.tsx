import { priorityAtom } from "@/store/priority";
import { useAtom } from "jotai";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export default function CourseFocus() {
	const [priorities] = useAtom(priorityAtom);
	console.log("Course Focus priorities:", priorities);

	return (
		<div>
			<h2 className="text-2xl font-bold">Course Focus</h2>
			What courses should you focus on must in your studies? Which courses will have the biggest effect on your overall grade?
			<Accordion type="single" collapsible className="w-full">
				{priorities.map((priority) => (
					<AccordionItem key={priority.name} value={priority.name}>
						<AccordionTrigger className="text-lg font-semibold">{priority.name}</AccordionTrigger>
						<AccordionContent>
							<p>{priority.explanation}</p>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { courseGroups } from "@/data/courses";
import { CourseGroup } from "@/types/courses";
import { ChevronsUpDown } from "lucide-react";

export default function ListScreen() {
	return (
		<section className="h-full flex flex-col">
			{courseGroups.map((g) => (
				<Group group={g} />
			))}
		</section>
	);
}

function Group({ group }: { group: CourseGroup }) {
	<Collapsible className="space-y-2">
		<div className="flex items-center justify-between space-x-4 px-4">
			<h4 className="text-sm font-semibold">{group.name}</h4>
			<CollapsibleTrigger asChild>
				<Button variant="ghost" size="sm" className="w-9 p-0">
					<ChevronsUpDown className="h-4 w-4" />
					<span className="sr-only">Toggle</span>
				</Button>
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent className="space-y-2">
			<div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/colors</div>
		</CollapsibleContent>
	</Collapsible>;
}

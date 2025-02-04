import { personalCoursesAtom } from "@/store/planning";
import { useAtom } from "jotai";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export default function DraggableBoard() {
	const [courses] = useAtom(personalCoursesAtom);
	return (
		<div className="grid grid-cols-5 h-full gap-4">
			<div className="grid grid-cols-4 gap-2 auto-rows-auto col-span-4">
				{new Array(8).fill(null).map((_, index) => (
					<Card key={index} className="">
						<CardHeader>
							<CardTitle>Semester {index + 1}</CardTitle>
						</CardHeader>
						<CardContent>
							{new Array(10).fill(null).map((_, i) => (
								<div key={i} className="p-2 bg-gray-200 rounded-md mb-2">
									Course {i + 1}
								</div>
							))}
						</CardContent>
					</Card>
				))}
			</div>
			<ScrollArea className="h-full max-h-screen overflow-y-auto rounded-md p-4 border-2 border-gray-300">
				{/* Search for courses and drag them over into the board */}
				{courses.map((c, i) => (
					<div key={i} className="p-2 bg-gray-200 rounded-md mb-2">
						{c.name}
					</div>
				))}
			</ScrollArea>
		</div>
	);
}

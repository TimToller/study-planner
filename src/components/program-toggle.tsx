import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useAtom} from "jotai";
import {Program, programAtom} from "@/store/settings.ts";
import {toast} from "sonner";
import {planningAtom} from "@/store/planning.ts";
import {gradesAtom} from "@/store/grades.ts";

export function ProgramToggle() {
    const [, setProgram] = useAtom(programAtom)

    const [, setPlanning] = useAtom(planningAtom);
    const [, setGrading] = useAtom(gradesAtom);

    const changeProgram = (value: Program) => {
        setProgram(value)

        setPlanning([])
        setGrading([])

        toast.success("Successfully change Bachelor's Program")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full" asChild>
                <Button variant="destructive" className="w-full">
                    <span>Change Program (Resets all data)</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => (changeProgram("AI"))}>AI</DropdownMenuItem>
                <DropdownMenuItem onClick={() => (changeProgram("CS"))}>CS</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
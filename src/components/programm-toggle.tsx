import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useAtom} from "jotai";
import {Programm, programmAtom} from "@/store/settings.ts";
import {toast} from "sonner";
import {planningAtom} from "@/store/planning.ts";
import {gradesAtom} from "@/store/grades.ts";

export function ProgrammToggle() {
    const [, setProgramm] = useAtom(programmAtom)

    const [, setPlanning] = useAtom(planningAtom);
    const [, setGrading] = useAtom(gradesAtom);

    const changeProgramm = (value: Programm) => {
        setProgramm(value)

        setPlanning([])
        setGrading([])

        toast.success("Successfully change Bachelor's Programm")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
                <Button variant="destructive" className="w-full">
                    <span>Change Programm (Resets all data)</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => (changeProgramm("AI"))}>AI</DropdownMenuItem>
                <DropdownMenuItem onClick={() => (changeProgramm("CS"))}>CS</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
import JkuLinks from "@/components/jku-links";
import KusssImportButton from "@/components/kusss-import-button";
import { ModeToggle } from "@/components/mode-toggle";
import ShareButton from "@/components/share-button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { programAtom, startingSemesterAtom } from "@/store/settings";
import { useAtomValue } from "jotai";
import { GraduationCap, LayoutDashboard, ListChecks, Settings2 } from "lucide-react";

const navigation = [
  { value: "board", label: "Plan", icon: LayoutDashboard },
  { value: "list", label: "Courses", icon: ListChecks },
  { value: "grades", label: "Grades", icon: GraduationCap },
  { value: "settings", label: "Settings", icon: Settings2 },
];

export default function AppHeader() {
  const program = useAtomValue(programAtom);
  const startingSemester = useAtomValue(startingSemesterAtom);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="hidden min-w-0 sm:block text-center">
          <p className="truncate font-bold leading-tight text-foreground">Study Planner</p>
          <p className="truncate text-sm text-muted-foreground">
            {program} · started {startingSemester.type} {startingSemester.year}
          </p>
        </div>

        <TabsList className="grid h-11 min-w-0 flex-1 grid-cols-4 bg-muted/70 lg:max-w-xl">
          {navigation.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1 px-1 lg:px-3">
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <ShareButton className="hidden lg:inline-flex" />
          <KusssImportButton className="hidden lg:inline-flex" />
          <ShareButton iconOnly size="icon" className="lg:hidden" />
          <KusssImportButton iconOnly size="icon" className="lg:hidden" />
          <div className="hidden md:block">
            <JkuLinks />
          </div>
          <div className="md:hidden">
            <JkuLinks iconOnly />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

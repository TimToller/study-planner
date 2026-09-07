import KusssImportButton from "@/components/kusss-import-button";
import { ProgramToggle } from "@/components/program-toggle";
import ShareButton from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { downloadJSON } from "@/lib/utils";
import { gradesAtom } from "@/store/grades";
import { planningAtom } from "@/store/planning";
import { exportAtom, programAtom, rawCoursesAtom, startingSemesterAtom } from "@/store/settings";
import { SemesterType } from "@/types/courses";
import { useAtom } from "jotai";
import { CalendarRange, Database, FileUp, LockKeyhole, RefreshCw, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsScreen() {
  const [rawCourses] = useAtom(rawCoursesAtom);
  const [exportData, importData] = useAtom(exportAtom);
  const [showProgramChange, setShowProgramChange] = useState(false);
  const [showResetOptions, setShowResetOptions] = useState(false);
  const [, setPlanning] = useAtom(planningAtom);
  const [, setGrading] = useAtom(gradesAtom);
  const [program] = useAtom(programAtom);
  const [startingSemester, setStartingSemester] = useAtom(startingSemesterAtom);

  const exportFile = () => downloadJSON(exportData, "StudyPlanner.json");

  const importFile = (file: File | null | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => importData(event.target?.result as string);
    reader.readAsText(file);
  };

  const resetPlanning = () => {
    setPlanning([]);
    toast.success("Course planning reset");
  };

  const resetGrading = () => {
    setGrading([]);
    toast.success("Grades reset");
  };

  const resetToRecommended = () => {
    setPlanning(
      rawCourses.flatMap((course) =>
        course.recommendedSemester === null
          ? []
          : [
              {
                name: course.name,
                plannedSemester: course.recommendedSemester,
              },
            ],
      ),
    );
    toast.success("Recommended study plan restored");
  };

  return (
    <section className="m-2 flex flex-col gap-5 py-3 sm:m-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your programme, data, display, and JKU services.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard
          icon={CalendarRange}
          title="Study start"
          description="Semester numbering throughout the planner starts here."
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="year">Starting year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2099"
                step="1"
                value={startingSemester.year}
                onChange={(event) => {
                  const year = Number(event.target.value);
                  if (Number.isInteger(year)) setStartingSemester({ ...startingSemester, year });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Starting term</Label>
              <ToggleGroup
                type="single"
                value={startingSemester.type}
                onValueChange={(value) => {
                  if (value)
                    setStartingSemester({
                      ...startingSemester,
                      type: value as SemesterType,
                    });
                }}
                className="grid grid-cols-2"
              >
                <ToggleGroupItem value="WS" aria-label="Winter semester">
                  Winter
                </ToggleGroupItem>
                <ToggleGroupItem value="SS" aria-label="Summer semester">
                  Summer
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Database}
          title="Import, export, and share"
          description="Your planner is stored locally. Export a backup before changing or resetting data."
          className="lg:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="json-import" className="mb-1.5 block text-sm">
                Import backup
              </Label>
              <Input
                type="file"
                id="json-import"
                onChange={(event) => importFile(event.target.files?.item(0))}
                accept=".json"
              />
            </div>
            <div className="flex items-end">
              <KusssImportButton className="w-full" variant="secondary" label="Import from myJKU" />
            </div>
            <Button onClick={exportFile} variant="outline" className="self-end">
              <FileUp /> Export backup
            </Button>
            <ShareButton variant="outline" className="self-end" />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={ShieldAlert}
          title="Change programme"
          description={`You are currently planning the ${program} bachelor's programme. Changing it clears planning and grades.`}
        >
          {showProgramChange ? (
            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-foreground">Export a backup first if you may need this plan again.</p>
              <ProgramToggle />
              <Button variant="ghost" size="sm" onClick={() => setShowProgramChange(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowProgramChange(true)}>
              <LockKeyhole /> Review programme change
            </Button>
          )}
        </SettingsCard>

        <SettingsCard
          icon={RefreshCw}
          title="Reset data"
          description="Clear one part of the planner or restore the recommended semester layout."
        >
          {showResetOptions ? (
            <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <Button onClick={resetPlanning} variant="destructive" className="w-full">
                Clear semester plan
              </Button>
              <Button onClick={resetGrading} variant="destructive" className="w-full">
                Clear all grades
              </Button>
              <Button onClick={resetToRecommended} variant="outline" className="w-full">
                Restore recommended plan
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowResetOptions(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowResetOptions(true)}>
              <LockKeyhole /> Show reset options
            </Button>
          )}
        </SettingsCard>
      </div>
    </section>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof CalendarRange;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`shadow-none ${className ?? ""}`}>
      <CardHeader className="p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">{children}</CardContent>
    </Card>
  );
}

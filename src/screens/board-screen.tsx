import DraggableBoard from "@/components/board/draggable-board";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PlanningInfo, planningInfoAtom } from "@/store/planning";
import { ignoreGradedAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { AlertCircle, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";

export default function BoardScreen() {
  const [{ errors, recommendations, warnings }] = useAtom(planningInfoAtom);
  const [ignoreGraded, setIgnoreGraded] = useAtom(ignoreGradedAtom);
  const issueCount = errors.length + warnings.length;

  return (
    <section className="flex h-full flex-col gap-5 py-4">
      <header className="px-3 sm:px-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plan your semesters</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Drag courses between semesters. Workload meters use 30 ECTS as the standard full-time target.
          </p>
        </div>
      </header>

      <DraggableBoard />

      <section className="mx-3 overflow-hidden rounded-xl border bg-card sm:mx-4" aria-labelledby="plan-review-title">
        <header className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="plan-review-title" className="font-bold text-foreground">
              Plan review
            </h2>
            <p className="text-sm text-muted-foreground">
              {issueCount === 0
                ? "No blocking problems found in your current plan."
                : `${issueCount} items may need your attention.`}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <Switch id="ignore-graded" checked={ignoreGraded} onCheckedChange={setIgnoreGraded} />
              <Label htmlFor="ignore-graded" className="cursor-pointer text-sm">
                Exclude completed courses
              </Label>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-bold">
              <CountIndicator count={errors.length} label="issues" className="text-destructive" />
              <CountIndicator count={warnings.length} label="warnings" className="text-amber-700 dark:text-amber-300" />
              <CountIndicator count={recommendations.length} label="suggestions" className="text-primary" />
            </div>
          </div>
        </header>

        {errors.length === 0 && warnings.length === 0 && recommendations.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-5 text-sm text-[hsl(var(--success))]">
            <CheckCircle2 className="h-5 w-5" /> Your plan currently passes every available check.
          </div>
        ) : (
          <div className="divide-y">
            <InfoGroup
              items={errors}
              title="Fix these first"
              description="These can prevent the plan from working as intended."
              icon={AlertCircle}
              className="text-destructive"
            />
            <InfoGroup
              items={warnings}
              title="Review these"
              description="The plan may work, but these courses could require additional effort."
              icon={AlertTriangle}
              className="text-amber-700 dark:text-amber-300"
            />
            <InfoGroup
              items={recommendations}
              title="Useful suggestions"
              description="Optional changes that may improve workload or curriculum coverage."
              icon={Lightbulb}
              className="text-primary"
            />
          </div>
        )}
      </section>
    </section>
  );
}

function CountIndicator({ count, label, className }: { count: number; label: string; className: string }) {
  return (
    <span className={cn("rounded-full bg-muted px-2.5 py-1", className)}>
      {count} {label}
    </span>
  );
}

function InfoGroup({
  items,
  title,
  description,
  icon: Icon,
  className,
}: {
  items: PlanningInfo[];
  title: string;
  description: string;
  icon: typeof AlertCircle;
  className: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-3 px-4 py-5 lg:grid-cols-[220px_1fr]">
      <div>
        <div className={cn("flex items-center gap-2 font-bold", className)}>
          <Icon className="h-4 w-4" /> {title}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="space-y-2 text-sm text-foreground">
        {items.map((item, index) => (
          <li key={`${item.message}-${index}`} className="rounded-lg bg-muted/45 px-3 py-2.5">
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
        part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
      )}
    </span>
  );
}

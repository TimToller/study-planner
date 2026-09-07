import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 w-full border-t bg-card/50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Your data stays in this browser unless you share or export it.</p>
        <a
          href="https://github.com/TimToller/study-planner"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-foreground hover:text-primary"
        >
          GitHub <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}

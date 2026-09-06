import { downloadJSON } from "@/lib/utils";
import { exportAtom } from "@/store/settings";
import { useAtom } from "jotai";
import LZString from "lz-string";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export default function ShareImportDialog() {
  const [exportData, importData] = useAtom(exportAtom);
  const [open, setOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);

  const clearShareParam = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("share");
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  const downloadBackup = () => {
    try {
      const backup = {
        grades: exportData.grades,
        planning: exportData.planning,
        settings: exportData.settings,
        customCourses: exportData.customCourses ?? [],
      };

      downloadJSON(backup, "StudyPlanner.json");

      toast.success("Backup downloaded");
    } catch (e) {
      console.error("Failed to download backup:", e);
      toast.error("Failed to download backup");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get("share");

    if (shareData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(shareData);
        if (decompressed) {
          setPendingImport(decompressed);
          setOpen(true);
        } else {
          throw new Error("Failed to decompress data");
        }
      } catch (e) {
        console.error("Failed to import shared data:", e);
        toast.error("Failed to import shared data. The link may be corrupted.");
        clearShareParam();
      }
    }
  }, [clearShareParam]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && pendingImport) {
          clearShareParam();
          setPendingImport(null);
        }
        setOpen(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import shared data?</DialogTitle>
          <DialogDescription>
            This will override your existing data (grades, planning, settings, and custom courses). Download a backup first if you want to
            keep your current setup.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" onClick={downloadBackup}>
            Download backup
          </Button>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearShareParam();
              setPendingImport(null);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!pendingImport}
            onClick={() => {
              if (!pendingImport) return;
              importData(pendingImport);
              clearShareParam();
              setPendingImport(null);
              setOpen(false);
            }}
          >
            Import and overwrite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

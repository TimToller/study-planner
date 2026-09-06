import { createPlanImage } from "@/lib/plan-image";
import { personalCoursesAtom } from "@/store/planning";
import { exportAtom, startingSemesterAtom } from "@/store/settings";
import { useAtomValue } from "jotai";
import { Copy, Download, Image, Link2, Loader2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type ShareButtonProps = Pick<ButtonProps, "className" | "size" | "variant">;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export default function ShareButton({ className, size = "default", variant = "default" }: ShareButtonProps) {
  const exportData = useAtomValue(exportAtom);
  const courses = useAtomValue(personalCoursesAtom);
  const startingSemester = useAtomValue(startingSemesterAtom);
  const [open, setOpen] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hideGrades, setHideGrades] = useState(true);
  const shareLinkValue = hideGrades ? exportData.linkWithoutGrades : exportData.link;

  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLinkValue);
      toast.success("Share link copied");
    } catch {
      toast.error("Could not copy the share link");
    }
  };

  const shareLink = async () => {
    if (!navigator.share) {
      await copyShareLink();
      return;
    }
    try {
      await navigator.share({
        title: "My study plan",
        text: "Take a look at my study plan",
        url: shareLinkValue,
      });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") toast.error("Could not share the link");
    }
  };

  const generateImage = async (hideGradesOverride = hideGrades) => {
    setIsGenerating(true);
    try {
      const blob = await createPlanImage({
        courses,
        hideGrades: hideGradesOverride,
        startingSemester,
      });
      setImageBlob(blob);
      setImageUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Failed to generate plan image:", error);
      toast.error("Could not generate the plan image");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareImage = async () => {
    if (!imageBlob) return;
    const file = new File([imageBlob], "study-plan.png", { type: "image/png" });
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      downloadBlob(imageBlob, "study-plan.png");
      toast.success("Plan image downloaded");
      return;
    }
    try {
      await navigator.share({
        title: "My study plan",
        text: "Here is my study plan",
        files: [file],
      });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") toast.error("Could not share the plan image");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setImageBlob(null);
          setImageUrl(null);
          setHideGrades(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className={className} size={size} variant={variant}>
          <Share2 /> Share plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share your study plan</DialogTitle>
          <DialogDescription>
            Send an editable planner link or create a polished image.
            <div className="flex items-center gap-2 rounded-md border px-3 py-2">
              <Checkbox
                id="share-hide-grades"
                checked={hideGrades}
                onCheckedChange={(checked) => {
                  const nextHideGrades = checked === true;
                  setHideGrades(nextHideGrades);
                  if (imageBlob) void generateImage(nextHideGrades);
                }}
              />
              <Label htmlFor="share-hide-grades" className="cursor-pointer">
                Hide grades
              </Label>
            </div>
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="link"
          onValueChange={(value) => {
            if (value === "image" && !imageBlob && !isGenerating) void generateImage();
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <Link2 /> Share link
            </TabsTrigger>
            <TabsTrigger value="image">
              <Image /> Plan image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-4 pt-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Anyone with this link can import a copy of your current plan.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  readOnly
                  value={shareLinkValue}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label="Share link"
                />
                <Button type="button" variant="outline" onClick={copyShareLink}>
                  <Copy /> Copy
                </Button>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={shareLink}>
              <Share2 /> Share link
            </Button>
          </TabsContent>
          <TabsContent value="image" className="space-y-4 pt-2">
            <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-3">
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" /> Generating image…
                </div>
              )}
              {!isGenerating && imageUrl && (
                <img src={imageUrl} alt="Preview of your study plan" className="max-h-[48vh] rounded-md shadow-sm" />
              )}
              {!isGenerating && !imageUrl && (
                <p className="text-sm text-muted-foreground">Generate an image preview of your planned courses.</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => void generateImage()}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Image />}{" "}
                {imageBlob ? "Regenerate" : "Generate image"}
              </Button>
              <Button type="button" className="flex-1" onClick={shareImage} disabled={!imageBlob || isGenerating}>
                <Download /> Share or download
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

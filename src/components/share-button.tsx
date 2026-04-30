import { exportAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function ShareButton() {
	const [exportData] = useAtom(exportAtom);

	const copyShareLink = async () => {
		const text = exportData.link;
		if (!text) {
			toast.error("No share link available.");
			return;
		}

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				toast.success("Link copied to clipboard");
			}
		} catch {
			toast.error("Failed to copy link");
		}
	};
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor="share-link">Share link</Label>
			<div className="flex gap-2">
				<Input id="share-link" readOnly value={exportData.link ?? ""} onFocus={(e) => e.currentTarget.select()} />
				<Button onClick={copyShareLink} variant={"outline"}>
					Copy
				</Button>
			</div>
		</div>
	);
}

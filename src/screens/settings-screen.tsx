import { exportAtom } from "@/store/import-export";
import { useAtom } from "jotai";

export default function SettingsScreen() {
	const [exportData] = useAtom(exportAtom);
	return (
		<section className="h-full flex flex-col">
			<div>Data:</div>
			<code className="whitespace-pre">{JSON.stringify(exportData, null, 2)}</code>
		</section>
	);
}

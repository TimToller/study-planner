import "@/styles/globals.css";
import { Provider } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<App />
			<Toaster />
		</Provider>
	</StrictMode>
);

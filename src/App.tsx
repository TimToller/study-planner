import { useAtom } from "jotai";
import Footer from "./components/footer";
import { ThemeProvider } from "./components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import BoardScreen from "./screens/board-screen";
import GradesScreen from "./screens/grades-screen";
import ListScreen from "./screens/list-screen";
import OnboardingScreen from "./screens/onboarding";
import SettingsScreen from "./screens/settings-screen";
import { onboardingAtom } from "./store/settings";

function App() {
	const [onboardingCompleted] = useAtom(onboardingAtom);

	return (
		<main className="flex flex-col items-center dark:bg-gray-900">
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				{!onboardingCompleted ? (
					<OnboardingScreen />
				) : (
					<Tabs defaultValue="board" className="w-full min-h-screen flex items-center flex-col p-7">
						<TabsList className="grid w-[400px] grid-cols-4">
							<TabsTrigger value="board">Board</TabsTrigger>
							<TabsTrigger value="list">List</TabsTrigger>
							<TabsTrigger value="grades">Grades</TabsTrigger>
							<TabsTrigger value="settings">Settings</TabsTrigger>
						</TabsList>
						<TabsContent value="board" className="w-full h-full">
							<BoardScreen />
						</TabsContent>
						<TabsContent value="list" className="w-full h-full">
							<ListScreen />
						</TabsContent>
						<TabsContent value="grades" className="w-full h-full">
							<GradesScreen />
						</TabsContent>
						<TabsContent value="settings" className="w-full h-full">
							<SettingsScreen />
						</TabsContent>
					</Tabs>
				)}
				<Footer />
			</ThemeProvider>
		</main>
	);
}

export default App;

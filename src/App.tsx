import Footer from "./components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import BoardScreen from "./screens/board-screen";
import GradesScreen from "./screens/grades-screen";
import ListScreen from "./screens/list-screen";

function App() {
	return (
		<main className="flex flex-col items-center ">
			<Tabs defaultValue="board" className="w-full min-h-screen flex items-center flex-col p-7">
				<TabsList className="grid w-[400px] grid-cols-3">
					<TabsTrigger value="board">Board</TabsTrigger>
					<TabsTrigger value="list">List</TabsTrigger>
					<TabsTrigger value="grades">Grades</TabsTrigger>
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
			</Tabs>
			<Footer />
		</main>
	);
}

export default App;

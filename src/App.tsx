import { useAtom } from "jotai";
import { useState } from "react";
import Footer from "./components/footer";
import ScholarshipApplicationBanner from "./components/scholarship-application-banner";
import ShareButton from "./components/share-button";
import ShareImportDialog from "./components/share-import-dialog";
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
  const [activeTab, setActiveTab] = useState("board");

  const openScholarship = () => {
    setActiveTab("grades");
    requestAnimationFrame(() => {
      document.getElementById("merit-scholarship")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="flex flex-col items-center dark:bg-gray-900">
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ShareImportDialog />
        {!onboardingCompleted ? (
          <OnboardingScreen />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full min-h-screen flex items-center flex-col px-3 py-4 sm:p-7"
          >
            <ScholarshipApplicationBanner onViewScholarship={openScholarship} />
            <header className="flex w-full max-w-5xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <TabsList className="grid w-full max-w-md flex-1 grid-cols-4">
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <ShareButton className="shadow-sm" />
            </header>
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

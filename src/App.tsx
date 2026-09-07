import { useAtom } from "jotai";
import { lazy, Suspense, useState } from "react";
import AppHeader from "./components/app-header";
import Footer from "./components/footer";
import ScholarshipApplicationBanner from "./components/scholarship-application-banner";
import ShareImportDialog from "./components/share-import-dialog";
import { ThemeProvider } from "./components/theme-provider";
import { Tabs, TabsContent } from "./components/ui/tabs";
import BoardScreen from "./screens/board-screen";
import OnboardingScreen from "./screens/onboarding";
import { onboardingAtom } from "./store/settings";

const GradesScreen = lazy(() => import("./screens/grades-screen"));
const ListScreen = lazy(() => import("./screens/list-screen"));
const SettingsScreen = lazy(() => import("./screens/settings-screen"));

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
    <main className="flex min-h-screen flex-col bg-background">
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ShareImportDialog />
        {!onboardingCompleted ? (
          <OnboardingScreen />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-screen w-full flex-1 flex-col">
            <AppHeader />
            <div className="mx-auto w-full max-w-[1600px] px-3 pt-4 sm:px-6">
              <ScholarshipApplicationBanner onViewScholarship={openScholarship} />
            </div>
            <TabsContent value="board" className="mx-auto h-full w-full max-w-[1600px] px-1 sm:px-2">
              <BoardScreen />
            </TabsContent>
            <TabsContent value="list" className="mx-auto h-full w-full max-w-[1600px] px-1 sm:px-2">
              <Suspense fallback={<ScreenFallback label="courses" />}>
                <ListScreen />
              </Suspense>
            </TabsContent>
            <TabsContent value="grades" className="mx-auto h-full w-full max-w-[1600px] px-1 sm:px-2">
              <Suspense fallback={<ScreenFallback label="grades" />}>
                <GradesScreen />
              </Suspense>
            </TabsContent>
            <TabsContent value="settings" className="mx-auto h-full w-full max-w-[1200px] px-1 sm:px-2">
              <Suspense fallback={<ScreenFallback label="settings" />}>
                <SettingsScreen />
              </Suspense>
            </TabsContent>
          </Tabs>
        )}
        {onboardingCompleted && <Footer />}
      </ThemeProvider>
    </main>
  );
}

function ScreenFallback({ label }: { label: string }) {
  return (
    <div className="m-4 flex min-h-64 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
      Loading {label}…
    </div>
  );
}

export default App;

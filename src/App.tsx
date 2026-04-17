import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Workflows } from "./components/Workflows";
import { Connections } from "./components/Connections";
import { Preferences } from "./components/Preferences";
import { Directory } from "./components/Directory";
import { Inbox } from "./components/Inbox";
import { Intro } from "./components/Intro";
import { Auth } from "./components/Auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastContext";

export default function App() {
  const [appState, setAppState] = useState<"intro" | "auth" | "app">("intro");
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("Alex Rostov");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {appState === "intro" && <Intro onComplete={() => setAppState("auth")} />}
        
        {appState === "auth" && (
          <Auth 
            onLogin={(name: string) => {
              setUserName(name || "Alex Rostov");
              setAppState("app");
            }} 
          />
        )}

        {appState === "app" && (
          <div className="flex h-screen w-screen overflow-hidden bg-bg-workspace">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userName={userName} />
            <main className="flex-1 relative overflow-hidden flex flex-col">
              {activeTab === "overview" && <Dashboard userName={userName} greeting={greeting} />}
              {activeTab === "inbox" && <Inbox />}
              {activeTab === "workflows" && <Workflows />}
              {activeTab === "directory" && <Directory />}
              {activeTab === "connections" && <Connections />}
              {activeTab === "preferences" && <Preferences />}
            </main>
          </div>
        )}
      </ToastProvider>
    </ErrorBoundary>
  );
}

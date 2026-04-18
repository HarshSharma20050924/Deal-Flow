import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Workflows } from "./components/Workflows";
import { Campaigns } from "./components/Campaigns";
import { Preferences } from "./components/Preferences";
import { Inbox } from "./components/Inbox";
import { Intro } from "./components/Intro";
import { Auth } from "./components/Auth";
import { Onboarding } from "./components/Onboarding";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastContext";
import { supabase } from "./lib/supabase";

export default function App() {
  const [appState, setAppState] = useState<"intro" | "auth" | "app">("intro");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("User");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserName(session.user.user_metadata.full_name || session.user.email?.split('@')[0] || "User");
        setNeedsOnboarding(!session.user.user_metadata.profession_setup);
        setAppState("app");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserName(session.user.user_metadata.full_name || session.user.email?.split('@')[0] || "User");
        setNeedsOnboarding(!session.user.user_metadata.profession_setup);
        setAppState("app");
      } else {
        setAppState("auth");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {appState === "intro" && <Intro onComplete={() => setAppState("auth")} />}
        
        {appState === "auth" && <Auth />}
 
        {appState === "app" && (
          <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-bg-workspace">
            {needsOnboarding && <Onboarding onComplete={() => setNeedsOnboarding(false)} />}
            
            {/* Mobile Top Bar */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-bg-base border-b border-border-subtle z-40">
              <h1 className="text-lg font-medium tracking-tight">Deal Flow<span className="text-brand-accent">.</span></h1>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-current rounded-full" />
                  <span className="w-full h-0.5 bg-current rounded-full" />
                  <span className="w-full h-0.5 bg-current rounded-full" />
                </div>
              </button>
            </div>

            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userName={userName} 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            
            <main className="flex-1 relative overflow-hidden flex flex-col">
              {activeTab === "overview" && <Dashboard userName={userName} greeting={greeting} />}
              {activeTab === "inbox" && <Inbox />}
              {activeTab === "workflows" && <Workflows />}
              {activeTab === "campaigns" && <Campaigns />}
              {activeTab === "preferences" && <Preferences />}
            </main>
          </div>
        )}
      </ToastProvider>
    </ErrorBoundary>
  );
}

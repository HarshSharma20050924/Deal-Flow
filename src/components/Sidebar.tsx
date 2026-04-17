import { useState } from "react";
import { Box, Home, Users, Settings, LayoutTemplate, LogOut, Mail, Bell } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "inbox", label: "Inbox", icon: Mail },
  { id: "workflows", label: "Workflows", icon: LayoutTemplate },
  { id: "directory", label: "Directory", icon: Users },
  { id: "connections", label: "Connections", icon: Box },
  { id: "preferences", label: "Preferences", icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, userName }: { activeTab: string, setActiveTab: (id: string) => void, userName: string }) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 flex-shrink-0 bg-bg-base border-r border-border-subtle h-screen flex flex-col pt-8 pb-6 relative z-50">
      <div className="px-6 mb-12 flex justify-between items-center">
        <h1 className="text-xl font-medium tracking-tight">Deal Flow<span className="text-brand-accent">.</span></h1>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-accent rounded-full border border-bg-base" />
          </button>

          {showNotifications && (
            <div className="absolute top-10 left-full ml-4 w-80 bg-bg-base border border-border-subtle shadow-xl z-50 animate-in fade-in slide-in-from-left-2 duration-200">
               <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                  <span className="text-xs font-medium uppercase tracking-wider">System Alerts</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] text-text-secondary hover:text-text-primary uppercase">Mark Read</button>
               </div>
               <div className="max-h-96 overflow-y-auto">
                 <div className="p-4 border-b border-border-subtle bg-bg-workspace group cursor-pointer hover:bg-border-subtle transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">Scrape Complete</span>
                      <span className="text-[10px] text-text-secondary">2m ago</span>
                    </div>
                    <p className="text-xs text-text-secondary">Operation "Seed Fintech" finished extracting 1,402 leads from 12 domains.</p>
                 </div>
                 <div className="p-4 border-b border-border-subtle group cursor-pointer hover:bg-bg-workspace transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">Webhook Failure</span>
                      <span className="text-[10px] text-text-secondary">1hr ago</span>
                    </div>
                    <p className="text-xs text-text-secondary">HubSpot CRM integration failed to sync 24 contacts. Retrying in 15m.</p>
                 </div>
                 <div className="p-4 group cursor-pointer hover:bg-bg-workspace transition-colors opacity-60">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">Billing Processed</span>
                      <span className="text-[10px] text-text-secondary">1d ago</span>
                    </div>
                    <p className="text-xs text-text-secondary">Monthly Enterprise invoice for $200 has been paid successfully.</p>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex flex-col gap-1 w-full flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors relative group
                ${isActive ? "font-medium text-text-primary" : "text-text-secondary hover:text-text-primary font-normal"}`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent rounded-r-md" />
              )}
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto px-6">
        <div className="border-t border-border-subtle pt-4 pb-4 flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-workspace border border-border-subtle rounded-full flex items-center justify-center text-xs font-medium text-text-secondary">
              {initials}
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm font-medium whitespace-nowrap truncate w-24">{userName}</span>
              <span className="text-xs text-text-secondary truncate w-24">Workspace</span>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-[10px] text-text-secondary font-light uppercase tracking-widest pt-2">
          v2.4.1 // Protocol Active
        </div>
      </div>
    </aside>
  );
}

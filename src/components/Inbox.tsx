import { useState, useEffect } from "react";
import { Search, Send, FileText, Calendar, X, Sparkles, Inbox as InboxIcon, Loader2 } from "lucide-react";
import { InboxRepository } from "../repositories/inbox.repository";
import { useToast } from "./ToastContext";

export function Inbox() {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [draft, setDraft] = useState("");
  const [isCopilotActive, setIsCopilotActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const inboxRepo = new InboxRepository();

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setIsLoading(true);
    try {
      const logs = await inboxRepo.getRecentLogs();
      const mapped = logs.map(log => ({
        id: log.id,
        name: `${log.leads?.first_name || ''} ${log.leads?.last_name || ''}`.trim() || 'New Lead',
        company: log.leads?.company || 'Local Business',
        subject: log.metadata?.subject || "Business Inquiry",
        status: log.metadata?.read ? "read" : "unread",
        time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        snippet: log.content,
        lead_id: log.lead_id,
        full_content: log.content
      }));
      setThreads(mapped);
      if (mapped.length > 0 && !activeThread) setActiveThread(mapped[0]);
    } catch (error: any) {
      addToast(`Failed to load inbox: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const applyDraft = (text: string) => {
    setDraft(text);
    setIsCopilotActive(false);
  };

  const handleSend = async () => {
    if (!draft) return;
    addToast("Sending reply...", "info");
    // Simulate API delay for feedback
    setTimeout(() => {
      addToast("Reply dispatched successfully.", "success");
      setDraft("");
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-base">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12 bg-bg-base/50">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-16 h-16 bg-bg-workspace rounded-full flex items-center justify-center mb-6 border border-border-subtle shadow-sm">
            <InboxIcon className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-xl font-medium tracking-tight mb-2">Inbox Zero</h2>
          <p className="text-sm text-text-secondary mb-8 leading-relaxed">
            All your incoming inquiries and replies have been processed. Launch an operation to start more conversations.
          </p>
          <button 
            onClick={loadInbox}
            className="flex items-center text-xs font-semibold uppercase tracking-wider border border-border-subtle hover:border-text-primary transition-all px-8 py-3 bg-bg-base active:scale-95 shadow-sm"
          >
            Check for New Mail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-bg-workspace/20">
      {/* Threads List Sidebar */}
      <div className="w-80 border-r border-border-subtle bg-bg-base flex flex-col shrink-0">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-base">
          <h2 className="text-lg font-medium tracking-tight">Inbox</h2>
          <span className="text-[10px] font-bold text-brand-accent px-2 py-1 bg-brand-accent-subtle uppercase tracking-widest">
            {threads.length} Messages
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full text-left p-5 border-b border-border-subtle transition-all flex gap-3 ${activeThread?.id === thread.id ? "bg-bg-workspace shadow-inner" : "hover:bg-bg-workspace/50"}`}
            >
              {thread.status === "unread" && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className={`text-sm truncate pr-2 ${thread.status === "unread" ? "font-semibold text-text-primary" : "text-text-secondary"}`}>{thread.name}</h3>
                  <span className="text-[10px] text-text-secondary shrink-0">{thread.time}</span>
                </div>
                <div className="text-[11px] text-text-secondary uppercase tracking-[0.15em] mb-1.5 font-medium">{thread.company}</div>
                <p className="text-xs text-text-secondary truncate line-clamp-1 opacity-70 italic">{thread.snippet}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Mail View */}
      {activeThread && (
        <div className="flex-1 flex flex-col bg-bg-base animate-in fade-in duration-300">
          <div className="p-8 border-b border-border-subtle bg-bg-workspace/30 shrink-0">
            <div className="text-[11px] text-text-secondary uppercase tracking-[0.2em] font-bold mb-2">{activeThread.company}</div>
            <h1 className="text-2xl font-medium tracking-tight mb-2 text-text-primary">{activeThread.subject}</h1>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="font-medium">From:</span>
              <span className="text-text-primary">{activeThread.name}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border-subtle/30">
                <span className="text-sm font-semibold text-text-primary">{activeThread.name}</span>
                <span className="text-[11px] text-text-secondary font-medium">{activeThread.time}</span>
              </div>
              <div className="text-base text-text-primary leading-relaxed bg-white border border-border-subtle p-8 shadow-sm font-outfit whitespace-pre-wrap">
                {activeThread.full_content}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-border-subtle bg-bg-workspace/20 shrink-0">
            <div className="max-w-3xl mx-auto relative">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Draft your reply with AI assistant..."
                className="w-full h-36 p-6 text-sm bg-white border border-border-subtle outline-none focus:border-brand-accent transition-all resize-none mb-6 shadow-sm placeholder:italic"
              />
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setIsCopilotActive(!isCopilotActive)}
                  className="flex items-center text-xs font-bold uppercase tracking-wider text-brand-accent hover:opacity-80 transition-all bg-brand-accent/5 px-4 py-2 border border-brand-accent/20"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  AI Smart Reply
                </button>
                
                <button 
                  onClick={handleSend}
                  disabled={!draft}
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider px-10 py-3 bg-text-primary text-white hover:bg-brand-accent hover:border-brand-accent transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Send <Send className="w-4 h-4" />
                </button>
              </div>

              {isCopilotActive && (
                <div className="absolute bottom-full mb-6 left-0 w-full max-w-md bg-white border border-border-subtle shadow-2xl z-20 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="p-4 border-b border-border-subtle bg-bg-workspace/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center text-brand-accent">
                      <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" /> 
                      Copilot Insights
                    </span>
                    <button onClick={() => setIsCopilotActive(false)}><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                     <button 
                       onClick={() => applyDraft("Hi, thank you for reaching out! I would love to schedule a quick walk-through of our pricing and features.")}
                       className="text-left p-3 hover:bg-bg-workspace text-xs border border-transparent hover:border-border-subtle transition-all"
                     >
                       Suggest Meeting Intro
                     </button>
                     <button 
                       onClick={() => applyDraft("Understood. I've noted your feedback. Let's touch base in Q3 as suggested.")}
                       className="text-left p-3 hover:bg-bg-workspace text-xs border border-transparent hover:border-border-subtle transition-all"
                     >
                       Follow-up in Q3
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

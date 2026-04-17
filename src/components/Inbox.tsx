import { useState } from "react";
import { Search, Send, FileText, Calendar, X, Sparkles, Inbox as InboxIcon } from "lucide-react";

const DEMO_THREADS = [
  { id: 1, name: "Sarah Jenkins", company: "AeroDynamics", subject: "Re: Infrastructure scaling", status: "unread", time: "10:42 AM", snippet: "Thanks for reaching out. We are actually exploring options for..." },
  { id: 2, name: "Michael Chang", company: "DataSync", subject: "Enterprise Tier Questions", status: "read", time: "Yesterday", snippet: "Could you send over the pricing matrix for the enterprise tier?" },
  { id: 3, name: "Elena Ford", company: "Ford Logistics", subject: "Not interested at this time", status: "read", time: "Tuesday", snippet: "We just signed a vendor for this, but please reach out in Q3." },
];

export function Inbox() {
  const [threads, setThreads] = useState(DEMO_THREADS);
  const [activeThread, setActiveThread] = useState(DEMO_THREADS[0]);
  const [draft, setDraft] = useState("");
  const [isCopilotActive, setIsCopilotActive] = useState(false);

  const applyDraft = (text: string) => {
    setDraft(text);
    setIsCopilotActive(false);
  };

  const handleClearInbox = () => {
    setThreads([]);
    setActiveThread(null as any);
  };

  const handleRestoreInbox = () => {
    setThreads(DEMO_THREADS);
    setActiveThread(DEMO_THREADS[0]);
  };

  if (threads.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12 bg-bg-base border border-border-subtle m-12 max-w-4xl mx-auto shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-bg-workspace rounded-full flex items-center justify-center mb-6">
            <InboxIcon className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-xl font-medium tracking-tight mb-2">Inbox Zero</h2>
          <p className="text-sm text-text-secondary mb-8 max-w-sm leading-relaxed">
            All leads have been processed. Launch a new operation to generate more pipeline activity.
          </p>
          <button 
            onClick={handleRestoreInbox}
            className="flex items-center text-xs font-medium border border-border-subtle hover:border-text-primary transition-colors px-6 py-3"
          >
            Restore Demo Threads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Threads List Sidebar */}
      <div className="w-80 border-r border-border-subtle bg-bg-base flex flex-col shrink-0 flex-shrink-0">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-lg font-medium tracking-tight">Inbox</h2>
          <button onClick={handleClearInbox} className="text-[10px] text-text-secondary hover:text-text-primary px-2 py-1 border border-border-subtle uppercase tracking-widest">
            Clear
          </button>
        </div>
        <div className="px-6 pb-6 border-b border-border-subtle">
          <div className="flex items-center px-3 h-9 bg-bg-workspace border border-border-subtle group hover:border-text-primary transition-colors">
            <Search className="w-3.5 h-3.5 text-text-secondary mr-2" />
            <input type="text" placeholder="Search threads..." className="flex-1 bg-transparent border-none outline-none text-xs" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full text-left p-5 border-b border-border-subtle transition-colors flex gap-3 ${activeThread?.id === thread.id ? "bg-bg-workspace" : "hover:bg-bg-workspace"}`}
            >
              {thread.status === "unread" && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className={`text-sm truncate pr-2 ${thread.status === "unread" ? "font-medium text-text-primary" : "text-text-secondary"}`}>{thread.name}</h3>
                  <span className="text-[10px] text-text-secondary shrink-0">{thread.time}</span>
                </div>
                <div className="text-[11px] text-text-secondary uppercase tracking-widest mb-1.5">{thread.company}</div>
                <p className="text-xs text-text-secondary truncate line-clamp-2 white-space-normal leading-relaxed">{thread.snippet}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Mail View */}
      {activeThread && (
        <div className="flex-1 flex flex-col bg-bg-base relative">
          <div className="p-8 border-b border-border-subtle bg-bg-workspace shrink-0">
            <div className="text-[11px] text-text-secondary uppercase tracking-widest mb-2">{activeThread.company}</div>
            <h1 className="text-xl font-medium tracking-tight mb-2">{activeThread.subject}</h1>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>From: {activeThread.name} &lt;{activeThread.name.split(' ')[0].toLowerCase()}@{activeThread.company.toLowerCase()}.com&gt;</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{activeThread.name}</span>
                <span className="text-[11px] text-text-secondary">{activeThread.time}</span>
              </div>
              <div className="text-sm text-text-secondary leading-relaxed bg-bg-workspace border border-border-subtle p-5">
                {activeThread.snippet} This is standard outreach follow-up data simulated for the frontend. We would love to evaluate your platform if integration timelines are short. Let us know. <br/><br/>Best,<br/>{activeThread.name}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-border-subtle bg-bg-base shrink-0">
            <div className="max-w-3xl relative">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Draft your reply..."
                className="w-full h-32 p-4 text-sm bg-bg-workspace border border-border-subtle outline-none focus:border-text-primary transition-colors resize-none mb-4"
              />
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setIsCopilotActive(!isCopilotActive)}
                  className="flex items-center text-xs font-medium text-brand-accent hover:text-[#0c9d68] transition-colors bg-brand-accent/10 hover:bg-brand-accent/20 px-3 py-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Copilot Actions
                </button>
                
                <button className="flex items-center text-sm font-medium hover:text-brand-accent transition-colors border border-border-subtle hover:border-brand-accent px-6 py-2 bg-text-primary text-white hover:bg-transparent hover:text-brand-accent">
                  Send Reply <Send className="ml-2 w-3.5 h-3.5" />
                </button>
              </div>

              {isCopilotActive && (
                <div className="absolute bottom-full mb-4 left-0 w-96 bg-bg-base border border-border-subtle shadow-2xl z-10 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-[#FAFAFA]">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-widest flex items-center text-text-primary">
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-brand-accent animate-pulse" /> 
                        Copilot Active
                      </span>
                      <span className="text-[10px] text-text-secondary mt-1 max-w-[250px] truncate">
                        Analyzing intent from: "{activeThread.subject}"
                      </span>
                    </div>
                    <button onClick={() => setIsCopilotActive(false)} className="text-text-secondary hover:text-text-primary bg-bg-base border border-border-subtle p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col gap-2 bg-white">
                    {activeThread.id === 1 && (
                      <>
                        <button 
                          onClick={() => applyDraft(`Hi ${activeThread.name.split(' ')[0]},\n\nOur integration timeline is typically under 48 hours for standard enterprise environments. I'd love to walk you through the architecture.\n\nAre you available for a 15-minute sync on Thursday at 2PM ELT? Here is my calendar link to confirm.\n\nBest,\nAlex`)}
                          className="flex text-left items-start p-3 bg-bg-workspace hover:bg-[#F5F5F5] transition-colors border border-border-subtle hover:border-text-primary group"
                        >
                          <Calendar className="w-4 h-4 text-brand-accent mt-0.5 mr-3 shrink-0" />
                          <div>
                            <div className="text-xs font-medium mb-1 group-hover:text-brand-accent transition-colors">Suggest Architecture Meeting</div>
                            <div className="text-[10px] text-text-secondary leading-snug">Drafts a calendar invite link proposing Thursday afternoon to discuss infrastructure scaling.</div>
                          </div>
                        </button>
                      </>
                    )}
                    {activeThread.id === 2 && (
                      <>
                        <button 
                          onClick={() => applyDraft(`Hi ${activeThread.name.split(' ')[0]},\n\nAbsolutely. I've attached our Enterprise Tier Pricing Matrix to this email. \n\nTo give you a more accurate quote, how many operator seats are you looking to provision?\n\nBest,\nAlex`)}
                          className="flex text-left items-start p-3 bg-bg-workspace hover:bg-[#F5F5F5] transition-colors border border-border-subtle hover:border-text-primary group"
                        >
                          <FileText className="w-4 h-4 text-brand-accent mt-0.5 mr-3 shrink-0" />
                          <div>
                            <div className="text-xs font-medium mb-1 group-hover:text-brand-accent transition-colors">Send Pricing Details</div>
                            <div className="text-[10px] text-text-secondary leading-snug">Attaches the pricing matrix and probes for seat count requirements.</div>
                          </div>
                        </button>
                      </>
                    )}
                    {activeThread.id === 3 && (
                      <>
                        <button 
                          onClick={() => applyDraft(`Hi ${activeThread.name.split(' ')[0]},\n\nUnderstood entirely. I've set a reminder to follow up in early Q3 once the dust settles on your vendor implementation.\n\nIf you hit any friction with them, feel free to reach out before then.\n\nBest,\nAlex`)}
                          className="flex text-left items-start p-3 bg-bg-workspace hover:bg-[#F5F5F5] transition-colors border border-border-subtle hover:border-text-primary group"
                        >
                          <FileText className="w-4 h-4 text-brand-accent mt-0.5 mr-3 shrink-0" />
                          <div>
                            <div className="text-xs font-medium mb-1 group-hover:text-brand-accent transition-colors">Acknowledge Refusal</div>
                            <div className="text-[10px] text-text-secondary leading-snug">Politely accepts the "not interested" and sets expectations for a Q3 touchpoint.</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => applyDraft(`Hi ${activeThread.name.split(' ')[0]},\n\nNo problem. Just out of curiosity, who did you end up going with? We're always trying to map the landscape.\n\nBest,\nAlex`)}
                          className="flex text-left items-start p-3 bg-bg-workspace hover:bg-[#F5F5F5] transition-colors border border-border-subtle hover:border-text-primary group mt-1"
                        >
                          <Search className="w-4 h-4 text-brand-accent mt-0.5 mr-3 shrink-0" />
                          <div>
                            <div className="text-xs font-medium mb-1 group-hover:text-brand-accent transition-colors">Competitor Intel Probe</div>
                            <div className="text-[10px] text-text-secondary leading-snug">Briefly attempts to identify the vendor they signed with.</div>
                          </div>
                        </button>
                      </>
                    )}
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

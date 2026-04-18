import { Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

interface ProcessMonitorProps {
  campaignId: string;
}

export function ProcessMonitor({ campaignId }: ProcessMonitorProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [leadCount, setLeadCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [logs, setLogs] = useState<{message: string, timestamp: string}[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [campaignId]);

  useEffect(() => {
    // Auto-scroll logs to bottom without shifting the entire page layout
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchData = async () => {
    try {
      // Fetch campaign
      const { data: campData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!campData) return;
      setCampaign(campData);
      setLogs(campData.metadata?.logs || []);

      // Fetch leads for this campaign to get their IDs
      const { data: campaignLeads } = await supabase
        .from('leads')
        .select('id')
        .filter('metadata->>campaign_id', 'eq', campaignId);
      
      const currentLeadCount = campaignLeads?.length || 0;
      setLeadCount(currentLeadCount);

      // Count drafts ONLY for this campaign's leads
      if (currentLeadCount > 0 && campaignLeads) {
        const leadIds = campaignLeads.map((l: any) => l.id);
        const { count: drafts } = await supabase
          .from('email_drafts')
          .select('id', { count: 'exact', head: true })
          .in('lead_id', leadIds);
        
        setDraftCount(drafts || 0);
      } else {
        setDraftCount(0);
      }
    } catch (e) {
      console.error("ProcessMonitor fetch failed", e);
    }
  };

  if (!campaign) return null;

  const isSourcingActive = campaign.status === 'active';
  const isDraftingActive = leadCount > 0 && draftCount < leadCount;
  const isActive = isSourcingActive || isDraftingActive;
  
  const currentStep = campaign.metadata?.current_step || 'Sourcing';

  const steps = [
    {
      title: "Finding Leads",
      detail: leadCount > 0 ? `${leadCount} leads found` : "Searching...",
      done: leadCount > 0 && !isSourcingActive,
      active: isSourcingActive && leadCount === 0,
    },
    {
      title: "Checking Data",
      detail: leadCount > 3 ? "Data verified" : "Waiting for leads...",
      done: leadCount > 3 && !isSourcingActive,
      active: isSourcingActive && leadCount > 0,
    },
    {
      title: "Writing Messages",
      detail: draftCount > 0 ? `${draftCount} / ${leadCount} drafts created` : (isDraftingActive ? "Writing..." : "Waiting..."),
      done: leadCount > 0 && draftCount >= leadCount,
      active: isDraftingActive,
    },
    {
      title: "Done",
      detail: !isActive ? "Sequence complete" : "In progress...",
      done: !isActive,
      active: false,
    }
  ];

  return (
    <div className="bg-bg-base border border-border-subtle w-full rounded-sm shadow-sm relative overflow-hidden">
      {/* Green left accent bar */}
      {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent animate-pulse" />}

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border-subtle">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-primary flex items-center gap-2">
          {isActive && <Loader2 className="w-3 h-3 animate-spin text-brand-accent" />}
          {isActive ? "Searching..." : "Search Complete"}
        </h2>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${isActive ? "text-brand-accent border-brand-accent/30 bg-brand-accent/5" : "text-text-secondary border-border-subtle"}`}>
          {campaign.status}
        </span>
      </div>

      <div className="flex">
        {/* Steps (left) */}
        <div className="p-8 border-r border-border-subtle w-56 shrink-0">
          <div className="relative">
            <div className="absolute left-[7px] top-4 bottom-4 w-px bg-border-subtle" />
            <div className="flex flex-col gap-7 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="mt-0.5">
                    {step.done ? (
                      <div className="w-[15px] h-[15px] rounded-full bg-brand-accent flex items-center justify-center">
                        <Check className="w-[9px] h-[9px] text-white stroke-[4]" />
                      </div>
                    ) : step.active ? (
                      <div className="w-[15px] h-[15px] rounded-full bg-brand-accent flex items-center justify-center">
                        <Loader2 className="w-[9px] h-[9px] text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="w-[15px] h-[15px] rounded-full bg-border-subtle" />
                    )}
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-wider ${step.done || step.active ? "text-text-primary" : "text-text-secondary/50"}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-text-secondary mt-0.5">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log Feed (right) */}
        <div className="flex-1 p-6 bg-bg-workspace/30">
          <div className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-3 flex justify-between">
            <span>Activity Log</span>
            {isActive && <span className="text-brand-accent animate-pulse">● live</span>}
          </div>
          <div ref={logsContainerRef} className="font-mono text-[11px] h-40 overflow-y-auto space-y-1.5 custom-scrollbar scroll-smooth">
            {logs.length === 0 ? (
              <div className="text-text-secondary/40 italic">Waiting for activity...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-brand-accent/50 select-none shrink-0">&gt;</span>
                  <span className={i === logs.length - 1 ? "text-text-primary font-medium" : "text-text-secondary"}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <div className="flex justify-between text-[9px] text-text-secondary uppercase tracking-wider mb-1.5">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((leadCount / 15) * 100))}%</span>
            </div>
            <div className="w-full h-1.5 bg-border-subtle overflow-hidden rounded-full">
              <div 
                className="h-full bg-brand-accent transition-all duration-1000 rounded-full" 
                style={{ width: `${Math.min(100, (leadCount / 15) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

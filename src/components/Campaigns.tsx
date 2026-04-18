import { useState, useEffect } from "react";
import { Play, Pause, Trash2, ExternalLink } from "lucide-react";
import { CampaignRepository } from "../repositories/campaign.repository";
import type { Campaign } from "../types/database";
import { useToast } from "./ToastContext";

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const repo = new CampaignRepository();

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const data = await repo.findAll();
      setCampaigns(data);
    } catch (e) {
      addToast("Failed to load campaigns", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 sm:p-12 shrink-0 border-b border-border-subtle bg-bg-base">
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight mb-2">Campaigns</h1>
        <p className="text-xs sm:text-sm text-text-secondary">Track and manage your automated outreach operations.</p>
      </div>
 
      <div className="flex-1 p-4 sm:p-12 overflow-y-auto bg-bg-workspace">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-text-secondary text-xs uppercase tracking-widest">Initialising...</div>
        ) : campaigns.length === 0 ? (
          <div className="border border-dashed border-border-subtle p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <p className="text-xs sm:text-sm text-text-secondary mb-4">No active campaigns found. Start one from the Command Bar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="bg-bg-base border border-border-subtle p-6 hover:border-text-primary transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-1">{c.name}</h3>
                    <p className="text-xs text-text-secondary">Target: <span className="font-mono">{c.targeting_query || 'N/A'}</span></p>
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${c.status === 'active' ? 'bg-brand-accent text-white' : 'bg-bg-workspace text-text-secondary'}`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border-subtle">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest">Leads Sourced</span>
                      <span className="text-xl font-medium">0</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest">Response Rate</span>
                      <span className="text-xl font-medium text-brand-accent">0%</span>
                   </div>
                   
                   <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 border border-border-subtle hover:bg-bg-workspace transition-colors">
                        <Pause className="w-3.5 h-3.5 text-text-secondary" />
                      </button>
                      <button className="p-2 border border-border-subtle hover:bg-bg-workspace transition-colors text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

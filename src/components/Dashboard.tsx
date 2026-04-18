import { ProcessMonitor } from "./ProcessMonitor";
import { OutreachInspector } from "./OutreachInspector";
import { CommandBar } from "./CommandBar";
import { ConfirmationModal } from "./ConfirmationModal";
import { useState, useMemo, useEffect, useRef } from "react";
import { LeadRepository } from "../repositories/lead.repository";
import { CampaignRepository } from "../repositories/campaign.repository";
import { Lead, Campaign } from "../types/database";
import { Search, History, MousePointer2, Loader2, PanelLeftClose, PanelLeftOpen, UserCircle2, ChevronRight, Trash2, CheckSquare, Square } from "lucide-react";
import React from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ToastContext";

export function Dashboard({ userName, greeting }: { userName: string, greeting: string }) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "email" | "whatsapp">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [profession, setProfession] = useState<string>("Software Services");
  const [profilesList, setProfilesList] = useState<string[]>(["Software Services"]);
  
  // Confirmation Modal State
  const [confModal, setConfModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "",
    onConfirm: () => {}
  });

  const { addToast } = useToast();
  const leadRepo = useMemo(() => new LeadRepository(), []);
  const campRepo = useMemo(() => new CampaignRepository(), []);
  const lastSwitchedRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata) {
        if (user.user_metadata.profession) setProfession(user.user_metadata.profession);
        if (user.user_metadata.profession_profiles) setProfilesList(user.user_metadata.profession_profiles);
      }
    });
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    try {
      const allCampaigns = await campRepo.findAll();
      setCampaigns(allCampaigns.slice(0, 15));

      const allLeads = await leadRepo.findAll({ limit: 200 });
      setTotalLeads(allLeads.length);
      setTotalConversions(allLeads.filter(l => l.status === 'replied' || l.status === 'converted').length);

      if (activeTab === "all") {
        setLeads(allLeads);
      } else {
        const filtered = await leadRepo.findAll({ campaignId: activeTab, limit: 200 });
        setLeads(filtered);
      }

      const activeCampaign = allCampaigns.find(c => c.status === 'active');
      setHasActiveSearch(!!activeCampaign);

      if (activeCampaign && activeTab === "all" && lastSwitchedRef.current !== activeCampaign.id) {
        lastSwitchedRef.current = activeCampaign.id;
        setActiveTab(activeCampaign.id);
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };

  const handleProfessionSwitch = () => {
    const list = profilesList.length > 0 ? profilesList : ["Software Services"];
    const nextIdx = (list.indexOf(profession) + 1) % list.length;
    const newProfession = list[nextIdx] || list[0];
    setProfession(newProfession);
    supabase.auth.updateUser({ data: { profession: newProfession } });
  };

  const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfModal({
      isOpen: true,
      title: "Delete Session?",
      message: "This will permanently remove this search history and all associated results. This action cannot be undone.",
      confirmLabel: "Delete History",
      onConfirm: async () => {
        try {
          await campRepo.delete(id);
          if (activeTab === id) setActiveTab("all");
          loadData();
          addToast("Session history deleted.", "info");
        } catch (err) {
          console.error("Delete failed", err);
        }
      }
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = leads.filter(l => {
        const hasPhone = !!(l.phone || l.metadata?.phone || l.metadata?.original_phone);
        const hasEmail = !!(l.email || l.metadata?.email);
        if (filterMode === "whatsapp") return hasPhone;
        if (filterMode === "email") return hasEmail;
        return true;
      }).map(l => l.id);
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkOutreach = async (platform: "email" | "whatsapp" | "both") => {
    addToast(`Commencing ${platform} deployment for ${selectedIds.length} profiles...`, "success");
    try {
      for (const id of selectedIds) {
        const lead = leads.find(l => l.id === id);
        const { data: existing } = await supabase.from('leads').select('metadata').eq('id', id).single();
        const currentMeta = existing?.metadata || {};
        
        await supabase.from('leads').update({ 
          status: 'qualified',
          metadata: { 
            ...currentMeta, 
            platform: (lead?.phone || lead?.metadata?.phone) ? platform : 'email',
            preferred_platform: (lead?.phone || lead?.metadata?.phone) ? platform : 'email'
          } 
        }).eq('id', id);
      }
      
      await supabase.from('email_drafts').update({ status: 'approved' }).in('lead_id', selectedIds);
      loadData();
      setSelectedIds([]);
    } catch (error: any) {
      addToast(`Outreach failed: ${error.message}`, "error");
    }
  };

  const handleBulkDeleteLeads = async () => {
    setConfModal({
      isOpen: true,
      title: `Delete ${selectedIds.length} Leads?`,
      message: `Are you sure you want to remove these ${selectedIds.length} profiles? This will permanently delete them from your results and history.`,
      confirmLabel: "Delete Profiles",
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => leadRepo.delete(id)));
          addToast(`Deleted ${selectedIds.length} leads.`, "success");
          setSelectedIds([]);
          loadData();
        } catch (error: any) {
          addToast(`Delete failed: ${error.message}`, "error");
        }
      }
    });
  };

  const firstName = userName.split(" ")[0];
  const selectedCampaign = campaigns.find(c => c.id === activeTab);
  const showMonitor = selectedCampaign && (selectedCampaign.status === 'active' || selectedCampaign.status === 'completed');

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-workspace relative">
      {/* Sidebar: History */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[60] lg:z-10 border-r border-border-subtle bg-bg-base flex flex-col shrink-0 transition-all duration-300 ${isHistoryOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none"}`}>
        <div className="px-6 pt-8 pb-4 flex justify-between items-center whitespace-nowrap">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Search History</h2>
        </div>
        <div className="px-4 mb-4" onClick={handleProfessionSwitch}>
           <div className="bg-bg-workspace border border-border-subtle p-3 rounded-sm shadow-sm hover:border-brand-accent/50 transition-colors cursor-pointer group">
              <span className="text-[9px] uppercase font-bold text-text-secondary block mb-1">Active Profile</span>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <UserCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
                    <span className="text-xs font-semibold truncate">{profession}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-text-secondary group-hover:text-brand-accent transition-colors" />
              </div>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 custom-scrollbar">
          <button onClick={() => setActiveTab("all")} className={`w-full text-left px-4 py-3 rounded-sm text-xs transition-all flex items-center gap-3 ${activeTab === "all" ? "bg-text-primary text-white font-bold shadow-md" : "text-text-secondary hover:bg-bg-workspace font-medium"}`}>
            <Search className="w-4 h-4 shrink-0" /> All Results
          </button>
          {campaigns.length > 0 && <div className="h-px bg-border-subtle my-3 mx-2" />}
          {campaigns.map(camp => (
            <div key={camp.id} className="group relative flex items-center">
              <button onClick={() => setActiveTab(camp.id)} className={`flex-1 text-left px-4 py-3 rounded-sm text-xs transition-all flex items-center justify-between gap-2 ${activeTab === camp.id ? "bg-brand-accent text-white font-bold shadow-md" : "text-text-secondary hover:bg-bg-workspace font-medium"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <History className={`w-4 h-4 shrink-0 ${activeTab === camp.id ? "opacity-100" : "opacity-40"}`} /> 
                  <span className="truncate pr-4">{camp.name}</span>
                </div>
                {camp.status === 'active' && <div className="w-2 h-2 rounded-full animate-pulse bg-white" />}
              </button>
              <button onClick={(e) => handleDeleteCampaign(camp.id, e)} className={`absolute right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === camp.id ? "text-white/50 hover:text-white" : "text-text-secondary hover:text-red-500"}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Toggle Sidebar */}
      <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`absolute top-6 sm:top-10 z-[55] lg:z-50 p-1.5 bg-bg-base border border-border-subtle rounded-md shadow-sm text-text-secondary hover:text-text-primary transition-all duration-300 ${isHistoryOpen ? "left-[274px]" : "left-4 lg:left-6"}`}>
        {isHistoryOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </button>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <div className="px-6 lg:px-12 pt-8 lg:pt-10 pb-3 shrink-0">
          <h1 className="text-xl lg:text-2xl font-medium tracking-tight text-text-primary mb-1">
            {greeting}, <span className="text-brand-accent">{firstName}</span>.
          </h1>
          <p className="text-sm text-text-secondary">Your searches and lead results.</p>
        </div>
        <div className="px-6 lg:px-12 pb-6 shrink-0"><CommandBar /></div>
        
        <div className="flex-1 overflow-y-auto px-6 lg:px-12 pb-12 space-y-8 custom-scrollbar">
          {showMonitor && <ProcessMonitor campaignId={activeTab} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-bg-base border border-border-subtle p-8 group hover:border-brand-accent/30 transition-all relative overflow-hidden">
              <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold block mb-2">Total Leads</span>
              <span className="text-4xl font-light text-text-primary tabular-nums">{totalLeads}</span>
              <Search className="absolute -right-2 -bottom-2 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.06]" />
            </div>
            <div className="bg-bg-base border border-border-subtle p-8 group hover:border-brand-accent/30 transition-all relative overflow-hidden">
              <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold block mb-2">Conversions</span>
              <span className="text-4xl font-light text-brand-accent tabular-nums">{totalConversions}</span>
              <MousePointer2 className="absolute -right-2 -bottom-2 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.06]" />
            </div>
          </div>

          <div className="bg-bg-base border border-border-subtle relative overflow-hidden">
            {/* Bulk Toolbar */}
            <div className={`absolute top-0 inset-x-0 h-[64px] bg-text-primary text-white flex items-center justify-between px-5 lg:px-8 transition-all duration-300 transform ${selectedIds.length > 0 ? "translate-y-0 opacity-100 z-10" : "-translate-y-full opacity-0 pointer-events-none z-0"}`}>
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                   <button onClick={() => handleSelectAll(!(selectedIds.length > 0))} className="text-white hover:text-brand-accent transition-colors">
                     {selectedIds.length > 0 ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4" />}
                   </button>
                   <div className="text-xs font-bold uppercase tracking-widest">{selectedIds.length} Selected</div>
                 </div>
                 <div className="h-4 w-px bg-white/20 hidden sm:block" />
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleBulkOutreach("email")} className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 border border-white/20 transition-colors text-white">Email</button>
                    <button onClick={() => handleBulkOutreach("whatsapp")} className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 border border-white/20 transition-colors text-white">WhatsApp</button>
                    <button onClick={() => handleBulkOutreach("both")} className="text-[10px] font-bold uppercase tracking-widest bg-brand-accent text-white px-4 py-2 hover:scale-105 active:scale-95 transition-transform">Send All</button>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                  <button className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300" onClick={handleBulkDeleteLeads}><Trash2 className="w-3.5 h-3.5 mr-2 inline" />Delete</button>
                  <button className="text-[10px] uppercase font-bold opacity-60 hover:opacity-100" onClick={() => setSelectedIds([])}>Cancel</button>
               </div>
            </div>

            {/* List Header */}
            <div className="px-5 lg:px-8 py-5 border-b border-border-subtle flex items-center justify-between bg-bg-base/80">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    const allFilteredIds = leads.filter(l => {
                      const hp = !!(l.phone || l.metadata?.phone || l.metadata?.original_phone);
                      const he = !!(l.email || l.metadata?.email);
                      if (filterMode === "whatsapp") return hp;
                      if (filterMode === "email") return he;
                      return true;
                    }).map(l => l.id);
                    const isAllSelected = selectedIds.length > 0 && selectedIds.length === allFilteredIds.length;
                    handleSelectAll(!isAllSelected);
                  }}
                  className="text-text-secondary hover:text-brand-accent transition-colors"
                >
                  {selectedIds.length > 0 && selectedIds.length === leads.filter(l => {
                    const hp = !!(l.phone || l.metadata?.phone || l.metadata?.original_phone);
                    const he = !!(l.email || l.metadata?.email);
                    if (filterMode === "whatsapp") return hp;
                    if (filterMode === "email") return he;
                    return true;
                  }).length ? <CheckSquare className="w-4 h-4 text-brand-accent" /> : <Square className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">
                    {activeTab === "all" ? "All Leads" : `Results: ${selectedCampaign?.name || ""}`}
                  </h3>
                  <span className="text-[10px] text-text-secondary">({leads.length})</span>
                </div>
              </div>
              <div className="flex bg-bg-workspace p-1 border border-border-subtle rounded-sm h-8">
                 <button onClick={() => setFilterMode("all")} className={`px-3 text-[9px] font-bold uppercase tracking-widest rounded-sm ${filterMode === "all" ? "bg-bg-base text-text-primary shadow-sm" : "text-text-secondary"}`}>All</button>
                 <button onClick={() => setFilterMode("email")} className={`px-3 text-[9px] font-bold uppercase tracking-widest rounded-sm ${filterMode === "email" ? "bg-bg-base text-brand-accent shadow-sm" : "text-text-secondary"}`}>Email Only</button>
                 <button onClick={() => setFilterMode("whatsapp")} className={`px-3 text-[9px] font-bold uppercase tracking-widest rounded-sm ${filterMode === "whatsapp" ? "bg-bg-base text-brand-accent shadow-sm" : "text-text-secondary"}`}>WhatsApp Only</button>
              </div>
            </div>

            {/* Lead Rows */}
            <div className="divide-y divide-border-subtle">
              {leads.filter(l => {
                const hp = !!(l.phone || l.metadata?.phone || l.metadata?.original_phone);
                const he = !!(l.email || l.metadata?.email);
                if (filterMode === "whatsapp") return hp;
                if (filterMode === "email") return he;
                return true;
              }).map(lead => {
                const hp = !!(lead.phone || lead.metadata?.phone || lead.metadata?.original_phone);
                const he = !!(lead.email || lead.metadata?.email);
                return (
                  <div key={lead.id} className={`flex items-center justify-between px-5 lg:px-8 py-5 hover:bg-bg-workspace group transition-colors gap-4 ${selectedIds.includes(lead.id) ? "bg-bg-workspace/50" : ""}`}>
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleSelect(lead.id); }}
                        className="text-text-secondary transition-all"
                      >
                        {selectedIds.includes(lead.id) ? (
                          <CheckSquare className="w-4 h-4 text-brand-accent" />
                        ) : (
                          <Square className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                      <div className="flex items-center gap-5 flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedLead(lead.id)}>
                        <div className="w-10 h-10 bg-bg-workspace border border-border-subtle flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-text-secondary group-hover:text-brand-accent">{lead.first_name?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text-primary group-hover:text-brand-accent truncate">{lead.first_name} {lead.last_name}</div>
                          <div className="text-[11px] text-text-secondary mt-0.5 truncate">{lead.company || "Unknown"}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {he && <span className="text-[9px] font-bold uppercase px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200">✉ Email</span>}
                      {hp && <span className="text-[9px] font-bold uppercase px-2 py-1 bg-green-50 text-green-600 border border-green-200">📱 WhatsApp</span>}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-text-secondary font-medium uppercase hidden lg:block">{lead.score}%</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${lead.status === 'replied' ? 'bg-brand-accent border-brand-accent text-white' : 'border-border-subtle text-text-secondary'}`}>{lead.status}</span>
                      {(he || hp) && lead.status !== 'contacted' && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead.id); }} className="text-[10px] font-bold uppercase bg-text-primary text-white px-3 py-1 hover:bg-brand-accent transition-all opacity-0 group-hover:opacity-100">Send</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {leads.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Search className="w-8 h-8 text-text-secondary mb-4 opacity-15" />
                  <h4 className="text-sm font-medium text-text-primary mb-1">No leads yet</h4>
                  <p className="text-xs text-text-secondary">Start a search above to find leads.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedLead && <OutreachInspector leadId={selectedLead} onClose={() => setSelectedLead(null)} />}
        
        <ConfirmationModal 
          isOpen={confModal.isOpen}
          title={confModal.title}
          message={confModal.message}
          confirmLabel={confModal.confirmLabel}
          onConfirm={confModal.onConfirm}
          onCancel={() => setConfModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}

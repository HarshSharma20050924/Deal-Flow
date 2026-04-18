import { LeadTable, Lead } from "./LeadTable";
import { OutreachInspector } from "./OutreachInspector";
import { useState, useEffect } from "react";
import { Search, Filter, Trash2, PauseCircle, Download, Calendar } from "lucide-react";
import { useToast } from "./ToastContext";
import { CsvImportModal } from "./CsvImportModal";
import { LeadRepository } from "../repositories/lead.repository";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function Directory() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewState, setViewState] = useState<"data" | "loading" | "empty">("loading");
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "email" | "whatsapp">("all");
  const { addToast } = useToast();
  
  const leadRepo = new LeadRepository();

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterMode === "whatsapp") return matchesSearch && !!l.phone;
    if (filterMode === "email") return matchesSearch && !l.phone;
    return matchesSearch;
  });

  const fetchLeads = async () => {
    setViewState("loading");
    try {
      const data = await leadRepo.findAll();
      // Map internal DB lead to the Lead interface used in the table
      const mappedLeads: Lead[] = data.map(l => ({
        id: l.id,
        name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unknown',
        title: (l.metadata?.title as string) || 'Prospect',
        company: l.company || 'Unknown',
        score: l.score,
        status: l.status.charAt(0).toUpperCase() + l.status.slice(1), // Capitalize
        phone: l.phone || l.metadata?.phone || ''
      }));
      setLeads(mappedLeads);
      setSelectedIds(mappedLeads.map(l => l.id)); // Select all by default
      setViewState(mappedLeads.length > 0 ? "data" : "empty");
    } catch (error: any) {
      addToast(`Failed to fetch leads: ${error.message}`, "error");
      setViewState("empty");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? leads.map(l => l.id) : []);
  };

  const handleBulkOutreach = async (platform: "email" | "whatsapp" | "both") => {
    addToast(`Commencing ${platform} deployment for ${selectedIds.length} profiles...`, "success");
    
    try {
      // Mark all selected leads as 'processing' or 'approved'
      // IMPORTANT: Merge into existing metadata, never replace it
      for (const id of selectedIds) {
        const lead = leads.find(l => l.id === id);
        const { data: existing } = await supabase.from('leads').select('metadata').eq('id', id).single();
        const currentMeta = existing?.metadata || {};
        
        await supabase.from('leads').update({ 
          status: 'qualified',
          metadata: { 
            ...currentMeta, 
            platform: lead?.phone ? platform : 'email',
            preferred_platform: lead?.phone ? platform : 'email'
          } 
        }).eq('id', id);
      }
      
      // Also approve any existing drafts for these leads
      await supabase.from('email_drafts')
        .update({ status: 'approved' })
        .in('lead_id', selectedIds);

      fetchLeads();
      setSelectedIds([]);
    } catch (error: any) {
      addToast(`Outreach initialization failed: ${error.message}`, "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => leadRepo.delete(id)));
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      addToast(`Deleted ${selectedIds.length} lead(s) successfully.`, "success");
      setSelectedIds([]);
    } catch (error: any) {
      addToast(`Failed to delete leads: ${error.message}`, "error");
    }
  };

  const handleCsvImport = () => {
    setShowCsvModal(false);
    fetchLeads(); // Refresh after import
    addToast("Imported new leads from CSV.", "success");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 lg:p-12 relative">
      <div className="mb-0 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-end pb-8 gap-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight mb-2">Directory</h1>
          <p className="text-sm text-text-secondary">Unified contact and validation database.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowCsvModal(true)} className="flex items-center text-sm font-medium border border-border-subtle bg-bg-base hover:border-text-primary px-4 py-2 transition-colors">
            <Download className="w-4 h-4 mr-2" /> Import CSV
          </button>
        </div>
      </div>
      
      {/* Dynamic Action Toolbar or Filter Bar */}
      <div className="h-14 mb-8 shrink-0 w-full relative">
        {/* Bulk Action Toolbar - Slides over the filters when items are selected */}
        <div className={`absolute inset-0 bg-text-primary text-white flex flex-col sm:flex-row items-center justify-between px-4 lg:px-6 py-2 sm:py-0 transition-all duration-300 ${selectedIds.length > 0 ? "translate-y-0 opacity-100 z-10" : "translate-y-4 opacity-0 pointer-events-none z-0"}`}>
           <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
             <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{selectedIds.length} Selected</div>
             <div className="hidden sm:block h-4 w-px bg-white/20" />
             <div className="flex items-center gap-2">
                <button onClick={() => handleBulkOutreach("email")} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 border border-white/20 transition-colors">Email</button>
                <button onClick={() => handleBulkOutreach("whatsapp")} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 border border-white/20 transition-colors">WhatsApp</button>
                <button onClick={() => handleBulkOutreach("both")} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-brand-accent text-white px-3 py-1.5 transition-colors">Send All</button>
             </div>
           </div>
           
           <div className="flex items-center justify-between w-full sm:w-auto sm:gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
              <button className="flex items-center text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition-colors" onClick={handleBulkDelete}>
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </button>
              <button className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-all ml-4" onClick={() => setSelectedIds([])}>Cancel</button>
           </div>
        </div>

        {/* Filter Bar */}
        <div className={`absolute inset-0 flex flex-col md:flex-row items-center gap-4 transition-transform duration-300 ${selectedIds.length === 0 ? "translate-y-0 opacity-100 z-10" : "-translate-y-4 opacity-0 pointer-events-none z-0"}`} style={{ opacity: viewState === "data" ? 1 : 0.5, pointerEvents: viewState === "data" ? "auto" : "none" }}>
          <div className="w-full md:flex-1 flex items-center bg-bg-base border border-border-subtle px-4 h-10">
            <Search className="w-4 h-4 text-text-secondary mr-3" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..." 
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#BBBBBB]"
            />
          </div>

          <div className="flex bg-bg-workspace p-1 border border-border-subtle rounded-sm h-10 w-full sm:w-auto">
             <button onClick={() => setFilterMode("all")} className={`px-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${filterMode === "all" ? "bg-bg-base text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>All</button>
             <button onClick={() => setFilterMode("email")} className={`px-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${filterMode === "email" ? "bg-bg-base text-brand-accent shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>Email Only</button>
             <button onClick={() => setFilterMode("whatsapp")} className={`px-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${filterMode === "whatsapp" ? "bg-bg-base text-brand-accent shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>WhatsApp Only</button>
          </div>
          
          {/* Advanced Multi-layered Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex flex-1 md:flex-none items-center justify-center h-10 px-4 bg-bg-base border border-border-subtle hover:border-text-primary text-sm transition-colors text-text-secondary hover:text-text-primary relative group cursor-pointer">
              <Calendar className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Date Added</span>
              <div className="absolute top-full mt-2 right-0 w-48 bg-bg-base border border-border-subtle shadow-xl hidden group-hover:block z-50 p-2">
                <button className="w-full text-left px-3 py-2 hover:bg-bg-workspace text-sm">Last 24 Hours</button>
                <button className="w-full text-left px-3 py-2 hover:bg-bg-workspace text-sm">Last 7 Days</button>
                <button className="w-full text-left px-3 py-2 hover:bg-bg-workspace text-sm">This Month</button>
              </div>
            </div>
            <button className="flex flex-1 md:flex-none items-center justify-center h-10 px-4 bg-bg-base border border-border-subtle hover:border-text-primary text-sm transition-colors text-text-secondary hover:text-text-primary">
              <Filter className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Status:</span> All
            </button>
            <button className="flex flex-1 md:flex-none items-center justify-center h-10 px-4 bg-bg-base border border-border-subtle hover:border-text-primary text-sm transition-colors text-text-secondary hover:text-text-primary">
              <Filter className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Score:</span> &gt;80
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        <LeadTable 
          leads={viewState === "empty" ? [] : filteredLeads}
          onReview={setSelectedLead} 
          isLoading={viewState === "loading"} 
          isEmpty={viewState === "empty" || (viewState === "data" && filteredLeads.length === 0)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onLaunchOperation={() => {}}
        />
        {selectedLead && (
          <OutreachInspector leadId={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </div>

      {showCsvModal && (
        <CsvImportModal 
          onClose={() => setShowCsvModal(false)} 
          onImport={handleCsvImport} 
        />
      )}
    </div>
  );
}

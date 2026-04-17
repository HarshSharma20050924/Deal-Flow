import { LeadTable, Lead } from "./LeadTable";
import { OutreachInspector } from "./OutreachInspector";
import { useState } from "react";
import { Search, Filter, Trash2, PauseCircle, Download, Calendar } from "lucide-react";
import { useToast } from "./ToastContext";
import { CsvImportModal } from "./CsvImportModal";

const INITIAL_LEADS: Lead[] = [
  { id: "1", name: "Elena Rostova", title: "CEO", company: "FinPay Berlin", score: 94, status: "Replied" },
  { id: "2", name: "Marcus Schmidt", title: "Founder", company: "LedgerHQ", score: 88, status: "Pending Send" },
  { id: "3", name: "Sarah Jenkins", title: "VP Product", company: "Vault OS", score: 85, status: "Emailed" },
  { id: "4", name: "David Chen", title: "Co-Founder", company: "Apex Finance", score: 91, status: "Drafted" },
  { id: "5", name: "Nina Ivanov", title: "CEO", company: "Nexus Capital", score: 82, status: "Researching" },
];

export function Directory() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewState, setViewState] = useState<"data" | "loading" | "empty">("data");
  const [showCsvModal, setShowCsvModal] = useState(false);
  const { addToast } = useToast();

  const handleSimulateCrash = () => {
    addToast("Fatal connection error to PostgreSQL cluster.", "error");
    setTimeout(() => {
      throw new Error("Unable to fetch leads from database. Connection refused.");
    }, 1000);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? leads.map(l => l.id) : []);
  };

  const handleBulkDelete = () => {
    setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
    addToast(`Deleted ${selectedIds.length} lead(s) successfully.`, "success");
    setSelectedIds([]);
  };

  const handleCsvImport = () => {
    setShowCsvModal(false);
    addToast("Imported 12 new leads from CSV.", "success");
    const newLeads: Lead[] = [
      { id: Math.random().toString(), name: "James Holden", title: "Captain", company: "Rocinante Inc", score: 99, status: "Newly Imported" },
      { id: Math.random().toString(), name: "Amos Burton", title: "Mechanic", company: "Rocinante Inc", score: 65, status: "Newly Imported" }
    ];
    setLeads(prev => [...newLeads, ...prev]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-12 relative">
      <div className="mb-0 shrink-0 flex justify-between items-end pb-8">
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
        <div className={`absolute inset-0 bg-text-primary text-white flex items-center justify-between px-6 transition-transform duration-300 ${selectedIds.length > 0 ? "translate-y-0 opacity-100 z-10" : "translate-y-4 opacity-0 pointer-events-none z-0"}`}>
           <div className="text-sm font-medium">{selectedIds.length} leads selected</div>
           <div className="flex items-center gap-4">
              <button className="flex items-center text-sm font-medium hover:text-text-secondary transition-colors" onClick={() => { addToast(`Paused outreach for ${selectedIds.length} leads`, "info"); setSelectedIds([]); }}>
                <PauseCircle className="w-4 h-4 mr-2" /> Pause Outreach
              </button>
              <button className="flex items-center text-sm font-medium text-red-400 hover:text-red-300 transition-colors" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button className="text-sm ml-4 border border-white/20 px-3 py-1 hover:bg-white/10 transition-colors" onClick={() => setSelectedIds([])}>Cancel</button>
           </div>
        </div>

        {/* Filter Bar */}
        <div className={`absolute inset-0 flex items-center gap-4 transition-transform duration-300 ${selectedIds.length === 0 ? "translate-y-0 opacity-100 z-10" : "-translate-y-4 opacity-0 pointer-events-none z-0"}`} style={{ opacity: viewState === "data" ? 1 : 0.5, pointerEvents: viewState === "data" ? "auto" : "none" }}>
          <div className="flex-1 flex items-center bg-bg-base border border-border-subtle px-4 h-10">
            <Search className="w-4 h-4 text-text-secondary mr-3" />
            <input 
              type="text" 
              placeholder="Search by name, company, or domain..." 
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#BBBBBB]"
            />
          </div>
          
          {/* Advanced Multi-layered Filters */}
          <div className="flex gap-2">
            <button className="flex items-center h-10 px-4 bg-bg-base border border-border-subtle hover:border-text-primary text-sm transition-colors text-text-secondary hover:text-text-primary relative group">
              <Calendar className="w-4 h-4 mr-2" /> Date Added
              <div className="absolute top-full mt-2 right-0 w-48 bg-bg-base border border-border-subtle shadow-xl hidden group-hover:block z-50 p-2">
                <button className="w-full text-left px-3 py-2 hover:bg-bg-workspace text-sm">Last 24 Hours</button>
                <button className="w-full text-left px-3 py-2 hover:bg-bg-workspace text-sm">Last 7 Days</button>
                <button className="w-full text-left px-3 py-2 hover:bg-bg-workspace text-sm">This Month</button>
              </div>
            </button>
            <button className="flex items-center h-10 px-4 bg-bg-base border border-border-subtle hover:border-text-primary text-sm transition-colors text-text-secondary hover:text-text-primary">
              <Filter className="w-4 h-4 mr-2" /> Status: All
            </button>
            <button className="flex items-center h-10 px-4 bg-bg-base border border-border-subtle hover:border-text-primary text-sm transition-colors text-text-secondary hover:text-text-primary">
              <Filter className="w-4 h-4 mr-2" /> Score: &gt;80
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        <LeadTable 
          leads={viewState === "empty" ? [] : leads}
          onReview={setSelectedLead} 
          isLoading={viewState === "loading"} 
          isEmpty={viewState === "empty" || (viewState === "data" && leads.length === 0)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onLaunchOperation={() => {}}
        />
        {selectedLead && (
          <OutreachInspector onClose={() => setSelectedLead(null)} />
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

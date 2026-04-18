import React from "react";
import { Database, CheckSquare, Square } from "lucide-react";

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
  status: string;
  phone?: string;
}

const STATUS_STYLE: Record<string, string> = {
  "Researching": "bg-brand-accent-subtle text-brand-accent",
  "Drafted": "bg-[#F5F5F5] text-text-secondary",
  "Pending Send": "bg-[#FFF8E1] text-[#F57F17]",
  "Emailed": "bg-[#E3F2FD] text-[#1565C0]",
  "Replied": "bg-brand-accent text-white",
  "Newly Imported": "bg-[#E3F2FD] text-[#1565C0]",
};

interface LeadTableProps {
  leads: Lead[];
  onReview: (id: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onLaunchOperation: () => void;
}

export function LeadTable({ 
  leads, 
  onReview, 
  isLoading = false, 
  isEmpty = false,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onLaunchOperation
}: LeadTableProps) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Qualified Leads</h2>
          <span className="text-xs text-text-secondary uppercase tracking-widest italic opacity-50">Syncing...</span>
        </div>
        <div className="w-full border border-border-subtle bg-bg-base">
          <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 items-center border-b border-border-subtle px-6 py-3">
             <div className="w-4 h-4 bg-[#F5F5F5] border border-border-subtle" />
             <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Contact</div>
             <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Confidence</div>
             <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Status</div>
             <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider text-right">Action</div>
          </div>
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-5 ${i !== 4 ? "border-b border-border-subtle" : ""}`}>
                <div className="w-4 h-4 bg-[#E6E6E6] animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-32 bg-[#E6E6E6] animate-pulse"></div>
                  <div className="h-3 w-24 bg-[#F5F5F5] animate-pulse"></div>
                </div>
                <div><div className="h-4 w-12 bg-[#E6E6E6] animate-pulse"></div></div>
                <div><div className="h-4 w-20 bg-[#F5F5F5] animate-pulse"></div></div>
                <div className="flex justify-end"><div className="h-4 w-16 bg-[#E6E6E6] animate-pulse"></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full border border-border-subtle bg-bg-base p-16 flex flex-col items-center justify-center text-center">
        <Database className="w-8 h-8 text-text-secondary mb-4 opacity-50" />
        <h3 className="text-sm font-medium mb-1">No Targets Acquired</h3>
        <p className="text-xs text-text-secondary mb-6">Your directory is currently empty. Launch an operation or import a CSV to begin.</p>
        <button onClick={onLaunchOperation} className="text-xs font-medium border border-border-subtle hover:border-text-primary transition-colors px-4 py-2">
          Launch Operation
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Qualified Leads</h2>
        <span className="text-xs text-text-secondary uppercase tracking-widest">{leads.length} matches</span>
      </div>
      
      <div className="w-full border border-border-subtle bg-bg-base overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 items-center border-b border-border-subtle px-6 py-3">
            <button onClick={() => onSelectAll(!allSelected)} className="text-text-secondary hover:text-text-primary transition-colors">
              {allSelected ? <CheckSquare className="w-4 h-4 text-brand-accent" /> : <Square className="w-4 h-4" />}
            </button>
            <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Contact</div>
            <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Confidence</div>
            <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Status</div>
            <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider text-right">Action</div>
          </div>
          
          <div className="flex flex-col">
            {leads.map((lead, i) => {
              const isSelected = selectedIds.includes(lead.id);
              return (
                <div 
                  key={lead.id} 
                  className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 group transition-colors hover:bg-bg-workspace ${i !== leads.length - 1 ? "border-b border-border-subtle" : ""} ${isSelected ? "bg-bg-workspace" : ""}`}
                >
                  <button onClick={() => onToggleSelect(lead.id)} className="text-text-secondary transition-colors">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-brand-accent" /> : <Square className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">{lead.name}</span>
                    <span className="text-xs text-text-secondary mt-0.5">{lead.title}, {lead.company}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-text-primary font-medium">{lead.score}/100</span>
                  </div>
                  <div className="flex items-start">
                    <span className={`text-[11px] font-medium px-2 py-0.5 min-w-20 text-center ${STATUS_STYLE[lead.status] || "bg-bg-workspace text-text-secondary"}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    {lead.phone && (
                      <a 
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-accent hover:opacity-80 transition-opacity"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button 
                      onClick={() => onReview(lead.id)}
                      className="text-xs font-medium text-text-secondary hover:text-brand-accent transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

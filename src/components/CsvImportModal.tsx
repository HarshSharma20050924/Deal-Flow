import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, ArrowRight, X, AlertCircle } from "lucide-react";

interface Props {
  onClose: () => void;
  onImport: () => void;
}

export function CsvImportModal({ onClose, onImport }: Props) {
  const [step, setStep] = useState<"upload" | "map" | "importing">("upload");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTimeout(() => setStep("map"), 600);
    }
  };

  const handleImport = () => {
    setStep("importing");
    setTimeout(() => {
      onImport();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-workspace/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-base border border-border-subtle w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-sm font-medium tracking-wide uppercase">Import Contacts</h2>
          {!['importing'].includes(step) && (
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-8">
          {step === "upload" && (
            <div className="flex flex-col items-center">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border-subtle hover:border-text-primary bg-bg-workspace p-16 flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 bg-bg-base border border-border-subtle rounded-full flex items-center justify-center mb-4 group-hover:bg-text-primary group-hover:text-white transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium mb-1">Drag and drop your CSV</h3>
                <p className="text-xs text-text-secondary">or click to browse from your computer</p>
              </div>
            </div>
          )}

          {step === "map" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-medium tracking-tight mb-2">Map Columns</h3>
                <p className="text-sm text-text-secondary">Match the columns from "{file?.name}" to the system database fields.</p>
              </div>

              <div className="border border-border-subtle bg-bg-workspace p-4 mb-8 space-y-4">
                 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div className="text-sm font-medium px-3 py-2 bg-text-primary text-white text-center">First Name</div>
                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                    <select className="text-sm border border-border-subtle bg-bg-base px-3 py-2 outline-none focus:border-brand-accent">
                       <option>firstName</option>
                       <option>name</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div className="text-sm font-medium px-3 py-2 bg-text-primary text-white text-center">Company</div>
                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                    <select className="text-sm border border-border-subtle bg-bg-base px-3 py-2 outline-none focus:border-brand-accent">
                       <option>organization</option>
                       <option>company_name</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div className="text-sm font-medium px-3 py-2 bg-text-primary text-white text-center opacity-50">LinkedIn URL</div>
                    <ArrowRight className="w-4 h-4 text-text-secondary opacity-50" />
                    <select className="text-sm border border-border-subtle bg-bg-base px-3 py-2 outline-none focus:border-brand-accent text-text-secondary">
                       <option>-- Ignore Field --</option>
                       <option>url</option>
                    </select>
                 </div>
              </div>

              <div className="flex justify-end gap-4">
                 <button onClick={() => setStep("upload")} className="px-6 py-2 text-sm text-text-secondary hover:text-text-primary">Back</button>
                 <button onClick={handleImport} className="px-6 py-2 text-sm font-medium bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors">Start Import</button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-500">
               <div className="w-12 h-12 rounded-full border border-brand-accent border-t-transparent animate-spin mb-6" />
               <h3 className="text-lg font-medium tracking-tight mb-2">Importing & Scoring Leads...</h3>
               <p className="text-sm text-text-secondary">Resolving domains and assigning AI confidence scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

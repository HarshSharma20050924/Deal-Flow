import React, { useState } from "react";
import { ArrowRight, Terminal, X, Play, Loader2, GitMerge } from "lucide-react";

export function CommandBar() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const handleRun = () => {
    if (!prompt) return;
    setIsProcessing(true);
    // Simulate AI parsing the user's prompt into targeting filters
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(true);
    }, 1200);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate campaign launch
    setTimeout(() => {
      setIsDeploying(false);
      setShowModal(false);
      setDeployed(true);
      setPrompt("");
      setTimeout(() => setDeployed(false), 4000);
    }, 1500);
  };

  return (
    <>
      <div className="relative flex items-center bg-bg-base border border-border-subtle p-2 group focus-within:border-text-primary transition-colors">
        <Terminal className="w-4 h-4 text-text-secondary ml-3 mr-4 shrink-0" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Define criteria (e.g., 'Seed-stage fintech in London')"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#BBBBBB]"
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
        />
        <button
          onClick={handleRun}
          disabled={isProcessing || !prompt}
          className="ml-4 px-6 py-2.5 bg-text-primary hover:bg-transparent hover:text-text-primary text-white hover:border-text-primary text-sm font-medium transition-colors border border-text-primary flex items-center h-full disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Run <ArrowRight className="ml-2 w-4 h-4" /></>}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-workspace/80 backdrop-blur-sm animate-in fade-in duration-200 text-text-primary">
          <div className="bg-bg-base border border-border-subtle w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-workspace">
              <h2 className="text-[11px] font-medium tracking-widest uppercase">Operation Deployment Brief</h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 space-y-8 text-sm">
              <div className="grid grid-cols-[1fr_2fr] gap-8 items-start">
                 <span className="text-text-secondary text-xs font-medium uppercase tracking-wider pt-1">Parsed Objective</span>
                 <span className="font-medium text-lg leading-snug">"{prompt}"</span>
              </div>
              
              <div className="grid grid-cols-[1fr_2fr] gap-8 border-t border-border-subtle pt-8">
                 <span className="text-text-secondary text-xs font-medium uppercase tracking-wider pt-1">Target Synthesis</span>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                       <span className="text-xs text-text-secondary">Location</span>
                       <span className="font-mono text-xs">Parsed Dynamically</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                       <span className="text-xs text-text-secondary">Industry</span>
                       <span className="font-mono text-xs">Parsed Dynamically</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                       <span className="text-xs text-text-secondary">Decision Maker</span>
                       <span className="font-mono text-xs">C-Level, VP, Founder</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-accent font-medium mt-4 pt-2">
                       <span>Estimated Lead Pool</span>
                       <span className="text-base">~1,420 profiles</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-8 border-t border-border-subtle pt-8">
                 <span className="text-text-secondary text-xs font-medium uppercase tracking-wider pt-1">Assigned Sequence</span>
                 <div className="flex items-center justify-between border border-border-subtle p-4 bg-bg-workspace">
                    <div className="flex items-center gap-3">
                       <GitMerge className="w-4 h-4 text-brand-accent" />
                       <span className="font-medium">Enterprise Core Outreach</span>
                    </div>
                    <button className="text-xs border border-border-subtle bg-bg-base px-3 py-1 hover:border-text-primary transition-colors">Change</button>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex justify-end bg-bg-workspace gap-4">
               <button 
                 onClick={() => setShowModal(false)} 
                 className="px-6 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleDeploy}
                 disabled={isDeploying}
                 className="flex items-center text-sm font-medium border border-border-subtle hover:border-brand-accent hover:bg-brand-accent hover:text-white transition-colors bg-text-primary text-white px-6 py-2 disabled:opacity-50"
               >
                 {isDeploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                 {isDeploying ? "Deploying..." : "Launch Operation"}
               </button>
            </div>
          </div>
        </div>
      )}

      {deployed && (
        <div className="fixed bottom-12 right-12 z-50 bg-text-primary border border-text-primary text-white text-xs px-6 py-4 font-medium shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse mr-3" />
          Operation deployed. Sourcing and enriching leads in background.
        </div>
      )}
    </>
  );
}

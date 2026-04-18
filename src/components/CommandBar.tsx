import React, { useState } from "react";
import { ArrowRight, Terminal, X, Play, Loader2, GitMerge } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ToastContext";

export function CommandBar() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const { addToast } = useToast();

  const handleRun = async () => {
    if (!prompt) return;
    setIsProcessing(true);

    try {
      // Rate Limit Check
      const today = new Date();
      today.setHours(today.getHours() - 24);
      const { count: dailyCount, data: recentCampaigns } = await supabase
        .from('campaigns')
        .select('created_at', { count: 'exact' })
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: true });
        
      if (dailyCount && dailyCount >= 3 && recentCampaigns && recentCampaigns.length > 0) {
         const oldest = new Date(recentCampaigns[0].created_at);
         oldest.setHours(oldest.getHours() + 24);
         const timeString = oldest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         addToast(`Daily limit reached (3/3 completed). You can resume service tomorrow at ${timeString}.`, "error");
         setIsProcessing(false);
         return;
      }

      // Simulate AI parsing the user's prompt into targeting filters if pass limit check
      setTimeout(() => {
        setIsProcessing(false);
        setShowModal(true);
      }, 1200);
    } catch (e: any) {
      addToast(`Error verifying limits: ${e.message}`, "error");
      setIsProcessing(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const { CampaignRepository } = await import("../repositories/campaign.repository");
      const repo = new CampaignRepository();
      
      const { data: { user } } = await supabase.auth.getUser();
      const profession = user?.user_metadata?.profession || "Standard Service";
      
      const campaignName = `${prompt.charAt(0).toUpperCase() + prompt.slice(1)}`;
      await repo.create({
        name: campaignName,
        status: 'active',
        targeting_query: prompt,
        metadata: {
          location: prompt.includes('in ') ? prompt.split('in ')[1].split(' ')[0] : 'Global',
          industry: prompt.split(' ')[0],
          profession: profession,
          is_new_session: true
        }
      });

      // Feedback delay
      setTimeout(() => {
        setIsDeploying(false);
        setShowModal(false);
        setDeployed(true);
        // Do not clear prompt immediately so it can be "regenerated" or kept for context
        // setPrompt(""); 
        setTimeout(() => setDeployed(false), 4000);
        // Refresh dashboard to show new tab (handled by dashboard polling or subscription)
      }, 1000);
    } catch (error: any) {
      console.error("Campaign creation failed:", error);
      setIsDeploying(false);
    }
  };

  return (
    <>
      <div className="relative flex items-center bg-bg-base border border-border-subtle p-1 sm:p-2 group focus-within:border-text-primary transition-colors">
        <Terminal className="hidden sm:block w-4 h-4 text-text-secondary ml-3 mr-4 shrink-0" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Who are we looking for?"
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-[#BBBBBB] px-3 sm:px-0 h-10"
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
        />
        <div className="flex gap-1 sm:gap-2">
           {prompt && (
             <button 
               onClick={() => setPrompt("")}
               className="p-2 text-text-secondary hover:text-red-500 transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
           )}
           <button
             onClick={handleRun}
             disabled={isProcessing || !prompt}
             className="px-4 sm:px-6 py-2 bg-text-primary hover:bg-transparent hover:text-text-primary text-white hover:border-text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all border border-text-primary flex items-center shrink-0 disabled:opacity-50"
           >
             {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><span className="hidden sm:inline">Search</span> <ArrowRight className="sm:ml-2 w-3 h-3" /></>}
           </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-workspace/80 backdrop-blur-sm animate-in fade-in duration-200 text-text-primary">
          <div className="bg-bg-base border border-border-subtle w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-workspace">
              <h2 className="text-[11px] font-medium tracking-widest uppercase">Search Parameters</h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 text-sm max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] gap-2 sm:gap-8 items-start">
                 <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest pt-1">Objective</span>
                 <span className="font-medium text-base lg:text-lg leading-tight text-text-primary">"{prompt}"</span>
              </div>
              
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] gap-4 sm:gap-8 border-t border-border-subtle pt-6 lg:pt-8">
                 <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest pt-1">Targeting</span>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border-subtle/50">
                       <span className="text-xs text-text-secondary">Location</span>
                       <span className="font-mono text-[11px] bg-bg-workspace px-2 py-0.5 border border-border-subtle">{prompt.includes('in ') ? prompt.split('in ')[1].split(' ')[0] : 'Global'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border-subtle/50">
                       <span className="text-xs text-text-secondary">Industry</span>
                       <span className="font-mono text-[11px] bg-bg-workspace px-2 py-0.5 border border-border-subtle">{prompt.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-accent font-bold mt-4 pt-2">
                       <span className="text-[10px] uppercase tracking-wider">Estimated Leads</span>
                       <span className="text-lg">~{Math.floor(Math.random() * 50) + 20}+</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] gap-4 sm:gap-8 border-t border-border-subtle pt-6 lg:pt-8">
                 <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest pt-1">Automated Flow</span>
                 <div className="flex items-center justify-between border border-border-subtle p-4 bg-bg-workspace/50">
                    <div className="flex items-center gap-3">
                       <GitMerge className="w-4 h-4 text-brand-accent" />
                       <span className="font-semibold text-xs tracking-tight">AI Outreach</span>
                    </div>
                    <div className="hidden sm:block text-[10px] font-bold text-text-secondary bg-bg-base border border-border-subtle px-2 py-1 uppercase tracking-widest">Live</div>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex flex-col sm:flex-row justify-end bg-bg-workspace gap-3 sm:gap-4">
               <button 
                 onClick={() => setShowModal(false)} 
                 className="order-2 sm:order-1 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleDeploy}
                 disabled={isDeploying}
                 className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3 bg-text-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-accent transition-all active:scale-95 shadow-lg disabled:opacity-50"
               >
                 {isDeploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                 {isDeploying ? "Launching..." : "Deploy Engine"}
               </button>
            </div>
          </div>
        </div>
      )}

      {deployed && (
        <div className="fixed bottom-12 right-12 z-50 bg-text-primary border border-text-primary text-white text-xs px-6 py-4 font-medium shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse mr-3" />
          Search started. Finding and verifying leads in the background.
        </div>
      )}
    </>
  );
}

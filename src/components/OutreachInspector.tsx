import { X, Loader2, Send, Mail, MessageCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ToastContext";

interface OutreachInspectorProps {
  leadId: string;
  onClose: () => void;
}

export function OutreachInspector({ leadId, onClose }: OutreachInspectorProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [leadId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
      const { data: draftData } = await supabase.from('email_drafts').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });

      setData(lead);
      setDrafts(draftData || []);
    } catch (e) {
      console.error("Error fetching lead data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!data) return;
    addToast("Re-generating drafts via AI...", "info");
    setLoading(true);
    try {
      // Delete all current drafts for this lead
      await supabase.from('email_drafts').delete().eq('lead_id', data.id);
      
      // Mark lead as 'new' so the ghostwriter picks it up
      await supabase.from('leads').update({ status: 'new' }).eq('id', data.id);
      
      // Poll for new drafts
      const interval = setInterval(async () => {
        const { data: newDrafts } = await supabase
          .from('email_drafts')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });
          
        if (newDrafts && newDrafts.length > 0) {
          clearInterval(interval);
          setDrafts(newDrafts);
          setLoading(false);
          addToast("New drafts ready!", "success");
        }
      }, 2000);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
      }, 30000);
    } catch (e: any) {
      addToast(`Regeneration failed: ${e.message}`, "error");
      setLoading(false);
    }
  };

  const handleSend = async (draftId: string, channel: 'email' | 'whatsapp') => {
    try {
      await supabase.from('email_drafts').update({ status: 'approved' }).eq('id', draftId);
      await supabase.from('leads').update({ status: 'contacted' }).eq('id', data.id);
      addToast(`${channel === 'whatsapp' ? '📱 WhatsApp' : '✉️ Email'} message approved & queued.`, "success");
      fetchData(); // Refresh
    } catch (error: any) {
      addToast(`Error: ${error.message}`, "error");
    }
  };

  const handleSendAll = async () => {
    try {
      // Approve all drafts
      await Promise.all(drafts.map(d => 
        supabase.from('email_drafts').update({ status: 'approved' }).eq('id', d.id)
      ));
      await supabase.from('leads').update({ status: 'contacted' }).eq('id', data.id);
      addToast("All channels approved & queued! 🚀", "success");
      onClose();
    } catch (error: any) {
      addToast(`Error: ${error.message}`, "error");
    }
  };

  // Derived contact info
  const phone = data?.phone || data?.metadata?.phone || data?.metadata?.original_phone;
  const email = data?.email || data?.metadata?.email;
  const website = data?.metadata?.website;
  const emailDraft = drafts.find(d => d.subject !== 'WhatsApp');
  const whatsappDraft = drafts.find(d => d.subject === 'WhatsApp');

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex justify-end">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-2xl h-full bg-bg-base shadow-2xl border-l border-border-subtle flex items-center justify-center animate-in slide-in-from-right duration-500">
          <Loader2 className="w-6 h-6 animate-spin text-text-secondary opacity-20" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Side Sheet */}
      <div className="relative w-full max-w-2xl h-full bg-bg-base shadow-2xl border-l border-border-subtle flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-workspace">
           <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Lead Intel & Outreach</h2>
           <button 
             onClick={onClose}
             className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors"
           >
             <X className="w-5 h-5 stroke-[2]" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col">
            {/* Lead Info Section */}
            <div className="p-8 lg:p-10 border-b border-border-subtle">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-6">Contact Details</h2>
              <div className="flex flex-col gap-1">
                <span className="text-xl lg:text-2xl font-medium text-text-primary tracking-tight">{data.first_name} {data.last_name}</span>
                <span className="text-base text-text-secondary">{data.company}</span>
              </div>

              {/* Channel Badges */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-2 py-1 bg-bg-workspace border border-border-subtle text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                  Score: {data.score}%
                </span>
                {email && (
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                    ✉ {email}
                  </span>
                )}
                {phone && (
                  <span className="px-2 py-1 bg-green-50 border border-green-200 text-[9px] font-bold uppercase tracking-wider text-green-600">
                    📱 {phone}
                  </span>
                )}
                {website && (
                  <a href={website} target="_blank" className="px-2 py-1 bg-bg-workspace border border-border-subtle text-[9px] font-bold uppercase tracking-wider text-text-secondary hover:text-brand-accent transition-colors">
                    🌐 Website
                  </a>
                )}
                {!email && !phone && (
                  <span className="px-2 py-1 bg-red-50 border border-red-200 text-[9px] font-bold uppercase tracking-wider text-red-500">
                    No Contact Info
                  </span>
                )}
              </div>

              {/* Source */}
              <div className="bg-bg-workspace p-4 border border-border-subtle mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary font-medium">
                    Found via {data.metadata?.source === 'Auto-Server' ? 'Automated Discovery' : 'Manual'} · {new Date(data.created_at).toLocaleDateString()}
                  </span>
                  <span className={`text-[9px] uppercase font-bold ${data.status === 'contacted' ? 'text-green-500' : data.status === 'drafted' ? 'text-brand-accent' : 'text-text-secondary'}`}>
                    {data.status}
                  </span>
                </div>
              </div>
            </div>
    
            {/* Drafts Section */}
            <div className="p-8 lg:p-10 flex flex-col bg-bg-workspace/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">AI Drafted Messages</h2>
                <div className="flex w-full sm:w-auto gap-2">
                  <button 
                    onClick={handleRegenerate}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-border-subtle px-4 py-2 hover:bg-bg-workspace transition-colors bg-bg-base"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                  {drafts.length > 0 && (
                    <button 
                      onClick={handleSendAll}
                      className="flex-1 sm:flex-none group flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-text-primary text-white px-5 py-2 hover:opacity-90 transition-all active:scale-95 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send All
                    </button>
                  )}
                </div>
              </div>

              {drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-bg-base border border-border-subtle">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-accent mb-4 opacity-40" />
                  <p className="text-text-secondary italic text-xs">AI is drafting messages for available channels...</p>
                  <p className="text-text-secondary text-[10px] mt-2">This usually takes 10-30 seconds</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Email Draft */}
                  {emailDraft && (
                    <div className="bg-bg-base border border-border-subtle">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-workspace">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Email Draft</span>
                          {email && <span className="text-[9px] text-text-secondary">→ {email}</span>}
                        </div>
                        <button
                          onClick={() => handleSend(emailDraft.id, 'email')}
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 transition-all active:scale-95 ${emailDraft.status === 'approved' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-text-primary text-white hover:opacity-90'}`}
                        >
                          {emailDraft.status === 'approved' ? '✓ Sent' : 'Send Email'}
                        </button>
                      </div>
                      <div className="p-6">
                        <div className="mb-4 pb-3 border-b border-border-subtle">
                          <span className="text-[9px] uppercase font-bold text-text-secondary block mb-1 tracking-widest">Subject</span>
                          <p className="font-medium text-text-primary">{emailDraft.subject}</p>
                        </div>
                        <div className="whitespace-pre-wrap text-text-secondary leading-relaxed text-[13px]">
                          {emailDraft.body}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Draft */}
                  {whatsappDraft && (
                    <div className="bg-bg-base border border-border-subtle">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-workspace">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">WhatsApp Draft</span>
                          {phone && <span className="text-[9px] text-text-secondary">→ {phone}</span>}
                        </div>
                        <button
                          onClick={() => handleSend(whatsappDraft.id, 'whatsapp')}
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 transition-all active:scale-95 ${whatsappDraft.status === 'approved' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-green-500 text-white hover:opacity-90'}`}
                        >
                          {whatsappDraft.status === 'approved' ? '✓ Sent' : 'Send WhatsApp'}
                        </button>
                      </div>
                      <div className="p-6">
                        <div className="whitespace-pre-wrap text-text-secondary leading-relaxed text-[13px]">
                          {whatsappDraft.body}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

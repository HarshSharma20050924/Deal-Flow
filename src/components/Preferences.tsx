import React, { useState } from "react";
import { useToast } from "./ToastContext";
import { Send, Users, Shield, CreditCard, ChevronDown, Check } from "lucide-react";

export function Preferences() {
  const { addToast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Operator");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  const [pendingInvites, setPendingInvites] = useState<{email: string, role: string}[]>([]);

  const handleCopy = () => {
    addToast("API Key securely copied to clipboard.", "success");
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    addToast(`Inviting ${inviteEmail} as ${inviteRole}...`, "info");
    
    setTimeout(() => {
      addToast(`Invitation delivered to ${inviteEmail}.`, "success");
      setPendingInvites([...pendingInvites, { email: inviteEmail, role: inviteRole }]);
      setInviteEmail("");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-12 max-w-5xl relative">
      <div className="mb-12">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Preferences</h1>
        <p className="text-sm text-text-secondary">System, account, and billing configuration.</p>
      </div>

      <div className="space-y-12">
        {/* TEAM & RBAC MANAGEMENT */}
        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">Workspace Team</h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">Manage members and Role-Based Access Control (RBAC).</p>
            <div className="bg-bg-workspace p-4 border border-border-subtle">
              <div className="flex items-start gap-3">
                 <Shield className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-[11px] font-medium text-text-primary uppercase tracking-wider mb-1">Strict Access</h4>
                    <p className="text-xs text-text-secondary">Operators can manage campaigns. Viewers have read-only access. Only Owners can manage billing.</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="bg-bg-base p-8 border border-border-subtle flex flex-col">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <h3 className="text-sm font-medium">Active Members</h3>
                <span className="text-xs text-text-secondary">1 / 5 Seats Used</span>
            </div>
            
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-text-primary rounded-full flex items-center justify-center text-bg-base text-sm font-medium">
                   AR
                 </div>
                 <div>
                   <div className="text-sm font-medium">Alex Rostov (You)</div>
                   <div className="text-xs text-text-secondary mt-0.5">alex@dealflow.io</div>
                 </div>
               </div>
               <span className="text-[11px] font-medium px-2 py-0.5 bg-bg-workspace border border-border-subtle text-text-secondary uppercase tracking-widest">
                 Owner
               </span>
            </div>

            {pendingInvites.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Pending Invitations</h3>
                {pendingInvites.map((invite, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 opacity-70">
                     <span className="text-sm text-text-secondary">{invite.email}</span>
                     <div className="flex items-center gap-3">
                       <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{invite.role}</span>
                       <button className="text-[10px] uppercase text-text-secondary hover:text-red-400 transition-colors">Revoke</button>
                     </div>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleInvite} className="mt-auto border-t border-border-subtle pt-6">
              <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-3">Invite Colleague</label>
              <div className="flex gap-4">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@domain.com" 
                  className="flex-1 h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
                />
                
                <div className="relative">
                  <div 
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="h-10 border-b border-border-subtle bg-transparent flex items-center justify-between px-3 min-w-32 cursor-pointer hover:border-text-primary transition-colors"
                  >
                    <span className="text-sm text-text-primary">{inviteRole}</span>
                    <ChevronDown className="w-4 h-4 text-text-secondary ml-2" />
                  </div>
                  
                  {isRoleDropdownOpen && (
                    <div className="absolute top-12 left-0 w-full bg-bg-base border border-border-subtle shadow-xl z-20">
                      {['Operator', 'Viewer'].map((role) => (
                        <div 
                          key={role}
                          onClick={() => { setInviteRole(role); setIsRoleDropdownOpen(false); }}
                          className="px-4 py-2 hover:bg-bg-workspace text-sm cursor-pointer border-b border-border-subtle last:border-0 flex justify-between items-center"
                        >
                          {role}
                          {inviteRole === role && <Check className="w-3.5 h-3.5 text-brand-accent" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!inviteEmail}
                  className="flex items-center justify-center text-xs font-medium px-6 bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 mr-2" /> Send Invite
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* BILLING & USAGE */}
        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">Billing & Usage</h2>
            <p className="text-xs text-text-secondary leading-relaxed">Monitor your subscription tier, AI token utilization, and payment methods.</p>
          </div>
          
          <div className="space-y-6">
             <div className="bg-bg-base p-8 border border-border-subtle">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-medium">Enterprise Tier</h3>
                    <p className="text-xs text-text-secondary mt-1">Billed annually at $2,400/yr.</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] uppercase tracking-widest border border-[#A5D6A7]">Active</span>
                </div>

                <div className="space-y-6">
                   <div>
                     <div className="flex justify-between text-xs font-medium mb-2">
                       <span className="text-text-secondary uppercase tracking-wider">AI Drafts Generation</span>
                       <span className="text-text-primary">1,402 / 5,000</span>
                     </div>
                     <div className="h-1.5 w-full bg-bg-workspace overflow-hidden">
                       <div className="h-full bg-brand-accent w-[28%]" />
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between text-xs font-medium mb-2">
                       <span className="text-text-secondary uppercase tracking-wider">Lead Verifications</span>
                       <span className="text-text-primary">8,204 / 10,000</span>
                     </div>
                     <div className="h-1.5 w-full bg-bg-workspace overflow-hidden">
                       <div className="h-full bg-brand-accent w-[82%]" />
                     </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-text-secondary" />
                    <div>
                      <div className="text-sm font-medium">VISA ending in 4242</div>
                      <div className="text-[11px] text-text-secondary">Exp 08/2026</div>
                    </div>
                  </div>
                  <button className="text-[11px] font-medium border border-border-subtle hover:border-text-primary px-4 py-2 uppercase tracking-wide transition-colors">
                    Update Billing
                  </button>
                </div>
             </div>
          </div>
        </section>

        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">Profile</h2>
            <p className="text-xs text-text-secondary leading-relaxed">Update your personal information and contact details.</p>
          </div>
          <div className="space-y-6 bg-bg-base p-8 border border-border-subtle">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">First Name</label>
                <input type="text" defaultValue="Alex" className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">Last Name</label>
                <input type="text" defaultValue="Rostov" className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" defaultValue="alex@dealflow.io" className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" />
            </div>
            <div className="pt-4">
              <button 
                onClick={() => addToast("Profile settings saved.", "success")}
                className="text-[11px] font-medium bg-transparent border border-border-subtle px-4 py-2 hover:border-text-primary hover:bg-bg-workspace transition-colors tracking-wide uppercase"
              >
                Save Changes
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-[1fr_2fr] gap-12 pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">API Configuration</h2>
            <p className="text-xs text-text-secondary leading-relaxed">Manage your authentication tokens for external requests.</p>
          </div>
          <div className="space-y-6 bg-bg-base p-8 border border-border-subtle">
            <div>
              <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">REST API Key</label>
              <div className="flex gap-4">
                <input type="password" defaultValue="df_sk_1234567890abcdef" className="flex-1 h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm text-text-secondary" readOnly />
                <button 
                  onClick={handleCopy}
                  className="text-xs font-medium px-4 border border-border-subtle hover:border-text-primary hover:bg-bg-workspace transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

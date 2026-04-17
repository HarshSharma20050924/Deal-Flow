import React, { useState } from "react";
import { Link, Database, Webhook, X, Save } from "lucide-react";

export function Connections() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const ModalShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-workspace/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-base border border-border-subtle w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-lg font-medium tracking-tight">{title}</h2>
          <button onClick={() => setActiveModal(null)} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden p-12">
      <div className="mb-12 shrink-0">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Connections</h1>
        <p className="text-sm text-text-secondary">External service integrations and webhooks.</p>
      </div>

      <div className="space-y-4 max-w-4xl relative">
        
        {/* Google Workspace Connection */}
        <div className="bg-bg-base border border-border-subtle p-6 flex items-center justify-between group">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 border border-border-subtle flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Google Workspace</h3>
              <p className="text-xs text-text-secondary">Provides outbound email delivery via standard API.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-medium text-brand-accent tracking-widest uppercase">Connected</span>
            <button onClick={() => setActiveModal('google')} className="w-10 h-10 border border-border-subtle flex items-center justify-center hover:border-text-primary transition-colors text-text-secondary hover:text-text-primary">
              <Link className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Webhooks Connection */}
        <div className="bg-bg-base border border-border-subtle p-6 flex items-center justify-between group">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 border border-border-subtle flex items-center justify-center shrink-0 text-text-secondary">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1 flex items-center">Webhooks <span className="ml-2 text-[10px] bg-[#E6E6E6] text-[#666] px-2 py-0.5 font-medium tracking-wide">BETA</span></h3>
              <p className="text-xs text-text-secondary">Stream live dispatch data to external endpoints.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-medium text-text-secondary tracking-widest uppercase">Inactive</span>
            <button onClick={() => setActiveModal('webhook')} className="w-10 h-10 border border-border-subtle flex items-center justify-center hover:border-text-primary transition-colors text-text-secondary hover:text-text-primary">
              <Link className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {activeModal === 'google' && (
        <ModalShell title="Google Workspace OAuth">
          <div className="space-y-6">
            <p className="text-sm text-text-secondary leading-relaxed">
              Deal Flow requires read/send access to your inbox to bypass third-party ESP limits and avoid spam filters.
            </p>
            <div className="bg-bg-workspace border border-border-subtle p-4 text-xs font-mono text-text-secondary">
              Scopes: https://mail.google.com/
            </div>
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full flex items-center justify-center border border-border-subtle hover:border-text-primary text-sm font-medium p-3 transition-colors bg-brand-accent text-white hover:bg-brand-accent-hover"
            >
              Re-Authenticate Account
            </button>
          </div>
        </ModalShell>
      )}

      {activeModal === 'webhook' && (
        <ModalShell title="Configure Webhook Endpoint">
          <div className="space-y-6 text-sm">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Payload URL</label>
              <input type="url" placeholder="https://api.yourdomain.com/webhook" className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Secret Token (Optional)</label>
              <input type="password" placeholder="whsec_xxxxx" className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" />
            </div>
            <div className="pt-4 border-t border-border-subtle pb-2">
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">Events to Send</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                  <input type="checkbox" className="accent-brand-accent w-4 h-4 rounded-none" defaultChecked />
                  campaign.started
                </label>
                <label className="flex items-center gap-3 text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                  <input type="checkbox" className="accent-brand-accent w-4 h-4 rounded-none" defaultChecked />
                  email.dispatched
                </label>
                <label className="flex items-center gap-3 text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                  <input type="checkbox" className="accent-brand-accent w-4 h-4 rounded-none" defaultChecked />
                  lead.replied
                </label>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="flex items-center text-sm font-medium border border-border-subtle px-6 py-2 transition-colors hover:border-text-primary"
              >
                Save Configuration <Save className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </ModalShell>
      )}

    </div>
  );
}

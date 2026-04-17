import { ProcessMonitor } from "./ProcessMonitor";
import { OutreachInspector } from "./OutreachInspector";
import { CommandBar } from "./CommandBar";
import { useState, useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const PERFORMANCE_DATA = [
  { day: "Mon", outbound: 120, conversion: 12 },
  { day: "Tue", outbound: 230, conversion: 24 },
  { day: "Wed", outbound: 310, conversion: 41 },
  { day: "Thu", outbound: 280, conversion: 35 },
  { day: "Fri", outbound: 380, conversion: 52 },
  { day: "Sat", outbound: 420, conversion: 68 },
  { day: "Sun", outbound: 512, conversion: 84 },
];

export function Dashboard({ userName, greeting }: { userName: string, greeting: string }) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const firstName = userName.split(" ")[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="w-full flex justify-between items-end px-12 pt-12 pb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-medium tracking-tight mb-2">
            {greeting}, <span className="text-brand-accent">{firstName}</span>.
          </h1>
          <p className="text-sm text-text-secondary">Overview • 3 workflows running.</p>
        </div>
      </div>

      <div className="px-12 w-full pb-8 shrink-0">
        <CommandBar />
      </div>

      <div className="flex-1 px-12 overflow-y-auto pb-12 flex gap-8">
        <div className="flex-1 flex flex-col">
          <div className="flex gap-4 mb-4 shrink-0">
            <div className="bg-bg-base border border-border-subtle p-6 flex-1 flex flex-col relative overflow-hidden group">
              <span className="text-xs text-text-secondary uppercase tracking-wider mb-2 relative z-10">Verification Volume</span>
              <span className="text-3xl font-medium relative z-10">1,248</span>
              <div className="absolute inset-x-0 bottom-0 h-16 opacity-30 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERFORMANCE_DATA}>
                    <Area type="monotone" dataKey="outbound" stroke="#E6E6E6" fill="#F5F5F5" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-bg-base border border-border-subtle p-6 flex-1 flex flex-col relative overflow-hidden group">
              <span className="text-xs text-text-secondary uppercase tracking-wider mb-2 relative z-10">Conversion Velocity</span>
              <span className="text-3xl font-medium text-brand-accent relative z-10">84</span>
              <div className="absolute inset-x-0 bottom-0 h-16 opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERFORMANCE_DATA}>
                    <Area type="monotone" dataKey="conversion" stroke="#0A8356" fill="#0A8356" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-bg-base border border-border-subtle flex flex-col w-full h-full">
              <div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border-subtle px-6 py-3">
                <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Contact</div>
                <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Company</div>
                <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Status</div>
              </div>
              <div className="flex flex-col">
                 <div className="grid grid-cols-[2fr_1fr_1fr] items-center px-6 py-4 border-b border-border-subtle">
                    <div className="flex flex-col"><span className="text-sm font-medium text-text-primary">Elena Rostova</span><span className="text-xs text-text-secondary mt-0.5">CEO</span></div>
                    <div className="text-sm text-text-primary">FinPay Berlin</div>
                    <div><span className="text-[11px] font-medium px-2 py-0.5 bg-brand-accent text-white">Replied</span></div>
                 </div>
                 <div className="grid grid-cols-[2fr_1fr_1fr] items-center px-6 py-4 border-b border-border-subtle">
                    <div className="flex flex-col"><span className="text-sm font-medium text-text-primary">Sarah Jenkins</span><span className="text-xs text-text-secondary mt-0.5">VP Product</span></div>
                    <div className="text-sm text-text-primary">Vault OS</div>
                    <div><span className="text-[11px] font-medium px-2 py-0.5 bg-[#E3F2FD] text-[#1565C0]">Emailed</span></div>
                 </div>
                 <div className="grid grid-cols-[2fr_1fr_1fr] items-center px-6 py-4">
                    <div className="flex flex-col"><span className="text-sm font-medium text-text-primary">David Chen</span><span className="text-xs text-text-secondary mt-0.5">Co-Founder</span></div>
                    <div className="text-sm text-text-primary">Apex Finance</div>
                    <div><span className="text-[11px] font-medium px-2 py-0.5 bg-[#F5F5F5] text-text-secondary">Drafted</span></div>
                 </div>
              </div>
            </div>
          </div>
          
          {selectedLead && (
            <OutreachInspector onClose={() => setSelectedLead(null)} />
          )}
        </div>
        
        <ProcessMonitor />
      </div>
    </div>
  );
}

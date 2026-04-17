import { X } from "lucide-react";

export function OutreachInspector({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full bg-bg-base border border-border-subtle mt-8 relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 text-text-secondary hover:text-text-primary transition-colors"
      >
        <X className="w-4 h-4 stroke-[2]" />
      </button>

      <div className="grid grid-cols-2">
        <div className="p-8 border-r border-border-subtle flex flex-col gap-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Profile Context</h2>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-medium">David Chen</span>
              <span className="text-sm text-text-secondary">Co-Founder, Apex Finance</span>
              <a href="#" className="text-xs text-brand-accent hover:underline mt-2 inline-block">LinkedIn Profile</a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Signal Detected</h2>
            <div className="bg-bg-workspace p-4 border border-border-subtle">
              <p className="text-sm text-text-primary mb-2">
                "Apex Finance announced a $12M Series A round led by Northzone, focusing on expanding their European payments infrastructure."
              </p>
              <span className="text-xs text-text-secondary">Source: TechCrunch • 2 days ago</span>
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Generated Draft</h2>
            <button className="text-xs font-medium bg-brand-accent text-white px-3 py-1.5 hover:bg-brand-accent-hover transition-colors">
              Approve & Send
            </button>
          </div>
          
          <div className="flex-1 bg-bg-workspace p-6 border border-border-subtle text-sm leading-relaxed">
            <p className="mb-4">Hi David,</p>
            <p className="mb-4">
              I noticed <span className="text-brand-accent font-medium">Apex Finance recently closed a $12M Series A with Northzone</span>. Congratulations to you and the team on the milestone.
            </p>
            <p className="mb-4">
              I know that <span className="text-brand-accent font-medium">scaling European payment infrastructure</span> often brings an exponential increase in compliance operational overhead. We've helped similar fintechs automate their KYC/AML pipelines, reducing manual review times by 60%.
            </p>
            <p className="mb-4">
              Would you be open to a brief conversation next Tuesday to share how we might streamline this for the next phase of your growth?
            </p>
            <p className="mb-4">Best regards,</p>
            <p>Automation Agent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Check, Loader2 } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Sourcing",
    description: "Active: Identifying entities matching criteria.",
    status: "active",
  },
  {
    id: 2,
    title: "Verification",
    description: "Pending: Validating contact integrity.",
    status: "pending",
  },
  {
    id: 3,
    title: "Drafting",
    description: "Pending: Structuring communications.",
    status: "pending",
  },
  {
    id: 4,
    title: "Outreach",
    description: "Pending: Awaiting protocol initiation.",
    status: "pending",
  },
];

export function ProcessMonitor() {
  return (
    <div className="bg-bg-base border border-border-subtle p-8 w-full max-w-sm shrink-0 flex flex-col items-start h-full">
      <h2 className="text-lg font-medium mb-8">Process</h2>
      <div className="relative flex-1">
        {/* The vertical pipe via absolute positioning */}
        <div className="absolute left-[7px] top-3 bottom-8 w-[1px] bg-border-subtle" />
        
        <div className="flex flex-col gap-8 relative z-10">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="relative mt-0.5">
                {step.status === "active" && (
                  <div className="absolute -inset-1 bg-brand-accent-subtle rounded-full" />
                )}
                {step.status === "completed" ? (
                  <div className="w-[15px] h-[15px] rounded-full bg-brand-accent flex items-center justify-center relative z-10">
                    <Check className="w-[10px] h-[10px] text-white stroke-[3]" />
                  </div>
                ) : (
                  <div className={`w-[15px] h-[15px] rounded-full relative z-10 flex items-center justify-center 
                    ${step.status === "active" ? "bg-brand-accent" : "bg-border-subtle"}`} 
                  />
                )}
              </div>
              <div>
                <h3 className={`text-sm font-medium ${step.status === "pending" ? "text-text-secondary" : "text-text-primary"}`}>
                  {step.title}
                </h3>
                <p className="text-xs font-light text-text-secondary mt-1 flex items-center">
                  {step.status === "active" && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

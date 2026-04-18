import { useState } from "react";
import { UserCircle2, ArrowRight, Check, Briefcase } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const professions = [
    "Software Services",
    "Digital Marketing",
    "Real Estate",
    "Financial Advisory",
    "Architecture & Design",
    "Creative Agency"
  ];

  const handleComplete = async () => {
    if (!profession) return;
    setIsSubmitting(true);
    try {
      // Store in user metadata for now
      await supabase.auth.updateUser({
        data: { 
          profession: profession,
          profession_profiles: [profession],
          profession_setup: true 
        }
      });
      onComplete();
    } catch (e) {
      console.error("Onboarding failed", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg-workspace flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-bg-base border border-border-subtle w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="mb-10 text-center">
             <div className="w-16 h-16 bg-brand-accent/10 border border-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-brand-accent" />
             </div>
             <h1 className="text-2xl font-medium tracking-tight mb-2">Configure Workspace</h1>
             <p className="text-sm text-text-secondary">What is your primary business or professional focus?</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {professions.map((p) => (
              <button
                key={p}
                onClick={() => setProfession(p)}
                className={`flex items-center gap-3 p-4 border transition-all text-left ${profession === p ? "bg-brand-accent border-brand-accent text-white" : "bg-bg-workspace border-border-subtle hover:border-brand-accent/50 text-text-primary"}`}
              >
                <div className={`w-2 h-2 rounded-full ${profession === p ? "bg-white" : "bg-border-subtle"}`} />
                <span className="text-xs font-semibold uppercase tracking-wider">{p}</span>
              </button>
            ))}
            
            <div className="col-span-2 mt-2">
               <input 
                 type="text" 
                 placeholder="Other professional focus..." 
                 className="w-full h-12 bg-bg-workspace border border-border-subtle px-4 text-sm outline-none focus:border-brand-accent focus:bg-bg-base transition-all"
                 value={professions.includes(profession) ? "" : profession}
                 onChange={(e) => setProfession(e.target.value)}
               />
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={!profession || isSubmitting}
            className="w-full h-12 bg-text-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-brand-accent transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Finalizing..." : "Initialize Dashboard"} 
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="mt-6 text-[10px] text-text-secondary text-center uppercase tracking-widest font-medium opacity-40 leading-relaxed">
            You can add multiple professional profiles later in settings<br/>to switch between different search contexts.
          </p>
        </div>
      </div>
    </div>
  );
}

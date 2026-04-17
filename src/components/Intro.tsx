import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function Intro({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="h-screen w-screen bg-bg-base flex flex-col items-center justify-center font-sans text-text-primary overflow-hidden">
      <motion.div 
        initial={{ filter: "blur(10px)", opacity: 0, scale: 1.05, letterSpacing: "0.1em" }}
        animate={{ filter: "blur(0px)", opacity: 1, scale: 1, letterSpacing: "0em" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl font-medium mb-10 flex items-center"
      >
        Deal Flow<span className="text-brand-accent">.</span>
      </motion.div>
      
      <div className="flex flex-col items-center gap-2 overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="text-text-secondary text-[16px] tracking-wide"
        >
          Predictable client acquisition.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          className="text-text-primary font-medium text-[16px] tracking-wide"
        >
          Pure signal. Guaranteed pipeline.
        </motion.p>
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        onClick={onComplete}
        className="mt-20 flex items-center text-sm font-medium hover:text-brand-accent transition-colors border border-border-subtle hover:border-brand-accent px-6 py-3"
      >
        Enter <ArrowRight className="ml-2 w-4 h-4 stroke-[1.5]" />
      </motion.button>
    </div>
  );
}

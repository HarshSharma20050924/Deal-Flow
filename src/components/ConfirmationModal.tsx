import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  confirmLabel, 
  onConfirm, 
  onCancel,
  isDestructive = true
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-bg-base border border-border-subtle shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className={`p-4 rounded-full shrink-0 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-brand-accent/10 text-brand-accent'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-medium text-text-primary tracking-tight mb-2">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 bg-bg-workspace/50 border-t border-border-subtle">
          <button 
            onClick={onCancel}
            className="order-2 sm:order-1 px-6 py-3 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors border border-border-subtle sm:border-none"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`order-1 sm:order-2 px-8 py-3 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white transition-all shadow-md active:scale-95 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-accent hover:bg-brand-accent/90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

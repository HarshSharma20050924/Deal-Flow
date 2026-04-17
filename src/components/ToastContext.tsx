import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warn' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-12 right-12 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 text-xs px-6 py-4 font-medium shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 border bg-bg-base pointer-events-auto
              ${toast.type === 'error' ? 'border-red-900/50 text-red-500' : 
                toast.type === 'success' ? 'border-brand-accent/50 text-brand-accent' : 
                'border-border-subtle text-text-primary'}`}
          >
            {toast.type === 'success' && <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />}
            {toast.type === 'error' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
            {toast.type === 'info' && <div className="w-2 h-2 bg-text-secondary rounded-full" />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

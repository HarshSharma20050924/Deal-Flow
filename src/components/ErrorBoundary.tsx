import React, { Component, ReactNode, ErrorInfo } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen bg-bg-workspace items-center justify-center font-sans text-text-primary p-6">
          <div className="max-w-md w-full bg-bg-base border border-border-subtle p-12 flex flex-col items-center text-center">
            <AlertTriangle className="w-8 h-8 text-brand-accent mb-6" />
            <h1 className="text-xl font-medium tracking-tight mb-2">System Interruption</h1>
            <p className="text-sm text-text-secondary mb-8">A fatal application error occurred. The workspace state could not be recovered.</p>
            <div className="bg-bg-workspace border border-border-subtle p-3 w-full overflow-auto mb-8 text-left">
              <code className="text-[10px] text-text-secondary font-mono">{this.state.error?.message || "Unknown Error"}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center text-sm font-medium border border-border-subtle hover:border-text-primary hover:bg-bg-workspace transition-colors px-6 py-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restart Workspace
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "./ToastContext";

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) addToast(error.message, "error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        addToast("Check your email for the confirmation link!", "info");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      addToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-bg-workspace flex items-center justify-center">
      <div className="w-full max-w-sm bg-bg-base border border-border-subtle p-12">
        <h1 className="text-xl font-medium tracking-tight mb-2">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {isSignUp ? "Set up your workspace." : "Welcome back."}
        </p>

        <button 
          onClick={handleGoogleLogin}
          className="w-full h-10 mb-8 flex items-center justify-center border border-border-subtle hover:border-text-primary text-sm transition-colors font-medium text-text-secondary hover:text-text-primary"
        >
          <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
          <div className="relative bg-bg-base px-4 text-xs tracking-widest uppercase text-text-secondary">OR</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
                placeholder="John Doe" 
                required 
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
              placeholder="name@company.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-10 flex items-center justify-center bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium transition-colors pt-1 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")} {!isLoading && <ArrowRight className="ml-2 w-4 h-4 stroke-[1.5]" />}
          </button>
        </form>

        <p className="mt-8 text-xs text-text-secondary text-center">
          {isSignUp ? "Already have an account? " : "New here? "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-brand-accent hover:underline">
            {isSignUp ? "Sign In" : "Setup an account"}
          </button>
        </p>
      </div>
    </div>
  );
}

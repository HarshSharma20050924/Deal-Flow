import React, { useState, useEffect } from "react";
import { useToast } from "./ToastContext";
import { Send, Users, Shield, CreditCard, ChevronDown, Check, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { PreferenceRepository } from "../repositories/preference.repository";

export function Preferences() {
  const { addToast } = useToast();
  const [prefs, setPrefs] = useState<any>({
    sender_name: "",
    sender_title: "",
    gemini_api_key: "",
    daily_limit: 40
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Operator");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  const prefRepo = new PreferenceRepository();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      const data = await prefRepo.getPreferences();
      if (data) setPrefs(data);
    } catch (error: any) {
      addToast(`Error loading settings: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await prefRepo.updatePreferences(prefs);
      addToast("Preferences saved to production cluster.", "success");
    } catch (error: any) {
      addToast(`Save failed: ${error.message}`, "error");
    }
  };

  const handleCopy = () => {
    addToast("API Key securely copied to clipboard.", "success");
  };

  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editProfileName, setEditProfileName] = useState("");

  const getProfilesArray = () => {
    return user?.user_metadata?.profession_profiles || [user?.user_metadata?.profession || "Software Services"];
  };

  const updateProfilesInSupabase = async (newProfiles: string[], newActive: string) => {
    try {
      const { data } = await supabase.auth.updateUser({
        data: { 
          profession_profiles: newProfiles,
          profession: newActive 
        }
      });
      setUser(data.user);
      addToast(`Active Profile: ${newActive}`, "success");
    } catch (e: any) {
      addToast(`Update failed: ${e.message}`, "error");
    }
  };

  const saveNewProfile = () => {
    if (newProfileName && newProfileName.trim()) {
      const profiles = getProfilesArray();
      if (!profiles.includes(newProfileName.trim())) {
        updateProfilesInSupabase([...profiles, newProfileName.trim()], newProfileName.trim());
      }
    }
    setIsAddingProfile(false);
    setNewProfileName("");
  };

  const saveEditProfile = (oldName: string) => {
    if (editProfileName && editProfileName.trim() && editProfileName !== oldName) {
      const profiles = getProfilesArray();
      const newProfiles = profiles.map((p: string) => p === oldName ? editProfileName.trim() : p);
      const active = user?.user_metadata?.profession === oldName ? editProfileName.trim() : (user?.user_metadata?.profession || "Software Services");
      updateProfilesInSupabase(newProfiles, active);
    }
    setEditingProfile(null);
    setEditProfileName("");
  };

  const handleRemoveProfile = (name: string) => {
    const profiles = getProfilesArray();
    if (profiles.length <= 1) {
      addToast("You must have at least one profile", "error");
      return;
    }
    if (window.confirm(`Remove ${name}?`)) {
      const newProfiles = profiles.filter((p: string) => p !== name);
      const active = user?.user_metadata?.profession === name ? newProfiles[0] : (user?.user_metadata?.profession || "Software Services");
      updateProfilesInSupabase(newProfiles, active);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-12 max-w-5xl relative">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium tracking-tight mb-2">Preferences</h1>
          <p className="text-sm text-text-secondary">System, account, and billing configuration.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center text-sm font-medium bg-brand-accent text-white px-6 py-2 hover:bg-brand-accent-hover transition-colors"
        >
          <Save className="w-4 h-4 mr-2" /> Save All Changes
        </button>
      </div>

      <div className="space-y-12">
        {/* PROFILE SECTION */}
        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">Profile</h2>
            <p className="text-xs text-text-secondary leading-relaxed">Update your personal information and contact details.</p>
          </div>
          <div className="space-y-6 bg-bg-base p-8 border border-border-subtle">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">First Name</label>
                <input 
                  type="text" 
                  value={prefs.sender_name?.split(' ')[0] || ""} 
                  onChange={e => setPrefs({...prefs, sender_name: `${e.target.value} ${prefs.sender_name?.split(' ')[1] || ''}`})}
                  className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  value={prefs.sender_title || ""} 
                  onChange={e => setPrefs({...prefs, sender_title: e.target.value})}
                  className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" value={user?.email || ""} readOnly className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm text-text-secondary" />
            </div>
          </div>
        </section>

        {/* BUSINESS PROFILES SECTION */}
        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">Business Identities</h2>
            <p className="text-xs text-text-secondary leading-relaxed">Define the professional context for your searches and outreach. Add multiple profiles to switch between different sales perspectives.</p>
          </div>
          <div className="space-y-6 bg-bg-base p-8 border border-border-subtle">
            <div className="space-y-4">
              {(user?.user_metadata?.profession_profiles || [user?.user_metadata?.profession || "Software Services"]).map((p: string) => (
                <div 
                  key={p} 
                  onClick={() => {
                    if (editingProfile !== p) {
                      updateProfilesInSupabase(user?.user_metadata?.profession_profiles || [p], p);
                    }
                  }}
                  className={`flex items-center justify-between p-4 bg-bg-workspace border group transition-colors ${editingProfile === p ? "border-brand-accent cursor-default" : "border-border-subtle hover:border-brand-accent cursor-pointer"}`}
                >
                  {editingProfile === p ? (
                    <div className="flex-1 flex gap-2">
                       <input 
                         type="text" 
                         autoFocus
                         className="flex-1 bg-bg-base border border-border-subtle h-8 px-3 text-sm outline-none focus:border-brand-accent"
                         value={editProfileName}
                         onChange={(e) => setEditProfileName(e.target.value)}
                         onKeyDown={(e) => { if (e.key === "Enter") saveEditProfile(p); else if (e.key === "Escape") setEditingProfile(null); }}
                       />
                       <button onClick={(e) => { e.stopPropagation(); saveEditProfile(p); }} className="px-3 h-8 bg-brand-accent text-white text-xs font-bold uppercase hover:bg-brand-accent-hover">Save</button>
                       <button onClick={(e) => { e.stopPropagation(); setEditingProfile(null); }} className="px-3 h-8 border border-border-subtle text-text-secondary text-xs uppercase hover:text-text-primary hover:border-text-secondary">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Check className={`w-4 h-4 ${user?.user_metadata?.profession === p || (!user?.user_metadata?.profession && p === "Software Services") ? "text-brand-accent" : "text-transparent group-hover:text-border-subtle"}`} />
                        <span className="text-sm font-medium">{p}</span>
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingProfile(p);
                            setEditProfileName(p);
                          }}
                          className="text-[10px] uppercase font-bold text-text-secondary hover:text-text-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveProfile(p); }}
                          className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {isAddingProfile ? (
                 <div className="flex items-center gap-2 p-4 bg-bg-workspace border border-brand-accent">
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="e.g. Freelance Web Developer"
                      className="flex-1 bg-bg-base border border-border-subtle h-8 px-3 text-sm outline-none focus:border-brand-accent"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveNewProfile(); else if (e.key === "Escape") setIsAddingProfile(false); }}
                    />
                    <button onClick={saveNewProfile} className="px-3 h-8 bg-brand-accent text-white text-xs font-bold uppercase hover:bg-brand-accent-hover">Add</button>
                    <button onClick={() => setIsAddingProfile(false)} className="px-3 h-8 border border-border-subtle text-text-secondary text-xs uppercase hover:text-text-primary hover:border-text-secondary">Cancel</button>
                 </div>
              ) : (
                <button 
                  onClick={() => setIsAddingProfile(true)}
                  className="w-full py-3 border border-dashed border-border-subtle text-xs font-medium text-text-secondary hover:text-brand-accent hover:border-brand-accent transition-all"
                >
                  + Add Professional Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* WORKSPACE & LIMITS */}
        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12">
          <div>
            <h2 className="text-sm font-medium mb-2">Limits & AI</h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">Manage daily outreach volume and default AI keys.</p>
          </div>
          <div className="bg-bg-base p-8 border border-border-subtle space-y-6">
            <div>
              <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">Daily Sending Limit</label>
              <input 
                type="number" 
                value={prefs.daily_limit} 
                onChange={e => setPrefs({...prefs, daily_limit: parseInt(e.target.value)})}
                className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2">Default Gemini Key (Private)</label>
              <input 
                type="password" 
                value={prefs.gemini_api_key || ""} 
                onChange={e => setPrefs({...prefs, gemini_api_key: e.target.value})}
                placeholder="sk-..."
                className="w-full h-10 border-b border-border-subtle bg-transparent outline-none focus:border-brand-accent transition-colors text-sm" 
              />
            </div>
          </div>
        </section>

        {/* BILLING & USAGE */}
        <section className="grid grid-cols-[1fr_2fr] gap-12 border-b border-border-subtle pb-12 opacity-50 filter grayscale pointer-events-none">
          <div>
            <h2 className="text-sm font-medium mb-2">Billing & Usage</h2>
            <p className="text-xs text-text-secondary leading-relaxed">Enterprise billing is managed via organization owner.</p>
          </div>
          <div className="bg-bg-base p-8 border border-border-subtle">
             <div className="flex items-start justify-between mb-8">
               <div>
                 <h3 className="text-sm font-medium">Enterprise Tier</h3>
                 <p className="text-xs text-text-secondary mt-1">Active</p>
               </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}

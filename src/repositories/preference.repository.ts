import { supabase } from '../lib/supabase';

export interface UserPreferences {
  user_id: string;
  sender_name?: string;
  sender_title?: string;
  gemini_api_key?: string;
  daily_limit?: number;
  gmail_oauth_token?: any;
}

export class PreferenceRepository {
  async getPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    // If no preferences yet, create defaults
    if (!data) {
      return this.updatePreferences({
        user_id: user.id,
        sender_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
        daily_limit: 40
      });
    }

    return data;
  }

  async updatePreferences(updates: Partial<UserPreferences>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, ...updates })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

import { supabase } from '../lib/supabase';

export class ConnectionRepository {
  async getWebhookSettings() {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('metadata')
      .single();
    if (error) throw error;
    return data?.metadata?.webhooks || { url: '', secret: '', events: [] };
  }

  async saveWebhookSettings(webhook: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current prefs first to preserve other metadata
    const { data: current } = await supabase.from('user_preferences').select('metadata').eq('user_id', user.id).single();
    
    const newMetadata = {
      ...(current?.metadata || {}),
      webhooks: webhook
    };

    const { error } = await supabase
      .from('user_preferences')
      .update({ metadata: newMetadata })
      .eq('user_id', user.id);
      
    if (error) throw error;
  }
}

import { supabase } from '../lib/supabase';

export class InboxRepository {
  async getRecentLogs(limit = 20) {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*, leads(first_name, last_name, company)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async getPendingDrafts() {
    const { data, error } = await supabase
      .from('email_drafts')
      .select('*, leads(first_name, last_name, company)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async sendDraft(draftId: string) {
    // In production, this would trigger an actual email send
    const { error } = await supabase
      .from('email_drafts')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', draftId);
    if (error) throw error;
    return true;
  }
}

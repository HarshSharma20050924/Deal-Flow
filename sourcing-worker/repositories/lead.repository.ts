import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class LeadRepository {
  private supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    this.supabase = createClient(url, key);
  }

  async create(lead: any) {
    const { data, error } = await this.supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

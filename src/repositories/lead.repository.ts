import { supabase } from '../lib/supabase';
import type { Lead, LeadStatus } from '../types/database';

export class LeadRepository {
  async findAll(filters?: any): Promise<Lead[]> {
    let query = supabase.from('leads').select('*');
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
  }

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
    if (error) return null;
    return data as Lead;
  }

  async create(lead: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) throw error;
    return data as Lead;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  }
}

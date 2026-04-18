import { supabase } from '../lib/supabase';
import type { Campaign } from '../types/database';

export class CampaignRepository {
  async findAll(): Promise<Campaign[]> {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Campaign[];
  }

  async create(campaign: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
    if (error) throw error;
    return data as Campaign;
  }

  async delete(id: string): Promise<void> {
    // 1. Delete associated leads or just their campaign_id (the requirement is to delete history)
    // For simplicity, we just delete the campaign. 
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  }
}

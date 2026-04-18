import { supabase } from '../lib/supabase';

export class WorkflowRepository {
  async saveWorkflow(name: string, nodes: any[], edges: any[]) {
    const { data, error } = await supabase
      .from('campaigns') // Reusing campaigns table or you can create a 'workflows' table
      .upsert({ 
        name, 
        metadata: { nodes, edges },
        status: 'draft'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getLatestWorkflow() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

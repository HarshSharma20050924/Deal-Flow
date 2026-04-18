import { AgentService } from '../services/agent.service.js';
import { LeadRepository } from '../repositories/lead.repository.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class GhostwriterAgent {
  private leadRepo = new LeadRepository();
  private ai: AgentService;
  private supabase: SupabaseClient;

  constructor(aiConfig: any) {
    this.ai = new AgentService(aiConfig);
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    this.supabase = createClient(url, key);
  }

  async draftForQualifiedLeads(limit: number = 5) {
    // 1. Find leads that actually need drafting: status is 'new' or 'qualified'
    const { data: leads, error } = await this.supabase
      .from('leads')
      .select('*')
      .in('status', ['qualified', 'new'])
      .limit(limit);

    if (error) {
      console.error(`[Ghostwriter] DB error:`, error.message);
      return [];
    }
    if (!leads || leads.length === 0) {
      // Nothing to do - stay silent, don't spam logs
      return [];
    }

    console.log(`[Ghostwriter] Found ${leads.length} leads needing drafts...`);
    const results = [];

    for (const lead of leads) {
      try {
        // 2. Check if a draft already exists for this lead
        const { data: existingDrafts } = await this.supabase
          .from('email_drafts')
          .select('id')
          .eq('lead_id', lead.id)
          .limit(1);
        
        if (existingDrafts && existingDrafts.length > 0) {
          // Draft exists but lead status wasn't updated - fix it now
          console.log(`[Ghostwriter] Lead ${lead.first_name} already has a draft. Fixing status.`);
          await this.supabase.from('leads').update({ status: 'drafted' }).eq('id', lead.id);
          continue;
        }

        // 3. Get profession context from campaign
        let profession = "Business Services";
        if (lead.metadata?.campaign_id) {
          const { data: camp } = await this.supabase
            .from('campaigns')
            .select('metadata')
            .eq('id', lead.metadata.campaign_id)
            .single();
          if (camp?.metadata?.profession) {
            profession = camp.metadata.profession;
          }
        }

        // 4. Determine available channels
        const hasPhone = !!(lead.phone || (lead.metadata?.phone && lead.metadata.phone.length > 5));
        const hasEmail = !!(lead.email || lead.metadata?.email);
        const channels: ('email' | 'whatsapp')[] = [];
        if (hasEmail) channels.push('email');
        if (hasPhone) channels.push('whatsapp');
        if (channels.length === 0) channels.push('email'); // fallback

        let draftsCreated = 0;

        for (const channel of channels) {
          const isWhatsapp = channel === 'whatsapp';

          // 5. Build prompt and call AI
          const draftingPrompt = this.buildAdvancedPrompt(lead, isWhatsapp, profession);
          
          let draft = { subject: '', body: '' };
          try {
            const draftRaw = await this.ai.execute(draftingPrompt, {}, "advanced");
            draft = this.parseJson(draftRaw);
          } catch (aiErr) {
            console.error(`[Ghostwriter] AI call failed for ${lead.first_name} (${channel}):`, aiErr);
          }

          // 6. If we got a valid draft, store it
          if (draft.body && draft.body.length > 10) {
            const { error: insertErr } = await this.supabase.from('email_drafts').insert({
              lead_id: lead.id,
              subject: isWhatsapp ? 'WhatsApp' : (draft.subject || 'Outreach'),
              body: draft.body,
              status: 'pending'
            });

            if (insertErr) {
              console.error(`[Ghostwriter] Failed to save ${channel} draft for ${lead.first_name}:`, insertErr.message);
            } else {
              draftsCreated++;
              console.log(`[Ghostwriter] ✓ ${channel} draft saved for ${lead.first_name}`);
            }
          } else {
            console.warn(`[Ghostwriter] Empty ${channel} draft for ${lead.first_name}`);
          }
        }

        // 7. Update lead status based on results
        if (draftsCreated > 0) {
          await this.supabase.from('leads').update({ status: 'drafted' }).eq('id', lead.id);
          results.push({ leadId: lead.id, channels });
        } else {
          await this.supabase.from('leads').update({ status: 'draft_failed' }).eq('id', lead.id);
        }
      } catch (err: any) {
        console.error(`[Ghostwriter] Error on lead ${lead.id}:`, err?.message || err);
        // CRITICAL: Mark as failed to prevent infinite retry loop
        await this.supabase.from('leads').update({ status: 'draft_failed' }).eq('id', lead.id);
      }
    }

    if (results.length > 0) {
      console.log(`[Ghostwriter] Completed: ${results.length}/${leads.length} drafts saved.`);
    }
    return results;
  }

  private buildAdvancedPrompt(lead: any, isWhatsapp: boolean, profession: string): string {
    const channel = isWhatsapp ? 'WhatsApp' : 'Email';
    const constraints = isWhatsapp 
      ? "- Max 40 words. \n- No 'Dear/Hello' formalisms. \n- Use 1 relevant emoji. \n- Clear CTA: A free consultation/audit relevant to their business."
      : "- Max 120 words. \n- Avoid 'I hope this finds you well.' \n- Use a 'Problem-Agitation-Solution' structure.";

    return `
      ### ROLE
      You are an elite, high-status Sales Director representing a premium ${profession} firm. 
      Your communication should be minimalist, authoritative, and sophisticated.
      
      ### LEAD DATA
      ${JSON.stringify(lead)}

      ### OBJECTIVE
      Draft a ${channel} message that is surgically precise. Avoid all low-value filler ("I hope you're well", "My name is", etc.).
      
      ### LUXURY PROFESSIONAL GUIDELINES
      1. **The Observation**: Start with a neutral, high-value observation about their operations. No flattery.
      2. **The Gap**: Briefly acknowledge a specific opportunity for excellence in their current ${profession} context.
      3. **The Proposal**: Offer a singular, high-impact insight (e.g., "I have a brief analysis on your...") rather than a generic meeting request.
      4. **Brevity**: Every word must earn its place. Use strong verbs. Avoid hype.
      
      ### CHANNEL CONSTRAINTS
      ${constraints}

      ### OUTPUT FORMAT
      Return ONLY valid JSON:
      {
        "subject": "A compelling, 3-word subject (leave as 'WhatsApp' if channel is WhatsApp)",
        "body": "The sophisticated outreach message body"
      }
    `;
  }

  private parseJson(text: string): any {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : {};
    } catch {
      return {};
    }
  }
}
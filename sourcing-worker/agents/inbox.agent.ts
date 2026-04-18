import { AgentService } from '../services/agent.service.js';
import { LeadRepository } from '../repositories/lead.repository.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type IntentCategory = "interested" | "not_interested" | "ooo" | "meeting_requested" | "neutral";

export class InboxAgent {
  private leadRepo = new LeadRepository();
  private ai: AgentService;
  private supabase: SupabaseClient;

  constructor(aiConfig: any) {
    this.ai = new AgentService(aiConfig);
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    this.supabase = createClient(url, key);
  }

  /**
   * Classifies a reply and updates lead status accordingly.
   */
  async processReply(leadId: string, replyText: string) {
    console.log(`[Inbox] Processing reply for lead ${leadId}...`);

    // 1. Classify Intent using Cerebras (Rapid Llama 3.1 8B)
    const classificationPrompt = `
      Classify the intent of this email reply from a prospect.
      Reply Content: "${replyText}"
      
      Categories:
      - "interested": Positive response, asking questions.
      - "not_interested": Rejection, unsubscribe, or no thanks.
      - "ooo": Out of office auto-reply.
      - "meeting_requested": Specifically asking for a call or booking.
      - "neutral": Just saying thanks or asking for more time.
      
      Return ONLY the category name.
    `;

    // Using Cerebras (Rapid) for classification
    const category = await this.ai.useCerebras(classificationPrompt, {}) as IntentCategory;
    const cleanCategory = category.trim().toLowerCase().replace(/[^a-z_]/g, "") as IntentCategory;

    console.log(`[Inbox] Classified as: ${cleanCategory}`);

    // 2. Update Lead & Record Log
    let newStatus = "contacted";
    if (cleanCategory === "interested" || cleanCategory === "meeting_requested") {
      newStatus = "replied";
    } else if (cleanCategory === "not_interested") {
      newStatus = "unsubscribed";
    }

    await this.leadRepo.update(leadId, { 
      status: newStatus,
      metadata: { 
        last_reply_sentiment: cleanCategory,
        last_reply_at: new Date().toISOString()
      }
    });

    // 3. Store in Email Logs
    await this.supabase.from('email_logs').insert({
      lead_id: leadId,
      direction: 'inbound',
      content: replyText,
      metadata: { category: cleanCategory }
    });

    return { leadId, category: cleanCategory, newStatus };
  }
}

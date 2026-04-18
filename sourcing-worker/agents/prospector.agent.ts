import { ScraperService } from '../services/scraper.service.js';
import { AgentService } from '../services/agent.service.js';
import { VerificationService } from '../services/verification.service.js';
import { LeadRepository } from '../repositories/lead.repository.js';

export class ProspectorAgent {
  private scraper = new ScraperService();
  private verification = new VerificationService();
  private leadRepo = new LeadRepository();
  private ai: AgentService;

  constructor(aiConfig: any) {
    this.ai = new AgentService(aiConfig);
  }

  /**
   * Main workflow: Scrape -> Extract -> Qualify -> Store
   */
  async run(url: string, icp: string) {
    console.log(`[Prospector] Starting hunt on ${url}...`);

    try {
      // 1. Scrape raw content
      const rawContent = await this.scraper.scrapePublicData(url);
      
      // 2. Extract potential leads using Gemini Flash (High Context)
      const extractionPrompt = `Extract B2B contact information from this website content. Return a JSON array of objects with: first_name, last_name, email, company, title, linkedin_url. Only return the JSON.`;
      const extractedDataRaw = await this.ai.execute(extractionPrompt, { content: rawContent.substring(0, 50000) }, "vision");
      
      // Basic JSON extraction logic
      const leads = this.parseJson(extractedDataRaw);
      console.log(`[Prospector] Extracted ${leads.length} potential leads.`);

      const results = [];

      for (const lead of leads) {
        // 3. Verify Email (Zero-Cost)
        let isVerified = false;
        if (lead.email) {
          isVerified = await this.verification.validateMxRecord(lead.email);
        }

        // 4. Qualify Lead using Groq (Speed)
        const qualificationPrompt = `Given this lead: ${JSON.stringify(lead)}, and this Ideal Customer Profile (ICP): ${icp}, score the lead from 0-100 on fit. Return only the number.`;
        const scoreRaw = await this.ai.execute(qualificationPrompt, {}, "fast");
        const score = parseInt(scoreRaw.replace(/[^0-9]/g, "")) || 50;

        // 5. Store in Supabase
        const storedLead = await this.leadRepo.create({
          ...lead,
          score,
          status: score > 70 ? 'qualified' : 'new',
          metadata: { 
            source_url: url,
            mx_verified: isVerified,
            sourcing_date: new Date().toISOString()
          }
        });

        results.push(storedLead);
        console.log(`[Prospector] Stored lead: ${lead.first_name} ${lead.last_name} (Score: ${score})`);
      }

      return results;
    } finally {
      await this.scraper.close();
    }
  }

  private parseJson(text: string): any[] {
    try {
      const match = text.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
      return [];
    } catch (e) {
      console.error("[Prospector] JSON Parsing failed", e);
      return [];
    }
  }
}

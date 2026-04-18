import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { ScraperService } from "./services/scraper.service.js";
import { GhostwriterAgent } from "./agents/ghostwriter.agent.js";
import { LeadRepository } from "./repositories/lead.repository.js";

import express from "express";

dotenv.config({ override: true });

const app = express();
const port = process.env.PORT || 5000;

app.get("/health", (req, res) => res.send("Worker Active"));
app.listen(port, () => console.log(`[Worker] Health check active on port ${port}`));

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const config = {
  geminiKey: process.env.GEMINI_API_KEY,
  groqKey: process.env.GROQ_API_KEY,
  mistralKey: process.env.MISTRAL_API_KEY,
};

async function updateCampaignLog(campaignId: string, logMessage: string, step?: string) {
  const { data: campaign } = await supabase.from('campaigns').select('metadata').eq('id', campaignId).single();
  const currentMetadata = campaign?.metadata || {};
  const logs = currentMetadata.logs || [];
  const newLogs = [...logs, { message: logMessage, timestamp: new Date().toISOString() }].slice(-20);
  
  await supabase.from('campaigns').update({ 
    metadata: { 
      ...currentMetadata, 
      logs: newLogs,
      current_step: step || currentMetadata.current_step
    } 
  }).eq('id', campaignId);
}

async function checkAndProcess() {
  // 1. Process Active Campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active');

  if (campaigns && campaigns.length > 0) {
    for (const campaign of campaigns) {
      if (!campaign.targeting_query) continue;

      console.log(`[Server] Processing: ${campaign.name} → "${campaign.targeting_query}"`);
      await updateCampaignLog(campaign.id, `Starting search for "${campaign.targeting_query}"`, "Sourcing");
      
      const scraper = new ScraperService();
      const leadRepo = new LeadRepository();
      
      await updateCampaignLog(campaign.id, "Searching Google Maps...", "Sourcing");
      const results = await scraper.scrapeMaps(campaign.targeting_query);
      
      let sourced = 0;
      let duplicates = 0;

      for (const result of results) {
        if (!result.phone && !result.website) continue; // Need at least one contact method
        
        const normalizedPhone = result.phone ? result.phone.replace(/\D/g, '') : '';

        // Deduplication check
        if (normalizedPhone) {
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('id')
            .filter('metadata->>phone', 'eq', normalizedPhone)
            .limit(1);
          
          if (existingLeads && existingLeads.length > 0) {
            duplicates++;
            continue;
          }
        }

        // Scrape email from website if available
        let email: string | null = null;
        if (result.website) {
          await updateCampaignLog(campaign.id, `Scraping email from ${result.name}...`, "Enriching");
          console.log(`[Server] Scraping email from: ${result.website}`);
          email = await scraper.scrapeEmailFromWebsite(result.website);
          if (email) {
            console.log(`[Server] ✓ Email found for ${result.name}: ${email}`);
          } else {
            console.log(`[Server] ✗ No email found for ${result.name}`);
          }
        }

        // Determine outreach channels
        const channels: string[] = [];
        if (normalizedPhone) channels.push('whatsapp');
        if (email) channels.push('email');

        await leadRepo.create({
          first_name: result.name,
          company: result.name,
          email: email || null,
          phone: normalizedPhone || null,
          status: 'new',
          score: (email && normalizedPhone) ? 95 : normalizedPhone ? 85 : 60,
          campaign_id: campaign.id,
          user_id: campaign.user_id, // Vital for multi-tenancy
          metadata: { 
            phone: normalizedPhone || null,
            original_phone: result.phone || null,
            email: email || null,
            website: result.website || null,
            source: 'Auto-Server', 
            campaign_id: campaign.id,
            user_id: campaign.user_id,
            channels: channels,
          }
        });
        sourced++;
        console.log(`[Server] ✓ Saved: ${result.name} | Phone: ${normalizedPhone || 'N/A'} | Email: ${email || 'N/A'} | Channels: ${channels.join('+') || 'none'}`);
      }
      await scraper.close();

      await updateCampaignLog(campaign.id, `Done. Found ${sourced} new leads (Skipped ${duplicates} duplicates).`, "Completed");
      await supabase.from('campaigns').update({ status: 'completed' }).eq('id', campaign.id);
      console.log(`[Server] Campaign "${campaign.name}" complete. ${sourced} leads sourced, ${duplicates} skipped.`);
    }
  }

  // 2. Process Background Drafts
  const ghostwriter = new GhostwriterAgent(config);
  await ghostwriter.draftForQualifiedLeads(10);
}

// Poll or Run Once
const runOnce = process.argv.includes("--once");

if (runOnce) {
  console.log("[Worker] Running single cycle...");
  checkAndProcess().then(() => {
    console.log("[Worker] Cycle complete. Exiting.");
    process.exit(0);
  });
} else {
  console.log("Deal-Flow Server Started (Polling Mode).");
  setInterval(checkAndProcess, 10000);
  checkAndProcess();
}

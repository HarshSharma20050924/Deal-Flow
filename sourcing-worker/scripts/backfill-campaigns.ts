import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ override: true });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function backfillCampaignIds() {
  console.log("=== Backfill Campaign IDs ===\n");

  // Get all campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, targeting_query, created_at')
    .order('created_at', { ascending: true });

  if (!campaigns || campaigns.length === 0) {
    console.log("No campaigns found.");
    return;
  }

  // Get ALL leads that have no campaign_id in metadata
  const { data: orphanLeads } = await supabase
    .from('leads')
    .select('id, first_name, company, metadata, created_at')
    .order('created_at', { ascending: true });

  if (!orphanLeads || orphanLeads.length === 0) {
    console.log("No leads to process.");
    return;
  }

  console.log(`Campaigns: ${campaigns.length}`);
  console.log(`Leads to process: ${orphanLeads.length}\n`);

  // Strategy: Match leads to campaigns by creation time proximity
  // Leads created around the same time as a campaign likely belong to that campaign
  let assigned = 0;

  for (const lead of orphanLeads) {
    if (lead.metadata?.campaign_id && lead.metadata.campaign_id !== 'NONE') {
      continue; // Already has a campaign_id
    }

    const leadTime = new Date(lead.created_at).getTime();
    
    // Find the campaign whose creation time is closest to (but before) this lead
    let bestCampaign = campaigns[0]; // fallback to first
    let bestDelta = Infinity;

    for (const c of campaigns) {
      const campTime = new Date(c.created_at).getTime();
      const delta = leadTime - campTime;
      // Lead should be created AFTER or around the same time as the campaign
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        bestCampaign = c;
      }
    }

    // Also try to match by keyword from targeting_query and company name
    let matchedCampaign = bestCampaign;
    for (const c of campaigns) {
      if (c.targeting_query) {
        const keywords = c.targeting_query.toLowerCase().split(' ');
        const companyLower = (lead.company || '').toLowerCase();
        const nameLower = (lead.first_name || '').toLowerCase();
        if (keywords.some((k: string) => k.length > 3 && (companyLower.includes(k) || nameLower.includes(k)))) {
          matchedCampaign = c;
          break;
        }
      }
    }

    // Update the lead's metadata with the campaign_id
    const newMetadata = { ...lead.metadata, campaign_id: matchedCampaign.id };
    await supabase
      .from('leads')
      .update({ metadata: newMetadata })
      .eq('id', lead.id);

    console.log(`  ✓ ${lead.first_name || 'Unknown'} → "${matchedCampaign.name}" (${matchedCampaign.id})`);
    assigned++;
  }

  console.log(`\n=== Done: Assigned ${assigned} leads to campaigns ===`);

  // Remove duplicate leads (keep only the first one with each phone)
  console.log("\n=== Deduplicating Leads ===\n");

  const { data: allLeads } = await supabase
    .from('leads')
    .select('id, first_name, metadata')
    .order('created_at', { ascending: true });

  if (allLeads) {
    const seenPhones = new Set<string>();
    let removed = 0;

    for (const lead of allLeads) {
      const phone = lead.metadata?.phone;
      if (!phone) continue;

      if (seenPhones.has(phone)) {
        // Duplicate - delete it
        await supabase.from('email_drafts').delete().eq('lead_id', lead.id);
        await supabase.from('leads').delete().eq('id', lead.id); 
        console.log(`  ✗ Removed duplicate: ${lead.first_name} (phone: ${phone})`);
        removed++;
      } else {
        seenPhones.add(phone);
      }
    }

    console.log(`\nRemoved ${removed} duplicates.`);
  }

  // Final verification
  console.log("\n=== Verification ===\n");
  const { data: verCampaigns } = await supabase.from('campaigns').select('id, name').order('created_at', { ascending: false }).limit(10);
  if (verCampaigns) {
    for (const c of verCampaigns) {
      const { data: cLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('metadata->>campaign_id', c.id);
      console.log(`  "${c.name}" → ${cLeads?.length || 0} leads`);
    }
  }
}

backfillCampaignIds().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

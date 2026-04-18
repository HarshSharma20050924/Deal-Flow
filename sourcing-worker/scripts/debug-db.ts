import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ override: true });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function debug() {
  console.log("=== Debug: All Leads ===\n");

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, first_name, company, status, campaign_id, metadata')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching leads:", error.message);
    return;
  }

  console.log(`Total leads found: ${leads?.length || 0}\n`);
  
  if (leads) {
    for (const l of leads) {
      const metaCampaign = l.metadata?.campaign_id || 'NONE';
      const colCampaign = l.campaign_id || 'NONE';
      console.log(`  [${l.status}] ${l.first_name || 'Unknown'} | company: ${l.company || '-'} | meta.campaign_id: ${metaCampaign} | col.campaign_id: ${colCampaign}`);
    }
  }

  console.log("\n=== Debug: All Campaigns ===\n");

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status')
    .order('created_at', { ascending: false })
    .limit(10);

  if (campaigns) {
    for (const c of campaigns) {
      // Try the exact query the frontend uses
      const { data: cLeads, error: filterErr } = await supabase
        .from('leads')
        .select('id')
        .eq('metadata->>campaign_id', c.id);
      
      console.log(`  [${c.status}] "${c.name}" → ${cLeads?.length || 0} leads (id: ${c.id}) ${filterErr ? 'FILTER_ERROR: ' + filterErr.message : ''}`);
    }
  }

  console.log("\n=== Debug: Email Drafts ===\n");

  const { data: drafts } = await supabase
    .from('email_drafts')
    .select('id, lead_id, subject, status')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`Total drafts: ${drafts?.length || 0}`);
  if (drafts) {
    for (const d of drafts) {
      console.log(`  [${d.status}] lead: ${d.lead_id} | subject: ${d.subject}`);
    }
  }
}

debug().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

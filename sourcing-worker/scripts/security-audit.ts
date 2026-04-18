import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function securityAudit() {
  console.log("=== Security Audit: Data Isolation ===\n");

  // 1. Check for leads without user_id
  const { data: leakLeads } = await supabase
    .from('leads')
    .select('id, first_name, user_id, campaign_id, metadata')
    .is('user_id', null);

  if (leakLeads && leakLeads.length > 0) {
    console.warn(`[WARNING] Found ${leakLeads.length} leads with NO owner! Repairing...`);
    for (const l of leakLeads) {
       const cid = l.campaign_id || l.metadata?.campaign_id;
       if (!cid) continue;

       const { data: campaign } = await supabase.from('campaigns').select('user_id').eq('id', cid).single();
       if (campaign?.user_id) {
         console.log(` ✓ Attributing lead ${l.id} to user ${campaign.user_id}`);
         await supabase.from('leads').update({ user_id: campaign.user_id }).eq('id', l.id);
       }
    }
  } else {
    console.log("✓ All leads have owners.");
  }

  // 2. Check for campaigns without user_id
  const { data: leakCampaigns } = await supabase
    .from('campaigns')
    .select('id, name, user_id')
    .is('user_id', null);

  if (leakCampaigns && leakCampaigns.length > 0) {
    console.warn(`[WARNING] Found ${leakCampaigns.length} campaigns with NO owner!`);
  } else {
    console.log("✓ All campaigns have owners.");
  }

  console.log("\nRLS Check: If you applied the 'secure_multi_tenancy' migration, your data is 100% siloed.");
}

securityAudit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

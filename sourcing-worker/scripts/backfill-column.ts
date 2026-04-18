import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function backfill() {
  console.log("Starting backfill: metadata -> campaign_id column...");

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, metadata')
    .is('campaign_id', null);

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  console.log(`Found ${leads?.length || 0} leads missing campaign_id.`);

  if (!leads) return;

  for (const lead of leads) {
    const campaignId = lead.metadata?.campaign_id;
    const userId = lead.metadata?.user_id;

    if (campaignId) {
      console.log(`Updating lead ${lead.id} with campaign ${campaignId}...`);
      await supabase
        .from('leads')
        .update({ 
          campaign_id: campaignId,
          user_id: lead.user_id || userId // Backfill user_id too if missing
        })
        .eq('id', lead.id);
    }
  }

  console.log("Backfill complete!");
}

backfill().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "/home/harsh/Deal-Flow/.env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zuqduxrjrjntzfdcyfhr.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing Supabase Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function recoverLeads() {
  console.log("Starting lead recovery...");

  // 1. Fetch campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, created_at')
    .order('created_at', { ascending: true });

  if (!campaigns) {
    console.log("No campaigns found.");
    return;
  }

  // 2. Fetch leads without campaign_id
  const { data: leads } = await supabase
    .from('leads')
    .select('id, metadata, created_at, company');

  if (!leads) {
    console.log("No leads found.");
    return;
  }

  const orphanedLeads = leads.filter(l => !l.metadata?.campaign_id);
  console.log(`Found ${orphanedLeads.length} orphaned leads.`);

  for (const lead of orphanedLeads) {
    // Find the latest campaign created before this lead
    const matchingCampaign = [...campaigns]
      .reverse()
      .find(c => new Date(c.created_at) < new Date(lead.created_at));

    if (matchingCampaign) {
      console.log(`Associating [${lead.company}] with campaign [${matchingCampaign.name}]`);
      
      const newMetadata = {
        ...lead.metadata,
        campaign_id: matchingCampaign.id
      };

      const { error } = await supabase
        .from('leads')
        .update({ metadata: newMetadata })
        .eq('id', lead.id);

      if (error) console.error(`Error updating lead ${lead.id}:`, error.message);
    } else {
        // If no matching campaign found, maybe associate it with the first one
        if (campaigns.length > 0) {
            console.log(`No earlier campaign for [${lead.company}], associating with first campaign [${campaigns[0].name}]`);
            const newMetadata = {
                ...lead.metadata,
                campaign_id: campaigns[0].id
            };
            await supabase.from('leads').update({ metadata: newMetadata }).eq('id', lead.id);
        }
    }
  }

  console.log("Recovery complete.");
}

recoverLeads();

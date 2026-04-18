import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ override: true });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function repairLeads() {
  console.log("=== Lead Repair Script ===\n");

  // 1. Find all leads stuck as 'new' that ALREADY have drafts
  const { data: newLeads } = await supabase
    .from('leads')
    .select('id, first_name, status')
    .in('status', ['new', 'qualified']);
  
  console.log(`Found ${newLeads?.length || 0} leads with status 'new' or 'qualified'\n`);

  if (!newLeads || newLeads.length === 0) {
    console.log("No stuck leads found. Everything is clean.");
    return;
  }

  let fixed = 0;
  let markedFailed = 0;

  for (const lead of newLeads) {
    // Check if a draft already exists
    const { data: drafts } = await supabase
      .from('email_drafts')
      .select('id')
      .eq('lead_id', lead.id)
      .limit(1);

    if (drafts && drafts.length > 0) {
      // Draft exists - fix the status to 'drafted'
      await supabase.from('leads').update({ status: 'drafted' }).eq('id', lead.id);
      console.log(`✓ Fixed: ${lead.first_name} → status changed to 'drafted' (draft already existed)`);
      fixed++;
    } else {
      // No draft exists - mark as draft_failed so ghostwriter stops retrying
      await supabase.from('leads').update({ status: 'draft_failed' }).eq('id', lead.id);
      console.log(`✗ Marked: ${lead.first_name} → status changed to 'draft_failed' (no draft found)`);
      markedFailed++;
    }
  }

  console.log(`\n=== Repair Complete ===`);
  console.log(`Fixed (had drafts): ${fixed}`);
  console.log(`Marked failed (no drafts): ${markedFailed}`);
  console.log(`\nThe ghostwriter will no longer loop on these leads.`);

  // 2. Show campaign-lead stats for debugging history
  console.log(`\n=== Campaign → Lead Mapping ===`);
  const { data: campaigns } = await supabase.from('campaigns').select('id, name').order('created_at', { ascending: false }).limit(10);
  
  if (campaigns) {
    for (const c of campaigns) {
      const { data: cLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('metadata->>campaign_id', c.id);
      
      console.log(`  ${c.name}: ${cLeads?.length || 0} leads (campaign_id: ${c.id})`);
    }
  }
}

repairLeads().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

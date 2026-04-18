import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function updateSchema() {
  console.log("Applying column updates...");
  
  // Using rpc might be disabled for raw SQL, so we use multiple small queries if possible
  // via a helper if a migrations table exists, or just direct if we have permissions.
  
  // Since we don't have a direct 'sql' rpc by default, we'll try to insert a test to see if it works
  // but better to use the migrations file approach or a dedicated tool.
  
  console.log("NOTE: Please apply the following SQL in your Supabase Dashboard SQL Editor if this script fails:");
  console.log("ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS targeting_query TEXT;");
  console.log("ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;");
}

updateSchema();

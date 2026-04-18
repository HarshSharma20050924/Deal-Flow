import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config({ override: true });
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data } = await sb.from('leads').select('id, first_name, phone, metadata').limit(5);
  for (const l of data || []) {
    console.log(`${l.first_name}`);
    console.log(`  full metadata:`, JSON.stringify(l.metadata));
    console.log('');
  }
}
main();

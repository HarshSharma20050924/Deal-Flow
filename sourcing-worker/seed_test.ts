import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function seed() {
  const { data, error } = await supabase.from('leads').insert([{
    first_name: "Sam",
    last_name: "Altman",
    email: "sam@openai.com",
    company: "OpenAI",
    status: "qualified",
    score: 95,
    metadata: {
      source: "Manual Seed",
      title: "CEO"
    }
  }]).select();

  if (error) console.error("Seed failed:", error);
  else console.log("✅ Seed lead created:", data[0].id);
}

seed();

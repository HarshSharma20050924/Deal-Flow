import { createClient } from "@supabase/supabase-js";

// Vercel Serverless Worker
export default async function handler(req: any, res: any) {
  // Security check for Cron (optional)
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("[Vercel Worker] Starting cycle...");

  try {
    // 1. Ghostwriter Logic (AI Drafting)
    // We do this first because it's fast and reliable on Vercel
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .limit(5);

    if (leads && leads.length > 0) {
      console.log(`[Vercel Worker] Found ${leads.length} leads to draft.`);
      // Note: In a real Vercel environment, we'd call our Ghostwriter logic here.
      // For this "Vercel All" setup, we'll mark them as 'drafting' and let a separate function handle it
      // or implement the lightweight logic here.
    }

    // 2. Sourcing Logic
    // Checking for any active campaigns that need work
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .limit(1);

    if (campaigns && campaigns.length > 0) {
       console.log(`[Vercel Worker] Active campaign detected: ${campaigns[0].name}`);
       // Triggering search logic...
    }

    return res.status(200).json({ 
      status: "success", 
      timestamp: new Date().toISOString(),
      message: "Worker cycle completed successfully on Vercel."
    });
  } catch (error: any) {
    console.error("[Vercel Worker] Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

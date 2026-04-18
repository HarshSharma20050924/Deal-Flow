import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { VerificationService } from "./services/verification.service.js";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ override: true });

const server = new McpServer({
  name: "deal-flow-sourcing",
  version: "1.0.0",
});

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const verificationService = new VerificationService();
const config = {
  geminiKey: process.env.GEMINI_API_KEY,
  groqKey: process.env.GROQ_API_KEY,
  cerebrasKey: process.env.CEREBRAS_API_KEY,
  mistralKey: process.env.MISTRAL_API_KEY,
};

// --- TOOL REGISTRATIONS ---

// Tool: Verify Email
server.tool(
  "verify_email",
  "Verifies an email focus via MX lookup.",
  {
    email: z.string().email(),
  },
  async ({ email }) => {
    const result = await verificationService.verifyEmail(email);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// Tool: Discover Leads
server.tool(
  "discover_leads",
  "Discovers leads from a search query (e.g., 'Hotels in Ujjain').",
  {
    query: z.string(),
    icp: z.string().default("Business owners"),
  },
  async ({ query, icp }) => {
    const { ScraperService } = await import("./services/scraper.service.js");
    const { ProspectorAgent } = await import("./agents/prospector.agent.js");
    const scraper = new ScraperService();
    const urls = await scraper.search(query);
    const agent = new ProspectorAgent(config);
    
    let totalSourced = 0;
    for (const url of urls) {
      const results = await agent.run(url, icp);
      totalSourced += results.length;
    }
    await scraper.close();
    return { content: [{ type: "text", text: `Pipeline complete. Sourced ${totalSourced} leads from ${urls.length} domains for query: ${query}` }] };
  }
);

// Tool: Prospect URL
server.tool(
  "prospect_url",
  "Launches Prospector Agent for lead discovery.",
  {
    url: z.string().url(),
    icp: z.string().default("SaaS Decision Makers"),
  },
  async ({ url, icp }) => {
    const { ProspectorAgent } = await import("./agents/prospector.agent.js");
    const agent = new ProspectorAgent(config);
    const results = await agent.run(url, icp);
    return { content: [{ type: "text", text: `Sourced ${results.length} leads.` }] };
  }
);

// Tool: Draft Emails
server.tool(
  "draft_emails",
  "Generates personalized drafts for qualified leads.",
  {
    limit: z.number().default(5),
  },
  async ({ limit }) => {
    const { GhostwriterAgent } = await import("./agents/ghostwriter.agent.js");
    const agent = new GhostwriterAgent(config);
    const results = await agent.draftForQualifiedLeads(limit);
    return { content: [{ type: "text", text: `Generated ${results.length} drafts.` }] };
  }
);

// Tool: Classify Reply
server.tool(
  "classify_reply",
  "Classifies email intent via Inbox Agent.",
  {
    leadId: z.string().uuid(),
    replyText: z.string(),
  },
  async ({ leadId, replyText }) => {
    const { InboxAgent } = await import("./agents/inbox.agent.js");
    const agent = new InboxAgent(config);
    const result = await agent.processReply(leadId, replyText);
    return { content: [{ type: "text", text: `Intent: ${result.category}` }] };
  }
);

// --- EXECUTION MODES ---

async function runCli() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "discover_leads") {
    const query = args[args.indexOf("--query") + 1] || "Hotels in Ujjain";
    console.log(`Starting Local Discovery for "${query}" via Google Maps...`);
    const { ScraperService } = await import("./services/scraper.service.js");
    const { LeadRepository } = await import("./repositories/lead.repository.js");
    const scraper = new ScraperService();
    const leadRepo = new LeadRepository();
    const results = await scraper.scrapeMaps(query);
    
    let totalSourced = 0;
    for (const result of results) {
      console.log(`[Discovery] Found: ${result.name} (${result.website ? 'Has Website' : 'No Website'})`);
      
      // Store directly as a lead with native column support
      await leadRepo.create({
        first_name: result.name,
        company: result.name,
        phone: result.phone,
        status: 'new',
        score: result.website ? 60 : 90, 
        metadata: {
          website: result.website,
          source: 'Google Maps'
        }
      });
      totalSourced++;
    }
    
    await scraper.close();
    console.log(`✅ Phase 1 Complete: Sourced ${totalSourced} total leads.`);

    // --- PHASE 2: AUTOMATIC DRAFTING ---
    console.log(`🚀 Starting Phase 2: Ghostwriter Drafting...`);
    const { GhostwriterAgent } = await import("./agents/ghostwriter.agent.js");
    const ghostwriter = new GhostwriterAgent(config);
    const draftsCount = await ghostwriter.draftForQualifiedLeads(totalSourced);
    
    console.log(`✅ Full Flow Complete: Sourced ${totalSourced} leads & Created ${draftsCount.length} personalized drafts.`);
  } else if (command === "prospect_url") {
    const url = args[2] || "https://openai.com";
    console.log(`Starting Prospector for ${url}...`);
    const { ProspectorAgent } = await import("./agents/prospector.agent.js");
    const agent = new ProspectorAgent(config);
    const results = await agent.run(url, "AI researchers and product managers");
    console.log(`✅ Success: Sourced ${results.length} leads.`);
  } else if (command === "draft_emails") {
    console.log("Starting Ghostwriter drafting...");
    const { GhostwriterAgent } = await import("./agents/ghostwriter.agent.js");
    const agent = new GhostwriterAgent(config);
    const results = await agent.draftForQualifiedLeads(5);
    console.log(`✅ Success: Generated ${results.length} drafts.`);
  } else if (command === "classify_reply") {
    const leadId = args[args.indexOf("--leadId") + 1];
    const replyText = args[args.indexOf("--replyText") + 1];
    console.log(`Classifying reply for lead ${leadId}...`);
    const { InboxAgent } = await import("./agents/inbox.agent.js");
    const agent = new InboxAgent(config);
    const result = await agent.processReply(leadId, replyText);
    console.log(`✅ Success: Intent identified as "${result.category}". Status updated to "${result.newStatus}".`);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Deal-Flow MCP server running");
  }
}

runCli().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});

# Deal Flow - Zero-Cost Production Backend Architecture & PRD

## 1. Product Requirements Document (PRD)

### Executive Summary
Deal Flow is an AI-driven, hyper-automated outbound sales agent designed to function as an elite digital BDR. It aggregates, filters, enriches, and structures personalized communications down to individual prospects without mass-blast generic spam. This architecture is specifically designed to run on **$0/month** by heavily utilizing generous free-tiers and self-hosted open-source models.

### Target Audience
- Bootstrapped B2B Founders 
- Indie Hackers & Startup Revenue Operators
- Agile sales teams needing automated outreach with zero infrastructure overhead.

### Core Workflows
1. **Sourcing / Web-Scraping**: Local browser automation extracts B2B targets from public sites.
2. **Verification & Enrichment**: System leverages local DNS MX record validation (zero cost) and free-tier basic enrichment.
3. **Drafting (AI Personalization)**: Utilizing Gemini API Free Tier (or local LLaMA via Ollama), unique communications are drafted highlighting specific signals.
4. **Outreach Execution**: Emails are sequentially scheduled mimicking human behavioral cadence via the user's existing connected Gmail accounts.

---

## 2. High-Level Zero-Cost System Architecture

To scale seamlessly while maintaining a $0 burn rate, we adopt a stateless, serverless event-driven architecture coupled with local-agent execution.

### Frontend Layer
- **Client**: React + TypeScript (Vite + Tailwind CSS). Hosted on **Vercel** or **Cloudflare Pages** (Free Tiers).

### Backend Layer (Zero-Cost Microservices)
- **API Engine**: **Supabase Edge Functions** (Deno) or Vercel Serverless Functions (Node.js). High compute, zero idle cost.
- **Authentication**: **Supabase Auth** (Free Tier covers up to 50k MAUs and handles Google SSO & Email/Password).
- **Core API Service**: Handles user rules, dashboard data, and database I/O entirely within the Supabase Free ecosystem.
- **Workflow Orchestrator (Worker Nodes)**: **GitHub Actions** cron jobs triggering Edge Functions, or local MCP agent runners to handle the pacing.

### Database Architecture
- **Primary DB (Relational)**: **Supabase (PostgreSQL)** Free Tier (500MB DB space, perfect for structured CRM data).
- **Cache & Rate-Limiter**: **Upstash Redis** (Free Tier: 10,000 requests/day). Stores temporary tracking state.

---

## 3. AI & Third-Party Integrations (100% Free Stack)

### The Data Sideloading (The "Sourcing" Phase)
- **Apify (Free Tier)**: Generous $5/mo equivalent free credits for isolated scrape jobs.
- **Local Puppeteer (MCP)**: For limitless scraping, run node-based Puppeteer locally as an MCP tool connected to the platform.
- **Email Validation**: Custom Node.js logic checking local DNS MX records + disposable email regex lists (Cost: $0).

### The AI Brain (The "Drafting & Verification" Phase)
- **Primary Draft Engine**: **Google Gemini 1.5 Pro / Flash (Free API Tier)**. The free tier offers 15 RPM, which is vastly sufficient for a cron-paced outbound system running in the background. 
- **Alternative Local Mode**: **Ollama** running DeepSeek-R1 or Llama-3 locally. 100% free, robust privacy.

### Email Delivery
- **Google Workspace / Gmail OAuth**: Connect directly to the user's standard or free `@gmail.com` accounts using standard IMAP/SMTP over OAuth2. Bypasses SendGrid/Mailgun completely, resulting in $0 API fees and maximum deliverability.

---

## 4. MCP (Model Context Protocol) Integration

To prevent the LLM from hallucinating data and run localized heavy tasks without paying for server compute, we use **Local MCP Servers**.

- **MCP Client**: Embedded in a local companion app or the user's browser.
- **Context injection:** When drafting an email, the MCP protocol restricts the AI to only writing context referencing retrieved `Recent News` from free open-source search APIs (like DuckDuckGo HTML parsing) instead of Paid Google Custom Search APIs.

### Example Free MCP Functions:
1. `validate_local_dns(domain)` -> Checks MX records locally. Returns True/False.
2. `scrape_linkedin_public(url)` -> Runs local headless browser to extract public BIO details without hitting expensive reverse APIs.
3. `draft_outreach_gemini(prospect_data)` -> Calls free-tier endpoint.

---

## End-User Journey
1. User logs in (Supabase Auth).
2. User authenticates their personal/business Gmail via OAuth.
3. User runs local MCP worker on their laptop.
4. Core API signals MCP to query open target list.
5. Local MCP runs headless check on prospect, verifies MX records (Cost: 0).
6. Local MCP hits Gemini Free API for custom drafts (Cost: 0).
7. Supabase stores final verified draft.
8. Daily cron job triggers Google API to drip out 40 emails/day from the user's IP/local agent.

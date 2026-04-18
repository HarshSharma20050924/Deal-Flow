# Deal-Flow Ultimate Deployment Guide

You can host **everything** for free using Vercel (for the UI) and GitHub Actions (for the Autonomous Engine).

## 1. Frontend (Vite on Vercel)
- Connect your repo to Vercel.
- Add these environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 2. Autonomous Engine (GitHub Actions)
The scraper and AI drafter will run automatically in the background using the GitHub Action I've created. 
- Go to your GitHub Repository **Settings > Secrets and variables > Actions**.
- Add these **New repository secrets**:
  - `SUPABASE_URL`: Your project URL.
  - `SUPABASE_SERVICE_ROLE_KEY`: Your secret service role key.
  - `GEMINI_API_KEY`: Your Google AI key.
  - `GROQ_API_KEY`: (Optional) Fallback key.
  - `MISTRAL_API_KEY`: (Optional) Fallback key.

**How it works**: Every 15 minutes, GitHub will wake up, search for new leads, scrape their websites for emails, and draft your messages. You don't need a separate server!

## 3. Local Development
If you want to run the worker locally while building:
```bash
cd sourcing-worker
npm install
npm run dev-server
```

---
**Status**: Pre-configured for zero-cost, high-fidelity autonomous operation.

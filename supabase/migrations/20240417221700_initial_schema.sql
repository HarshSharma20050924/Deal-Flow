-- Final Fresh-Start Schema
-- Use this if you hit structure errors

DROP TABLE IF EXISTS public.email_drafts CASCADE;
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.campaign_leads CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    company TEXT,
    linkedin_url TEXT,
    score INT DEFAULT 0,
    status TEXT DEFAULT 'new',
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    direction TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE public.email_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    subject TEXT,
    body TEXT,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMPTZ
);

CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    sender_name TEXT,
    sender_title TEXT,
    gemini_api_key TEXT,
    daily_limit INT DEFAULT 40,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Manage" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Public Manage" ON public.leads FOR ALL USING (true);
CREATE POLICY "Public Manage" ON public.email_logs FOR ALL USING (true);
CREATE POLICY "Public Manage" ON public.email_drafts FOR ALL USING (true);
CREATE POLICY "Public Manage" ON public.user_preferences FOR ALL USING (true);

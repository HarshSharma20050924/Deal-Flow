-- Add campaign_id as a first-class column for performance and reliability
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;

-- Create an index for faster filtering in the Dashboard
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads(campaign_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Add the missing structural columns for Deal-Flow
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS targeting_query TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'pending';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 1. Clean up old permissive policies
DROP POLICY IF EXISTS "Public Manage" ON public.campaigns;
DROP POLICY IF EXISTS "Public Manage" ON public.leads;
DROP POLICY IF EXISTS "Public Manage" ON public.email_logs;
DROP POLICY IF EXISTS "Public Manage" ON public.email_drafts;
DROP POLICY IF EXISTS "Public Manage" ON public.user_preferences;

-- 2. Enable strict RLS (Only show own data)
CREATE POLICY "Users can only manage their own campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own leads" ON public.leads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own email logs" ON public.email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.leads 
            WHERE leads.id = email_logs.lead_id 
            AND leads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only manage their own email drafts" ON public.email_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.leads 
            WHERE leads.id = email_drafts.lead_id 
            AND leads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 3. Ensure user_id is automatically set on creation (Frontend convenience)
ALTER TABLE public.campaigns ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.leads ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.user_preferences ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 4. Special allowance for the worker (Service Role Key)
-- The worker uses the Service Role Key which bypasses RLS, so these policies
-- only apply to browser-side (Frontend) users. This is exactly what we want.

NOTIFY pgrst, 'reload schema';

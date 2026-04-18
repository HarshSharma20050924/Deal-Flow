export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'replied' | 'bounced' | 'unsubscribed';

export interface Lead {
    id: string;
    created_at: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    industry: string | null;
    linkedin_url: string | null;
    score: number;
    status: LeadStatus;
    whatsapp_status: 'pending' | 'sent' | 'failed' | null;
    metadata: Record<string, any>;
    campaign_id: string | null;
    user_id: string | null;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Campaign {
    id: string;
    created_at: string;
    name: string;
    status: CampaignStatus;
    targeting_query: string | null;
    metadata: Record<string, any>;
    user_id: string | null;
}

export interface EmailDraft {
    id: string;
    created_at: string;
    lead_id: string;
    subject: string | null;
    body: string | null;
    status: 'pending' | 'approved' | 'sent' | 'failed';
    sent_at: string | null;
}

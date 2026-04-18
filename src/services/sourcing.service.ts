import type { LeadRepository } from '../repositories/lead.repository';
import type { Lead } from '../types/database';

export interface SourcingSource {
  type: 'linkedin' | 'website' | 'manual';
  url?: string;
  query?: string;
}

/**
 * Service orchestrating the Sourcing Phase of Deal-Flow.
 */
export class SourcingService {
  constructor(
    private leadRepo: LeadRepository
  ) {}

  /**
   * Processes a new lead, verifies it, and saves it.
   */
  async processDiscoveredLead(leadData: Partial<Lead>): Promise<Lead> {
    // 1. Initial Cleanup
    if (leadData.email) {
      leadData.email = leadData.email.trim().toLowerCase();
    }

    // 2. Verification (to be called via MCP or separate Node service)
    // For now, we assume verification happens before this call or we mark as 'new'
    
    // 3. Save to database
    return await this.leadRepo.create({
      ...leadData,
      status: 'new',
      score: this.calculateInitialScore(leadData)
    });
  }

  /**
   * Simple scoring heuristic for Phase 1.
   */
  private calculateInitialScore(leadData: Partial<Lead>): number {
    let score = 50; // Baseline

    if (leadData.linkedin_url) score += 10;
    if (leadData.industry?.toLowerCase().includes('saas')) score += 15;
    if (leadData.first_name && leadData.last_name) score += 5;

    return Math.min(score, 100);
  }
}

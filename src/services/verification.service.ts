import { resolveMx } from 'dns/promises';

/**
 * Service for zero-cost email verification using DNS MX records.
 */
export class VerificationService {
  /**
   * Validates if a domain has valid MX records.
   * @param email The email address to verify.
   * @returns Promise<boolean> True if the domain has MX records, false otherwise.
   */
  async validateMxRecord(email: string): Promise<boolean> {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;

      const records = await resolveMx(domain);
      return records && records.length > 0;
    } catch (error) {
      // If DNS lookup fails, the domain might not exist or have no mail server
      console.error(`MX lookup failed for ${email}:`, error);
      return false;
    }
  }

  /**
   * Basic regex validation for email format.
   */
  isValidFormat(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Full verification flow (Format + MX).
   */
  async verifyEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    if (!this.isValidFormat(email)) {
      return { valid: false, reason: 'Invalid format' };
    }

    const hasMx = await this.validateMxRecord(email);
    if (!hasMx) {
      return { valid: false, reason: 'No MX records found' };
    }

    return { valid: true };
  }
}

import { resolveMx } from 'dns/promises';

export class VerificationService {
  async validateMxRecord(email: string): Promise<boolean> {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;

      const records = await resolveMx(domain);
      return records && records.length > 0;
    } catch (error) {
      return false;
    }
  }

  isValidFormat(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

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

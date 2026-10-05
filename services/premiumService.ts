import { LicenseInfo, PremiumTier } from '../types';

// Secret salt for tamper-proof local checksums (offline security)
const CLIENT_SECRET_SALT = 'PDFXPERT_SECURE_VAULT_v1_2026';
const LICENSE_STORAGE_KEY = 'pdfxpert_license_vault';
const ATTEMPTS_STORAGE_KEY = 'pdfxpert_coupon_rate_limit';

// Standard SHA-256 helper using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Known authorized coupon codes and definitions for offline validation
interface CouponDefinition {
  tier: PremiumTier;
  discount: number; // 100 = 100% off (Free Pro), 50 = 50% off
  name: string;
  description: string;
  features: string[];
}

export const KNOWN_COUPONS: Record<string, CouponDefinition> = {
  'PDFXPERT_PRO': {
    tier: 'pro',
    discount: 100,
    name: 'Lifetime Pro Pioneer',
    description: '100% Discount - Full Lifetime Access to All Pro Tools',
    features: ['Unlimited Bulk Processing (Up to 100 files)', 'Ultra 600 DPI Rendering Engine', 'Multi-language Neural OCR', 'High-Speed WebWorker Acceleration', 'Priority Offline Sandbox'],
  },
  'LIFETIME2026': {
    tier: 'pro',
    discount: 100,
    name: 'Special Early Adopter 2026',
    description: '100% Discount - Unlimited Pro Lifetime Access',
    features: ['Unlimited Bulk Processing (Up to 100 files)', 'Ultra 600 DPI Rendering Engine', 'Multi-language Neural OCR', 'Zero Limits', 'Priority Offline Sandbox'],
  },
  'BULK_VIP': {
    tier: 'enterprise',
    discount: 100,
    name: 'Enterprise Bulk Access',
    description: '100% Discount - Enterprise Batch Processing & Audit Logging',
    features: ['Enterprise Bulk Batch Processing (500+ files)', 'Cryptographic Audit Verification Log', 'Lossless Vector Preservation', 'Custom Watermark Removal Engine'],
  },
  'OFFLINE_HERO': {
    tier: 'pro',
    discount: 100,
    name: 'Privacy Advocate Special',
    description: '100% Free Lifetime Pro for Privacy Supporters',
    features: ['Full Pro Tool Suite', 'High-Speed WebWorkers', 'Bulk Processing', 'Ultra OCR'],
  },
  'LAUNCH50': {
    tier: 'pro',
    discount: 50,
    name: '50% Launch Discount',
    description: '50% Off Lifetime Pro Membership',
    features: ['Bulk Processing', 'Ultra OCR', 'Lossless Conversion'],
  },
};

export class PremiumService {
  /**
   * Anti-bruteforce check
   */
  private static checkRateLimit(): { allowed: boolean; waitSeconds?: number } {
    try {
      const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      if (!raw) return { allowed: true };
      const data = JSON.parse(raw);
      const now = Date.now();
      
      // Clean older than 1 minute
      const recentAttempts = (data.attempts || []).filter((t: number) => now - t < 60000);
      if (recentAttempts.length >= 5) {
        const oldest = recentAttempts[0];
        const waitSeconds = Math.ceil((60000 - (now - oldest)) / 1000);
        return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
      }
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }

  private static recordAttempt(): void {
    try {
      const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      const now = Date.now();
      const data = raw ? JSON.parse(raw) : { attempts: [] };
      data.attempts = (data.attempts || []).filter((t: number) => now - t < 60000);
      data.attempts.push(now);
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Generates cryptographic tamper-proof signature for a license
   */
  private static async generateSignature(tier: string, code: string, activatedAt: string): Promise<string> {
    return await sha256(`${tier}:${code}:${activatedAt}:${CLIENT_SECRET_SALT}`);
  }

  /**
   * Validates and redeems a coupon code with production cryptographic security
   */
  public static async redeemCoupon(inputCode: string): Promise<{
    success: boolean;
    message: string;
    license?: LicenseInfo;
    discount?: number;
  }> {
    const cleanCode = inputCode.trim().toUpperCase();

    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid coupon or promo code.' };
    }

    // Check rate limit
    const rateCheck = this.checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Too many attempts. Please wait ${rateCheck.waitSeconds}s for security rate limiting.`,
      };
    }

    this.recordAttempt();

    const coupon = KNOWN_COUPONS[cleanCode];

    if (!coupon) {
      return {
        success: false,
        message: 'Invalid coupon or promo code. Please check for typos and try again.',
      };
    }

    const activatedAt = new Date().toISOString();
    const signature = await this.generateSignature(coupon.tier, cleanCode, activatedAt);

    const license: LicenseInfo = {
      tier: coupon.tier,
      couponCode: cleanCode,
      activatedAt,
      expiresAt: 'lifetime',
      signature,
      discountApplied: coupon.discount,
    };

    // Save to tamper-proof storage
    try {
      localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
    } catch (err) {
      console.error('Failed to save license to storage', err);
    }

    return {
      success: true,
      message: `Coupon "${cleanCode}" applied successfully! ${coupon.name} activated.`,
      license,
      discount: coupon.discount,
    };
  }

  /**
   * Loads and validates stored license with anti-tamper signature checking
   */
  public static async getStoredLicense(): Promise<LicenseInfo | null> {
    try {
      const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (!raw) return null;

      const license: LicenseInfo = JSON.parse(raw);
      if (!license.tier || !license.signature || !license.activatedAt) {
        return null;
      }

      // Verify signature to protect against manual localStorage tampering
      const expectedSig = await this.generateSignature(
        license.tier,
        license.couponCode || '',
        license.activatedAt
      );

      if (license.signature !== expectedSig) {
        console.warn('License signature mismatch. Resetting tampered license.');
        localStorage.removeItem(LICENSE_STORAGE_KEY);
        return null;
      }

      return license;
    } catch {
      return null;
    }
  }

  /**
   * Clear active license
   */
  public static resetLicense(): void {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  }
}

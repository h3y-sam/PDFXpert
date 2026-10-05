import React, { createContext, useContext, useState, useEffect } from 'react';
import { LicenseInfo, PremiumTier } from '../types';
import { PremiumService, KNOWN_COUPONS } from '../services/premiumService';
import toast from 'react-hot-toast';

interface PremiumContextType {
  tier: PremiumTier;
  isPro: boolean;
  isEnterprise: boolean;
  license: LicenseInfo | null;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  redeemCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  resetLicense: () => void;
  bulkLimit: number;
  availableCoupons: typeof KNOWN_COUPONS;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTier] = useState<PremiumTier>('free');
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    // Check stored license on mount
    PremiumService.getStoredLicense().then((savedLicense) => {
      if (savedLicense) {
        setLicense(savedLicense);
        setTier(savedLicense.tier);
      }
    });
  }, []);

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  const redeemCoupon = async (code: string) => {
    const result = await PremiumService.redeemCoupon(code);
    if (result.success && result.license) {
      setLicense(result.license);
      setTier(result.license.tier);
      toast.success(result.message, { duration: 4000 });
      return { success: true, message: result.message };
    } else {
      toast.error(result.message, { duration: 4000 });
      return { success: false, message: result.message };
    }
  };

  const resetLicense = () => {
    PremiumService.resetLicense();
    setLicense(null);
    setTier('free');
    toast.success('License reset back to Free Tier.');
  };

  const isPro = tier === 'pro' || tier === 'enterprise';
  const isEnterprise = tier === 'enterprise';
  const bulkLimit = isEnterprise ? 500 : isPro ? 100 : 10;

  return (
    <PremiumContext.Provider
      value={{
        tier,
        isPro,
        isEnterprise,
        license,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        redeemCoupon,
        resetLicense,
        bulkLimit,
        availableCoupons: KNOWN_COUPONS,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

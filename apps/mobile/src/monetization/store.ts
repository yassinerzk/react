import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FREE_ENTITLEMENTS,
  grantAdReward,
  grantPro,
  type AdOutcome,
  type Entitlements,
  type PurchaseOutcome,
} from '@barakah/core';
import { adapter } from './adapter';

interface EntitlementState {
  entitlements: Entitlements;
  busy: boolean;
  purchasePro: () => Promise<PurchaseOutcome>;
  restore: () => Promise<void>;
  watchAd: () => Promise<AdOutcome>;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      entitlements: FREE_ENTITLEMENTS,
      busy: false,
      purchasePro: async () => {
        set({ busy: true });
        try {
          const outcome = await adapter.purchasePro();
          if (outcome === 'purchased') set({ entitlements: grantPro(get().entitlements) });
          return outcome;
        } catch {
          return 'error';
        } finally {
          set({ busy: false });
        }
      },
      restore: async () => {
        set({ busy: true });
        try {
          const tier = await adapter.restorePurchases();
          if (tier === 'pro') set({ entitlements: grantPro(get().entitlements) });
        } finally {
          set({ busy: false });
        }
      },
      watchAd: async () => {
        set({ busy: true });
        try {
          const outcome = await adapter.showRewardedAd();
          if (outcome === 'rewarded') set({ entitlements: grantAdReward(get().entitlements) });
          return outcome;
        } catch {
          return 'error';
        } finally {
          set({ busy: false });
        }
      },
    }),
    { name: 'barakah.entitlements', version: 1, storage: createJSONStorage(() => AsyncStorage) },
  ),
);

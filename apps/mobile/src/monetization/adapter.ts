import { NOOP_ADAPTER, type MonetizationAdapter } from '@barakah/core';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Simulates billing and ads so the flow can be exercised in Expo Go.
 * Replaced by RevenueCat + AdMob adapters in a native build (docs/MONETIZATION.md).
 */
export const DEV_ADAPTER: MonetizationAdapter = {
  id: 'dev',
  purchasePro: async () => {
    await wait(800);
    return 'purchased';
  },
  restorePurchases: async () => {
    await wait(400);
    return 'free';
  },
  showRewardedAd: async () => {
    await wait(1500);
    return 'rewarded';
  },
};

/** The adapter this build uses. Swap here when the SDKs are wired in. */
export const adapter: MonetizationAdapter = __DEV__ ? DEV_ADAPTER : NOOP_ADAPTER;

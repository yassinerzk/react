/**
 * Monetization foundation. The app decides what a user may do from an
 * `Entitlements` value; how that value is obtained (in-app purchase,
 * rewarded ad, server record) is behind `MonetizationAdapter`, so billing
 * and ad SDKs can be added later without touching the UI.
 */

export const APP_NAME = 'Barakah Stories';

/** Text drawn at the bottom of every story for free users. */
export const WATERMARK_TEXT = APP_NAME;

export type Tier = 'free' | 'pro';

export interface Entitlements {
  tier: Tier;
  /** Epoch ms until which a rewarded ad keeps stories watermark-free. */
  adRewardUntil: number;
  /** When these entitlements were last confirmed (purchase restore, server sync). */
  updatedAt: number;
}

export const FREE_ENTITLEMENTS: Entitlements = { tier: 'free', adRewardUntil: 0, updatedAt: 0 };

/** How long one rewarded ad removes the watermark. */
export const AD_REWARD_DURATION_MS = 24 * 60 * 60 * 1000;

export function isPro(e: Entitlements): boolean {
  return e.tier === 'pro';
}

export function hasAdReward(e: Entitlements, now = Date.now()): boolean {
  return e.adRewardUntil > now;
}

/** Whether the user may publish a story without the app name on it. */
export function canRemoveWatermark(e: Entitlements, now = Date.now()): boolean {
  return isPro(e) || hasAdReward(e, now);
}

/** True when the watermark must be drawn for this design and user. */
export function shouldShowWatermark(hideRequested: boolean, e: Entitlements, now = Date.now()): boolean {
  return !(hideRequested && canRemoveWatermark(e, now));
}

export function grantAdReward(e: Entitlements, now = Date.now()): Entitlements {
  return { ...e, adRewardUntil: Math.max(e.adRewardUntil, now) + AD_REWARD_DURATION_MS, updatedAt: now };
}

export function grantPro(e: Entitlements, now = Date.now()): Entitlements {
  return { ...e, tier: 'pro', updatedAt: now };
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'unavailable' | 'error';
export type AdOutcome = 'rewarded' | 'dismissed' | 'unavailable' | 'error';

/**
 * Bridge to the platform's billing and ads. Implementations planned:
 * RevenueCat (App Store / Play Billing) and Google AdMob rewarded ads.
 * See docs/MONETIZATION.md.
 */
export interface MonetizationAdapter {
  readonly id: string;
  purchasePro(): Promise<PurchaseOutcome>;
  restorePurchases(): Promise<Tier>;
  showRewardedAd(): Promise<AdOutcome>;
}

/** Adapter used until a billing/ads SDK is integrated. */
export const NOOP_ADAPTER: MonetizationAdapter = {
  id: 'noop',
  purchasePro: async () => 'unavailable',
  restorePurchases: async () => 'free',
  showRewardedAd: async () => 'unavailable',
};

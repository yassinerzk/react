# Monetization plan

## Model

| Tier      | Price                          | What it changes                                                                                        |
| --------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Free      | –                              | Everything works. Stories carry a small "Barakah Stories" line at the bottom.                          |
| Ad reward | Watch one rewarded ad          | Removes the app name from stories for 24 hours (stackable).                                            |
| Pro       | One-time or yearly (to decide) | Removes the app name permanently. Room for later perks: extra photo packs, fonts, cloud backup limits. |

Religious content itself (Quran, hadith, duaa) stays free and complete in every tier.

## Foundation already in the code

- `packages/core/src/monetization.ts`
  - `Entitlements` = `{ tier, adRewardUntil, updatedAt }`, plus pure helpers:
    `canRemoveWatermark`, `shouldShowWatermark`, `grantAdReward`, `grantPro`.
  - `MonetizationAdapter` interface: `purchasePro()`, `restorePurchases()`, `showRewardedAd()`.
    The UI only talks to this interface.
  - `NOOP_ADAPTER` is used until an SDK is integrated; it reports "unavailable".
- `apps/mobile/src/monetization/`
  - `store.ts` persists entitlements locally and exposes `removeWatermark()` orchestration.
  - `adapter.ts` selects the adapter. In development builds a `DevAdapter` simulates a purchase
    and a rewarded ad so the whole flow can be exercised in Expo Go.
- The story card takes `showWatermark`; the editor has an "App name on story" switch that opens
  the Go Pro / Watch an ad choice for free users; the Me tab shows the Pro section.
- `StoryDesign.hideWatermark` records the user's wish; it is only honoured when entitled.

## Implementation steps (when ready)

1. **Billing: RevenueCat** (`react-native-purchases`). Create products
   `barakah_pro_lifetime` / `barakah_pro_yearly` in App Store Connect and Play Console, an
   entitlement `pro` in RevenueCat, then implement `RevenueCatAdapter`:
   `purchasePro` → `Purchases.purchasePackage`, `restorePurchases` → `Purchases.restorePurchases`,
   map `customerInfo.entitlements.active.pro` → `tier: 'pro'`.
2. **Rewarded ads: Google AdMob** (`react-native-google-mobile-ads`). One rewarded ad unit per
   platform; implement `showRewardedAd` with `RewardedAd.createForAdRequest`; resolve `rewarded`
   only on the `EARNED_REWARD` event. Add the UMP consent flow (EU) and iOS App Tracking
   Transparency prompt before loading ads.
3. **Native build.** Both SDKs need native code, so switch from Expo Go to a development build
   (`npx expo run:ios` / `run:android` or EAS dev client). Expo Go keeps working with the
   `NoopAdapter`.
4. **Server truth (optional but recommended).** Add a `entitlements` table in Supabase
   (`user_id`, `tier`, `source`, `expires_at`) fed by the RevenueCat webhook, and read it in
   `syncAll` so Pro follows the account across devices. Keep the local copy as cache.
5. **Abuse limits.** Cap ad rewards per day (e.g. 3) in the store, and never trust the client
   for Pro when the account is signed in: prefer the server record.
6. **Analytics.** Log `watermark_prompt_shown`, `ad_started`, `ad_rewarded`, `pro_purchased`
   to whatever analytics you choose, so the two paths can be compared.

## Things to decide

- Pro price and whether it is lifetime or subscription.
- Whether Pro should include premium photo packs (the photo registry already supports adding
  packs; gating would be a `premium: true` flag on backgrounds).
- Whether to show any non-rewarded ads at all. The current plan avoids banner ads inside
  religious content.

/**
 * Interstitial ad policy. Free users see a full-screen ad around the
 * story-making flow; Pro users see none. Every rule lives here as a pure
 * function so the frequency caps are testable without an ad SDK, and so the
 * app never has to reason about "should I show one?" at the call site.
 *
 * Ads appear only around making and exporting a story. They never appear in
 * the Quran reader, the hadith library or the prayer screens — see
 * docs/MONETIZATION.md.
 */

import { isPro, type Entitlements } from './monetization';

/**
 * Where an interstitial may appear.
 *
 * - `before-create` — opening the editor, a natural screen transition.
 * - `after-export`  — once the share sheet has closed and the story is out.
 *
 * Both sit either side of the export rather than in front of it. An
 * interstitial shown *between* the user tapping Share and the share sheet
 * opening is the pattern Google Play's disruptive-ads policy targets, and it
 * is also the one users uninstall over.
 */
export type AdPlacement = 'before-create' | 'after-export';

export interface AdPolicy {
  /** Never show two interstitials closer together than this. */
  minIntervalMs: number;
  /** Hard ceiling per app session, however long the session runs. */
  maxPerSession: number;
  /** Stories a new user may create before the first ad ever appears. */
  graceStories: number;
}

/**
 * Deliberately conservative. Two interstitials per story with no cap would
 * mean six full-screen ads in the first few minutes of use, which costs more
 * in uninstalls than it earns in impressions.
 */
export const DEFAULT_AD_POLICY: AdPolicy = {
  minIntervalMs: 90_000,
  maxPerSession: 4,
  graceStories: 3,
};

/** Counters the app persists between launches, except `shownThisSession`. */
export interface AdState {
  /** Epoch ms of the last interstitial, 0 if none yet. */
  lastShownAt: number;
  /** Reset to 0 on every cold start. */
  shownThisSession: number;
  /** Lifetime count, used only to spend the grace window. */
  storiesStarted: number;
}

export const INITIAL_AD_STATE: AdState = { lastShownAt: 0, shownThisSession: 0, storiesStarted: 0 };

/** Pro removes ads entirely. A rewarded-ad grant does not — it only lifts the badge. */
export function showsAds(e: Entitlements): boolean {
  return !isPro(e);
}

/**
 * The single question the UI asks. `placement` is accepted so that turning one
 * placement off later is a change here rather than at two call sites.
 */
export function shouldShowAd(
  placement: AdPlacement,
  e: Entitlements,
  state: AdState,
  now = Date.now(),
  policy: AdPolicy = DEFAULT_AD_POLICY,
): boolean {
  if (!showsAds(e)) return false;
  // recordStoryStarted() runs when the editor opens, so the story being
  // made right now is already counted: story N sees an ad once N exceeds the window.
  if (state.storiesStarted <= policy.graceStories) return false;
  if (state.shownThisSession >= policy.maxPerSession) return false;
  if (state.lastShownAt > 0 && now - state.lastShownAt < policy.minIntervalMs) return false;
  return placement === 'before-create' || placement === 'after-export';
}

/** Call once an interstitial has actually been displayed, never when one was merely requested. */
export function recordAdShown(state: AdState, now = Date.now()): AdState {
  return { ...state, lastShownAt: now, shownThisSession: state.shownThisSession + 1 };
}

/** Call when the editor opens on a new story, so the grace window is spent by use rather than time. */
export function recordStoryStarted(state: AdState): AdState {
  return { ...state, storiesStarted: state.storiesStarted + 1 };
}

/** Call on a cold start: session counters reset, lifetime and interval counters survive. */
export function resetSession(state: AdState): AdState {
  return { ...state, shownThisSession: 0 };
}

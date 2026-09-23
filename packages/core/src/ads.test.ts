import {
  DEFAULT_AD_POLICY,
  INITIAL_AD_STATE,
  recordAdShown,
  recordStoryStarted,
  resetSession,
  shouldShowAd,
  showsAds,
  type AdState,
} from './ads';
import { FREE_ENTITLEMENTS, grantAdReward, grantPro } from './monetization';

describe('ads', () => {
  const now = 1_700_000_000_000;
  const free = FREE_ENTITLEMENTS;
  const pro = grantPro(FREE_ENTITLEMENTS, now);

  /** A free user who has used up the grace window and seen no ads yet. */
  const warm: AdState = { ...INITIAL_AD_STATE, storiesStarted: DEFAULT_AD_POLICY.graceStories + 1 };

  it('shows ads to free users and never to Pro', () => {
    expect(showsAds(free)).toBe(true);
    expect(showsAds(pro)).toBe(false);
    expect(shouldShowAd('before-create', free, warm, now)).toBe(true);
    expect(shouldShowAd('before-create', pro, warm, now)).toBe(false);
    expect(shouldShowAd('after-export', pro, warm, now)).toBe(false);
  });

  it('a rewarded ad lifts the badge but does not buy an ad-free app', () => {
    const rewarded = grantAdReward(FREE_ENTITLEMENTS, now);
    expect(showsAds(rewarded)).toBe(true);
    expect(shouldShowAd('after-export', rewarded, warm, now)).toBe(true);
  });

  it('leaves the first few stories of a new install alone', () => {
    let state = INITIAL_AD_STATE;
    for (let i = 0; i < DEFAULT_AD_POLICY.graceStories; i++) {
      state = recordStoryStarted(state);
      expect(shouldShowAd('before-create', free, state, now)).toBe(false);
    }
    state = recordStoryStarted(state);
    expect(shouldShowAd('before-create', free, state, now)).toBe(true);
  });

  it('keeps two interstitials apart by the minimum interval', () => {
    const shown = recordAdShown(warm, now);
    expect(shouldShowAd('after-export', free, shown, now + DEFAULT_AD_POLICY.minIntervalMs - 1)).toBe(false);
    expect(shouldShowAd('after-export', free, shown, now + DEFAULT_AD_POLICY.minIntervalMs)).toBe(true);
  });

  it('caps a single session however long it runs', () => {
    let state = warm;
    let clock = now;
    for (let i = 0; i < DEFAULT_AD_POLICY.maxPerSession; i++) {
      expect(shouldShowAd('before-create', free, state, clock)).toBe(true);
      state = recordAdShown(state, clock);
      clock += DEFAULT_AD_POLICY.minIntervalMs;
    }
    expect(state.shownThisSession).toBe(DEFAULT_AD_POLICY.maxPerSession);
    expect(shouldShowAd('before-create', free, state, clock)).toBe(false);
    // A day later, still the same session: the cap holds.
    expect(shouldShowAd('before-create', free, state, clock + 86_400_000)).toBe(false);
  });

  it('a cold start clears the session cap but not the interval or the grace window', () => {
    const capped = { ...warm, lastShownAt: now, shownThisSession: DEFAULT_AD_POLICY.maxPerSession };
    const fresh = resetSession(capped);
    expect(fresh.shownThisSession).toBe(0);
    expect(fresh.lastShownAt).toBe(now);
    expect(fresh.storiesStarted).toBe(capped.storiesStarted);
    expect(shouldShowAd('before-create', free, fresh, now + 1)).toBe(false);
    expect(shouldShowAd('before-create', free, fresh, now + DEFAULT_AD_POLICY.minIntervalMs)).toBe(true);
  });

  it('honours a policy passed in, so the caps can be tuned without touching call sites', () => {
    const strict = { minIntervalMs: 0, maxPerSession: 1, graceStories: 0 };
    const started = recordStoryStarted(INITIAL_AD_STATE);
    expect(shouldShowAd('before-create', free, started, now, strict)).toBe(true);
    expect(shouldShowAd('before-create', free, recordAdShown(started, now), now, strict)).toBe(false);
  });
});

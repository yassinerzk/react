# v1.1 feature plan — video backgrounds and Quran recitation

Deferred feature work, planned in detail. **This is not what Pro sells.** Pro is defined in
`docs/MONETIZATION.md` as one promise — no badge, no ads — and it can go on sale without any of
this. What follows is the plan for the two features themselves: **moving backgrounds** and **Quran
recitation on exported stories**, both deferred to v1.1 alongside the MP4 encoder they need
(`docs/RELEASE-LOG.md`, "Deferred to v1.1").

Read section 1 first. Two external facts decide the shape of everything below, and one of them —
the licensing constraint — binds harder now that the free tier carries ads.

## 1. Two constraints that come before design

### 1.1 Recitation audio cannot be the thing money buys

Every convenient source of ready-made recitation audio is licensed in a way that excludes a paid
tier:

| Source                                   | Licence                                                              | Usable in Pro?                    |
| ---------------------------------------- | -------------------------------------------------------------------- | --------------------------------- |
| everyayah.com                            | CC-BY-**NC** — non-commercial                                        | No                                |
| Quran Foundation / Quran.com Content API | Personal, non-commercial use; redistribution needs written consent   | No, not without a written licence |
| Reciter recordings generally             | Copyright stays with the reciter or their estate, even when mirrored | Only with permission, revocable   |

So "Pro unlocks Quran recitation" is not a pricing decision we get to make — it is a licensing
question, and the default answer is no. It also contradicts the principle already written into
`docs/MONETIZATION.md`: _religious content itself stays free and complete in every tier_.

**The design that works instead:** recitation is free to listen to in the Quran reader. What Pro
sells is the **production** — rendering a story as a video with the recitation laid over it, without
a watermark. That is our own software and our own footage, and it keeps the money attached to
something we actually own.

Three routes to audio we may lawfully ship. They are not exclusive:

1. **Commission a recitation** (recommended for launch). Pay a qari for a work-for-hire recording
   covering only the verses our cards actually use — roughly the 90 Quran cards, not all 6,236
   ayat. Bounded cost, we own the master outright, no NC clause, no takedown risk, and it becomes
   something no competitor has.
2. **Written licence** from a reciter, publisher, or the Quran Foundation, covering a paid app.
   Worth starting in parallel if we want a recognisable name; slow and outside our control.
3. **Explicitly permissive recordings** where the reciter has released the work for any use.
   Cheapest, but verify each one individually and keep the evidence.

Whatever we ship, store the licence text and the reciter's permission alongside the audio in the
repo, and credit the reciter on screen.

**Ads tighten this, they do not loosen it.** It might look as though keeping recitation free of
charge satisfies a non-commercial licence. It does not: an ad-supported app is commercial use, so
NC-licensed audio is off the table for every tier of this app, free included, as soon as the first
interstitial loads. `docs/RELEASE-LOG.md` already reached the same conclusion under "Audio policy"
and adds the production rules — voice only, ayah boundaries, on-screen attribution, loudness
normalised to about −16 LUFS. Those still stand; treat that section and this one as one decision.

### 1.2 There is no longer a drop-in FFmpeg for React Native

FFmpegKit was archived on 2 July 2026. The native binaries were pulled from every repository and
`ffmpeg-kit-react-native` went with it; the author cited legal and patent pressure. `FFmpegKitNext`
continues it as **source only** — you build the binaries yourself.

So "composite the video on the device with ffmpeg" is no longer a dependency we add in an afternoon.
Section 5 weighs what is left.

### 1.3 The privacy promise constrains where rendering happens

`docs/PRIVACY.md` currently states: _"the app creates an image on your device and hands it to your
phone's normal share sheet … The image never passes through us."_ Any server-side rendering breaks
that sentence. The policy anticipates this — it says it will be updated before such a version ships
— but it is a real cost to weigh in section 5, not a footnote.

Unrelated to Pro but adjacent, and worth fixing in the same pass: the privacy policy says _"we do
not use advertising"_ while the monetization plan schedules AdMob rewarded ads. One of the two has
to change before an ad SDK ships.

## 2. How this relates to the tiers

Pro is "no badge, no ads" and is on sale independently of this work. That leaves a question these
features have to answer when they land, and it is worth answering now rather than at ship time:

- **Recitation in the reader** is free, always. Section 1.1 is the reason, and it is a licence
  term rather than a preference.
- **Video backgrounds and video export** are the honest candidates for gating, because they are
  our own footage and our own encoder. They can be a Pro perk, a separate one-off purchase, or
  simply free and ad-supported like everything else.
- Whatever is decided, it is a decision for v1.1. Nothing here needs to be settled for Pro to go
  on sale, and settling it early would only constrain the answer with less information than we
  will have then.

The entitlement layer is already capability-based (section 3.3), so gating any of this later is a
registry flag and a predicate, not a refactor.

## 3. Data model

All of this is pure TypeScript in `packages/core`, unit-testable without a device, matching how
themes, backgrounds and entitlements are already modelled.

### 3.1 Backgrounds gain a kind and a gate

`packages/core/src/types.ts`:

```ts
export type BackgroundKind = 'photo' | 'video';

export interface Background {
  id: Exclude<BackgroundId, 'none'>;
  name: Localized;
  kind: BackgroundKind;
  scrim: ScrimKind;
  /** Pro-only. Absent means free. */
  premium?: boolean;
  /** Video only: loop length, and download size for the prompt. */
  durationMs?: number;
  bytes?: number;
}
```

Keep `BackgroundId` a literal union. It is what makes adding content a compile-time-checked
operation today, and the registry staying static costs nothing even when the _files_ are fetched at
runtime. Move to a remote manifest only when shipping a pack without an app update becomes a real
need.

The 12 existing entries become `kind: 'photo'` with no `premium` flag, so nothing free changes.

### 3.2 StoryDesign gains recitation and motion

```ts
export interface StoryDesign {
  // … existing fields unchanged
  /** Recitation to lay over a video export. Null for a silent or still story. */
  recitation: RecitationChoice | null;
  /** How the text enters on a video export. */
  motion: 'none' | 'fade' | 'rise';
}

export interface RecitationChoice {
  reciterId: ReciterId;
  surah: number;
  ayah: number;
  /** Inclusive; omit for a single ayah. */
  endAyah?: number;
}
```

Both are recorded whether or not the user is entitled, exactly as `hideWatermark` already is — the
design stores the wish, and the renderer honours it only when entitled. That keeps a design
portable: someone who subscribes later gets their saved stories rendering as video with no
migration. `SavedDesign` needs no change; bump the persisted-store version and default the two new
fields.

### 3.3 Entitlements become capability-based

`packages/core/src/monetization.ts` gains one predicate rather than a predicate per feature:

```ts
export type ProFeature = 'video-background' | 'recitation-export' | 'video-export' | 'no-watermark';

export function can(e: Entitlements, f: ProFeature, now = Date.now()): boolean {
  if (f === 'no-watermark') return canRemoveWatermark(e, now);
  return isPro(e);
}
```

`canRemoveWatermark` and `shouldShowWatermark` keep their current behaviour and their tests. The
existing `monetization.test.ts` extends naturally: a rewarded ad grants `no-watermark` and nothing
else; Pro grants all four.

## 4. Assets

### 4.1 Video backgrounds

- **Format.** H.264 + AAC MP4, 1080x1920, 30 fps, 4–6 s, **seamlessly looping** (last frame flows
  into the first). Target 2–4 MB each. Subject matter to match the photo set: slow water, drifting
  clouds, lantern flicker, candlelight, dust in a shaft of light, gentle camera drift over a mosque
  courtyard. Slow and quiet — the text is the subject, the motion is atmosphere.
- **Do not bundle them in the binary.** Anything shipped in the APK or IPA is extractable, which
  makes the paywall cosmetic, and 10 videos would add ~30 MB to every free install. Host them and
  download on demand.
- **Hosting and gating.** A private Supabase Storage bucket `pro-assets`, plus an Edge Function
  `sign-asset` that checks the caller's entitlement and returns a short-lived signed URL. Cache with
  `expo-file-system` keyed by a manifest carrying `sha256` and `bytes`; show a one-time
  "Download (3 MB)" prompt per video and let the user delete cached ones.
- **Identity wrinkle, worth deciding early.** People buy Pro without an account, so the local
  RevenueCat receipt is the primary source of truth — but a server-side gate needs _some_ identity.
  Either require sign-in for Pro downloads, or have `sign-asset` validate the caller's RevenueCat
  `app_user_id` against RevenueCat's REST API. The second keeps account-less Pro working and is the
  one to build.

### 4.2 Recitation audio

- Per-ayah files, AAC or Opus, mono, 64–96 kbps. Per-ayah (not per-surah) keeps a single-verse story
  trivial to assemble and matches how the reader will highlight along.
- Same private bucket and signing path for Pro use; free reader playback can stream from a public
  bucket, since free playback is what the licence in section 1.1 actually permits.
- A `reciters.ts` registry in core alongside `fonts.ts` and `themes.ts`: `id`, `name: Localized`,
  `style`, `licence`, `credit`.

## 5. The video export pipeline — the real decision

Today: `captureRef` → PNG → `expo-sharing`. A video story needs three inputs composited into an
MP4: the looping background, a **transparent** 1080x1920 PNG of the text layer, and an audio track.

The transparent overlay is close to free. `StoryCard` already renders its background as a distinct
block, then decoration and frame, then content. A `transparent?: boolean` prop that skips the
background block and the `backgroundColor` is about five lines, and the existing capture path
produces the overlay at exactly the right size. Everything else is the encoder.

Three ways to get one:

**A. On-device native compositing — recommended.** A small Expo module over each platform's own
video framework: `AVMutableVideoComposition` with `AVVideoCompositionCoreAnimationTool` on iOS,
`androidx.media3.transformer` with an overlay effect on Android. Both are first-party, supported,
and do exactly this job.

- No per-render cost, works offline, and the privacy promise in section 1.3 survives untouched.
- No GPL or patent baggage, and no dependency that can be archived out from under us.
- Costs two native code paths to write and maintain, and a development build — which RevenueCat and
  AdMob already require, so that is not a new cost.

**B. Server render worker.** Device uploads the overlay PNG; a container with ffmpeg runs one
command; device downloads the MP4 and shares it.

- One code path, easy to iterate on, no native module.
- But it breaks the privacy promise and forces a policy rewrite before release; it adds per-render
  cost, latency and an abuse surface; and export stops working offline.
- Reasonable as a fallback if A stalls, or as a deliberate first step to validate demand before
  investing in native code. If used even once in production, update `PRIVACY.md` first.

**C. Build our own ffmpeg binaries** (FFmpegKitNext, source only). Full ffmpeg power, but we would
own an ffmpeg toolchain for two platforms, inherit the LGPL/GPL and patent questions the original
author retired over, and add the most weight to the app. Not recommended.

**Output contract**, whichever wins: 1080x1920, H.264 high profile, 30 fps, AAC 128 kbps, 6–15 s,
`faststart`. WhatsApp status accepts up to 30 s; Instagram stories cut at 15 s. Loop the background
to fill the audio, fade the audio out over the last 400 ms, and offer a **still PNG** of the same
design as a one-tap alternative — some people will want the image.

One thing not to do: ship "video backgrounds" that animate in the editor but export as a still. That
sells something we did not build. Pro does not go on sale until export produces a video.

## 6. Server truth for entitlements

Add to `supabase/schema.sql`, following the RLS shape the existing tables already use:

```sql
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  source text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

-- Owners read their own row and never write it; only the RevenueCat webhook
-- (service role) writes, so a client cannot grant itself Pro.
create policy "read own entitlements" on public.entitlements
  for select using (auth.uid() = user_id);
```

Fed by the RevenueCat webhook, read in `syncAll`, with the local copy kept as cache.
`delete_account()` already cascades it away through the foreign key.

## 7. Web app

Pro stays mobile-only at launch. Browser video export means WebCodecs or `MediaRecorder` — a
separate implementation with its own quirks, for the companion surface rather than the product. The
web app keeps the full free feature set and gets a "Pro is on the phone" pointer. Revisit once the
mobile pipeline is proven.

## 8. Phasing

Each phase is shippable, and they are ordered so the risky, expensive work happens after the cheap
work has de-risked it.

| Phase | Work                                                                                                                                                                                     | New dependencies         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 0     | Types from section 3 and `can()` with its tests. Pure core, no behaviour change shipped. (The ad policy half of this landed already as `packages/core/src/ads.ts`.)                      | none                     |
| 1     | **Recitation in the reader, free.** Audio registry, per-ayah playback, ayah highlight, background audio. Proves the asset pipeline and settles the licence before any money is involved. | `expo-audio`             |
| 2     | **Video backgrounds, preview only.** Registry entries, download-and-cache, looping playback in the editor, Pro gating in the picker. Requires a development build.                       | `expo-video`             |
| 3     | **The encoder.** `transparent` prop on `StoryCard`, the native module from option A, video share, still-PNG fallback.                                                                    | custom Expo module       |
| 4     | **Billing and gating.** RevenueCat adapter, `entitlements` table and webhook, `sign-asset` Edge Function.                                                                                | `react-native-purchases` |
| 5     | Pricing, store listing, `PRIVACY.md` rewrite, reciter credits, launch.                                                                                                                   | none                     |

Phase 1 is first on purpose: it is free, it is the feature most likely to be asked for anyway, and
it forces the licensing question into the open while nothing is for sale yet.

Note that `expo-av` is gone — removed in SDK 55 — so phases 1 and 2 use `expo-audio` and
`expo-video`, which is where the project would have to land regardless.

## 9. Decisions needed

1. **Recitation source** — commission, licence, or permissive-only? Section 1.1. This gates phase 1
   and has the longest lead time, so decide it first.
2. **Export pipeline** — native module (A) or server worker (B)? Section 5. Determines whether
   `PRIVACY.md` has to change.
3. **Price and model** — still open from `docs/MONETIZATION.md`. A recurring server cost argues for
   a subscription; option A's zero marginal cost makes a lifetime price viable.
4. **Confirm the ad reward stays watermark-only.** Section 2.
5. **How many video backgrounds at launch?** Six good loops beat twelve mediocre ones, and each one
   is a real production cost.
6. **Account-less Pro** — require sign-in for Pro asset downloads, or validate the RevenueCat
   `app_user_id` server-side? Section 4.1.

## 10. Risks

| Risk                                                     | Handling                                                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| A reciter or rights holder asks for removal              | Own the master (commission) or hold written permission. Keep a kill switch in the audio manifest.                            |
| Store review objects to paid access to religious content | Recitation is free; Pro sells video production. Keep that distinction visible in the listing and the paywall copy.           |
| Native encoder takes longer than expected                | Ship phases 1 and 2 (free recitation, animated preview) and hold the Pro launch until 3 lands. Option B is the escape hatch. |
| Video assets inflate install size or data use            | Nothing bundled; explicit per-video download prompt; deletable cache.                                                        |
| Users expect video export on the web                     | Say plainly in the web app that Pro lives on the phone.                                                                      |

## References

- [Saying Goodbye to FFmpegKit](https://tanersener.medium.com/saying-goodbye-to-ffmpegkit-33ae939767e1)
  and [arthenica/ffmpeg-kit#1099](https://github.com/arthenica/ffmpeg-kit/issues/1099) — the archive
  and the React Native migration note.
- [Quran.com terms and conditions](https://quran.com/terms-and-conditions) and the
  [Quran Foundation audio API docs](https://api-docs.quran.foundation/docs/sdk/javascript/audio/) —
  content terms for API audio.
- [everyayah.com recitations](https://everyayah.com/recitations_pages.html) and the
  [audio.quran.com licence](https://github.com/quran/audio.quran.com/blob/master/LICENSE) —
  non-commercial terms, rights retained by reciters.
- [Expo AV removal](https://github.com/expo/expo/issues/37259) and
  [expo-video](https://expo.dev/blog/expo-video-a-simple-powerful-way-to-play-videos-in-apps) — why
  phases 1–2 use `expo-audio` and `expo-video`.

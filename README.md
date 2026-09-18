# Barakah Stories

Create and share Islamic WhatsApp story posts: Jumu'ah greetings, morning and evening adhkar, Ramadan, Laylat al-Qadr, Eid al-Fitr, Dhul Hijjah and Arafah, Eid al-Adha, the Hijri new year and Ashura, Isra and Mi'raj, plus daily Quran verses, hadith, duaa and life occasions. The mobile app also shows prayer times, a next-prayer countdown and a live Qibla compass.

Pick a post, change any of the text, choose a colour theme or a photo background, a decoration and a font, then share it straight to your WhatsApp status at the native 1080x1920 size.

The mobile app also includes a Quran reader that remembers where you stopped and which chapters you finished, and a hadith library with Sahih al-Bukhari and Sahih Muslim that you can read by topic or search, with a filter that shows only supplications. Signing up keeps saved posts and reading progress in sync across devices.

## Workspaces

```
packages/core     @barakah/core    Shared domain logic (pure TypeScript, no UI)
packages/assets                    Photo backgrounds, Quran chapters and hadith indexes shared by both apps
supabase/                          Database schema for optional accounts and sync
apps/web          @barakah/web     Vite + React web app (GitHub Pages)
apps/mobile       @barakah/mobile  Expo (React Native) app for iOS, Android and web
```

Dependencies flow one way: apps import `@barakah/core`; core imports nothing from any app.

### What lives in core

- `types.ts` — every domain type. Add new ids here first.
- `content/` — categories and posts, one file per category.
- `themes.ts`, `backgrounds.ts`, `fonts.ts` — visual registries as data (gradients are structured so web renders CSS and mobile renders SVG).
- `occasions.ts` — rules that decide what is relevant "today".
- `design.ts` — the `StoryDesign` model, typography engine and caption text.
- `hijri.ts` — Hijri date via `Intl`, with an arithmetic fallback for engines without the Umm al-Qura calendar.
- `quran.ts` — chapter index (bundled from `packages/assets/quran`), reading-progress helpers.
- `hadith.ts` — book and section indexes, edition merging, Arabic-aware normalisation, topic search and supplication detection.
- `prayer.ts`, `cities.ts` — prayer times, next prayer, Qibla bearing (built on the `adhan` library) and preset cities.
- `i18n/` — English and Arabic dictionaries.

## Getting started

Requires Node 20+.

```bash
npm install                 # installs all workspaces
npm run check               # typecheck + lint + prettier + tests, everywhere
```

### Web app

```bash
npm run dev                 # http://localhost:5173
npm run build               # apps/web/dist
```

### Mobile app (Expo)

```bash
cd apps/mobile
npx expo start              # scan the QR code with Expo Go on iOS or Android
npx expo start --web        # run the same app in a browser
```

**Accounts (optional).** Create a free [Supabase](https://supabase.com) project, run `supabase/schema.sql` in its SQL editor, then copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in the project URL and anon key. Without these, the app runs fully offline and only hides sign-up.

**Hadith data.** The two collections (about 12–14 MB each, Arabic and English) are downloaded on first use from the jsDelivr mirror of the `fawazahmed0/hadith-api` dataset and cached on the device. The Quran text (quran-json, CC BY 4.0, Saheeh International translation) is bundled with the app.

Store builds use [EAS Build](https://docs.expo.dev/build/introduction/): `npx eas build --platform all` after `npx eas login`.

The mobile app uses:

- `react-native-view-shot` to rasterise the story card at 1080x1920 and `expo-sharing` to open the native share sheet, where WhatsApp offers "My status".
- `expo-location` for the user's position, reverse geocoding, and the compass heading that drives the Qibla dial.
- `@expo-google-fonts/*` for the same Arabic and Latin faces as the web app.
- Zustand with AsyncStorage for settings, the current draft, saved posts, recently opened posts and prayer settings.

## Extending the app

**Add a post**: append an object to the matching file in `packages/core/src/content/posts/`. Tests verify ids are unique, referenced themes, fonts and backgrounds exist, Quran/hadith entries carry a source, and the catalogue stays above 200 cards.

**Add Quran verse cards**: add a reference such as `'2:286'` or `'94:5-6'` with a category to `REFS` in `scripts/gen-quran-posts.mjs` and run `node scripts/gen-quran-posts.mjs`. The text and translation are copied from the bundled dataset, so they are exact; passages over 300 Arabic characters are skipped.

**Add a category**: add the id to `CategoryId`, register it in `content/categories.ts`, create `posts/<name>.ts` and spread it into `posts/index.ts`. Optionally add a rule in `occasions.ts` so it appears in "Today's posts".

**Add a theme**: add the id to `ThemeId` and an entry in `themes.ts` using the `linear(...)` or `radial(...)` helpers.

**Add a photo background**: put `packages/assets/backgrounds/<id>.webp` (1080x1920) and `thumbs/<id>.webp` (270x480) in place, add the id to `BackgroundId`, register it in `backgrounds.ts`, and add the two `require()` lines in `apps/mobile/src/backgrounds.ts`. The `Fetch backgrounds` GitHub workflow (`workflow_dispatch`, input `manifest` = JSON of id → image URL) downloads, resizes and commits photos for you.

**Add a decoration**: it is SVG, so it exists twice: `apps/web/src/domain/decorations/index.tsx` (React DOM) and `apps/mobile/src/components/Decorations.tsx` (react-native-svg). The drawing code is the same apart from element names.

**Add a font**: web imports the `@fontsource/*` CSS in `apps/web/src/fonts.ts`; mobile loads `@expo-google-fonts/*` faces in `apps/mobile/src/fonts.ts`; the registry entry lives in core.

**Add a UI language**: add the locale to `Locale`, create `i18n/<locale>.ts` typed against `TranslationKey`, and register it in `DICTIONARIES` and `LOCALES`.

## Monetization

Free stories carry the app name at the bottom; Pro users, or anyone who watches a rewarded ad, can remove it. Billing and ad SDKs are not integrated yet: the UI talks to a `MonetizationAdapter` from core, a dev adapter simulates both flows in Expo Go, and `docs/MONETIZATION.md` describes the RevenueCat and AdMob integration steps.

## Deployment

- **Web**: `.github/workflows/deploy-pages.yml` publishes `apps/web/dist` to GitHub Pages on pushes to `main` or on demand. Enable Pages with the "GitHub Actions" source in the repository settings first.
- **CI**: `.github/workflows/ci.yml` runs the full check, builds the web app and bundles the Expo app for web as a smoke test.

## Content sources

Quran text follows the standard Uthmani mushaf; hadith are quoted with their collection and number (Bukhari, Muslim, Tirmidhi, Abu Dawud, Ibn Majah). Prayer times come from the `adhan` library with the user's chosen calculation method and madhab. Please report any typo in the Arabic text.

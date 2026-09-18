# Barakah Stories — project overview

One document that summarises what the product is, what has been built, how it is organised, how to run and ship it, and what is still open. Details for each area live in the files linked at the end.

## 1. What the product is

A mobile-first app (with a web companion) for Muslims who post to WhatsApp status. It offers ready-made, editable story cards for Islamic days and moments — Friday, morning and evening adhkar, Ramadan, Laylat al-Qadr, both Eids, Dhul Hijjah and Arafah, the Hijri new year and Ashura, Isra and Mi'raj, plus Quran verses, hadith, duaa and life occasions — and exports them at WhatsApp's native 1080x1920 story size. Around the cards it adds daily companions: prayer times with a Qibla compass, a Quran reader with progress tracking, and a searchable hadith library.

Languages: English and Arabic interface (right-to-left aware); content is Arabic with English translation.

## 2. Features delivered

### Story cards

- 305 cards across 14 categories (Quran 90, duaa 45, hadith 28, occasions 27, morning 23, evening 17, Ramadan 17, Friday 15, Dhul Hijjah 13, Eid al-Fitr 7, Laylat al-Qadr 7, Eid al-Adha 6, Muharram 6, Isra & Mi'raj 4). Every Quran and hadith card carries its reference.
- Editor: headline, Arabic text, translation, source, footer line, toggles for translation, source, Hijri date and frame; 10 colour themes, 12 photo backgrounds, 9 SVG decorations, 7 Arabic fonts, 2 Latin fonts, text size and alignment, "surprise me" and reset.
- Automatic typography: text size adapts to length so long verses still fit.
- Share: native share sheet on phones (WhatsApp → My status); PNG download on the web; copy-as-text caption.
- Saved posts ("My posts"), recently opened posts, and "Today's posts" chosen from the date, the Hijri season and the time of day.
- "Create story" from any Quran verse in the reader and any hadith in the library: the editor opens pre-filled with the text, translation and reference. Hadith text is reduced to the Prophet's words automatically.
- App-name line at the bottom of free stories (see Monetization).

### Prayer

- Prayer times for the user's location (with reverse-geocoded name) or one of 33 preset cities, using the `adhan` library; 12 calculation methods and Shafi/Hanafi Asr.
- Next prayer with countdown on the Prayer tab and on the Home header.
- Qibla dial that rotates with the phone's compass; static bearing when the compass is unavailable.

### Quran

- All 114 surahs bundled (works offline), Arabic Uthmani text with Saheeh International translation.
- Reader remembers the last ayah read, marks surahs finished (automatically at the end or by hand), shows overall progress weighted by verse count, translation toggle and text size.

### Hadith

- Sahih al-Bukhari (7,589 hadith, 97 topics) and Sahih Muslim (7,563 hadith, 56 topics), Arabic and English, downloaded on first use and cached on the device.
- Read by topic, continue where you stopped, or search Arabic/English text and topic titles; "Duaa only" filter keeps supplications; matching duaa from the app's own cards appear first.

### Accounts and sync (optional)

- Email/password sign-up and sign-in through Supabase; two-way sync of saved posts and Quran progress. The app works fully offline without it.

### Monetization foundation

- Free stories carry "☪ Barakah Stories" at the bottom. Pro users, or anyone who watches a rewarded ad (24 hours), can remove it via the switch under the share button. Pro panel on the Me tab.
- Billing and ad SDKs are not integrated; a dev adapter simulates both flows. See `docs/MONETIZATION.md`.

## 3. How the code is organised

Monorepo with npm workspaces:

```
packages/core     @barakah/core    Shared domain logic (pure TypeScript, no UI)
packages/assets                    Photo backgrounds, Quran chapters, hadith indexes
apps/web          @barakah/web     Vite + React web app
apps/mobile       @barakah/mobile  Expo (React Native) app for iOS, Android and web
supabase/                          Database schema for accounts and sync
scripts/                           Generators and build helpers
docs/                              This overview and the monetization plan
```

Principles that keep it extensible:

- Everything is a typed registry in core (categories, posts, themes, backgrounds, fonts, decorations, calculation methods, cities). Adding an item is one entry; TypeScript and the tests catch mistakes.
- Apps import core; core imports nothing from the apps. Visual things that need a renderer (SVG decorations, gradients) are data in core and drawn twice: DOM on web, react-native-svg on mobile.
- Content is exact by construction where possible: Quran cards are generated from the bundled dataset by `scripts/gen-quran-posts.mjs`.
- Persisted state uses versioned Zustand stores with migrations, so old drafts keep working when fields are added.

## 4. Data sources and licences

| Data                     | Source                                                                                                       | Licence / note                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Quran text + English     | `quran-json` (npm, v3.1.2)                                                                                   | CC BY 4.0; Saheeh International translation |
| Hadith (Bukhari, Muslim) | `fawazahmed0/hadith-api` via jsDelivr                                                                        | Open dataset; attribution shown in the app  |
| Prayer times, Qibla      | `adhan` library                                                                                              | MIT                                         |
| Fonts                    | Amiri, Scheherazade New, Noto Naskh Arabic, Cairo, Tajawal, Reem Kufi, Aref Ruqaa, Cormorant Garamond, Inter | Open Font Licence                           |
| Photo backgrounds        | Generated with the owner's Higgsfield account                                                                | Owned by the project                        |

## 5. Running, testing, shipping

```bash
npm install                     # all workspaces
npm run check                   # typecheck + lint + format + 350 tests
npm run dev                     # web app on http://localhost:5173
cd apps/mobile && npx expo start   # mobile app in Expo Go (scan the QR code)
```

- **Web deployment**: `deploy-pages.yml` publishes to GitHub Pages once Pages is enabled with the "GitHub Actions" source in repository settings. A private preview of the web app also exists as a Claude artifact.
- **Android**: `android-build.yml` builds an APK and AAB on GitHub Actions (no Expo account). See section 7 for the status of the first run. `eas.json` holds profiles for EAS cloud builds as the alternative.
- **iOS**: EAS Build with an Apple developer account (`npx eas build -p ios`).
- **CI**: every push runs the full check, builds the web app and bundles the Expo app for web.

## 6. Verification done so far

- 350 automated tests in core (content integrity, Hijri, occasions, typography, prayer, Qibla, hadith search and extraction, monetization rules) plus web component tests.
- Every screen exercised in a phone-sized headless browser against the exported bundle, with screenshots reviewed: gallery, editor, share/export (real 1080x1920 PNG on web), prayer times and compass, Quran reader and progress, hadith download, search and reading, "Create story" flows, the watermark switch and the Pro panel, Arabic RTL interface.
- Not yet verified on a real phone: native sharing to WhatsApp, the location prompt, the live compass, and PNG capture on iOS/Android. These need Expo Go on a device.

## 7. Open items and next steps

1. **Android build workflow**: the first run failed in the runner setup step, before the app was built: the `setup-android` action asked the SDK manager for a package named `tools` that no longer exists. That step was unnecessary (the runner already ships the Android SDK) and has been removed; the workflow has not been re-run since. Next step: run "Android build" from the Actions tab and download `barakah-stories.apk` from the run. Alternative: `npx eas build -p android --profile preview` with an Expo account.
2. **Device testing** of share, location, compass and capture (Expo Go on a phone).
3. **Accounts**: create the Supabase project, run `supabase/schema.sql`, add the two keys to `apps/mobile/.env`.
4. **Monetization**: decide Pro price and model; integrate RevenueCat and AdMob in a development build; move entitlements to the server (plan in `docs/MONETIZATION.md`).
5. **GitHub Pages**: enable in settings, then re-run the deploy workflow for a public web URL.
6. **Content growth**: more photo packs (the Fetch backgrounds workflow imports any image URLs), more verse cards (one line each in the generator), seasonal categories via `occasions.ts`.
7. **Nice to have**: adhan notifications, home-screen widgets for the next prayer, sharing the Quran reader position between devices (already synced when signed in), Arabic topic names for hadith chapters (the dataset only has English).

## 8. Request log

| Request                                                                                    | Outcome                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| App to create and share Islamic WhatsApp stories with editable text and good visuals       | Web app with gallery, editor, themes, decorations, fonts, PNG export and native share            |
| Scalable architecture, best practices                                                      | Typed registries, feature-sliced layout, tests, CI; later a monorepo with a shared core          |
| Photo backgrounds (flowers, nature, rivers, mosques)                                       | 12 generated photos, picker in the editor, fetch workflow for more                               |
| Try the app                                                                                | Private artifact preview; Pages deploy prepared                                                  |
| Posts of the day, recent posts, prayer times and Qibla                                     | Home sections, Prayer tab with countdown and compass                                             |
| Work on Android and iOS; use Expo                                                          | Expo app for iOS/Android/web sharing the core                                                    |
| Quran reader with progress; searchable Bukhari and Muslim; more thumbnails; sign-up        | Quran tab, Hadith tab with search and duaa filter, 305 cards, Supabase accounts                  |
| Create a story from any verse or hadith; app name on free stories; monetization foundation | "Create story" buttons, watermark with Pro/ad removal, adapter-based monetization layer and plan |
| Export the Android app                                                                     | Build workflow and EAS profiles added; first run failed, to be fixed                             |

## 9. Where to read more

- `README.md` — setup, structure, how to extend every registry, deployment.
- `docs/MONETIZATION.md` — tiers, entitlement model, RevenueCat and AdMob steps, decisions.
- `supabase/schema.sql` — tables and row-level security for accounts.
- `.github/workflows/` — CI, Pages deploy, Android build, background photo import.

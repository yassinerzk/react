# Play Console — everything to paste

One page for the submission itself. The listing text in every language lives in
`docs/STORE-LISTING.md`; the history and the reasoning behind these answers live in
`docs/RELEASE-LOG.md`.

## 1. The build

| Field        | Value                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Upload       | `~/Downloads/barakah-release-v7/barakah-stories.aab` (74.9 MB)           |
| Built by     | GitHub Actions run 36233685694, commit `5e3084c`                         |
| Package name | `com.barakah.stories`                                                    |
| Version name | `1.0.0`                                                                  |
| Version code | `6`                                                                      |
| Min / target | minSdk 24, targetSdk 36 — meets the API 36 requirement of 31 August 2026 |
| Signing      | Release keystore, verified — see below                                   |

Upload the **`.aab`**. The `.apk` in the same folder is for installing on a device by hand; Play
rejects an APK for a new app.

Both artifacts were verified against this build, not a previous one:

- The **AAB** carries `META-INF/BARAKAH-.RSA` — signed with the release keystore.
- The **APK** has no `META-INF/*.RSA` at all, because it is signed with **APK Signature Scheme v2
  only**. That is not a missing signature: `apksigner verify` reports `Verified using v2 scheme:
  true`, signer `CN=yassine razzouki, O=Klay Creative Lab LLC`, RSA 2048. The Android debug key is
  `CN=Android Debug, O=Android, C=US`, so this is definitively not it. Do not look for a `.RSA`
  entry in an APK as a signing check — modern builds do not write one.
- The seven UI dictionaries, the bundled Quran text and all five translator credits are present in
  the Hermes bundle. Non-ASCII strings there are stored **UTF-16**, so searching the bundle as UTF-8
  reports them missing when they are fine.
- `splitColorAlpha` and the four `rgba(8,10,14,…)` scrim literals are present, so the photo-scrim
  fix is in this binary.

Keep Play App Signing enabled. Losing the upload keystore without it means losing the ability to
update the app at all.

## 2. Store settings

| Field                | Value                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| App or game          | App                                                                         |
| Category             | Lifestyle (alternative: Books & Reference)                                  |
| Tags                 | Religion, Lifestyle                                                         |
| Default language     | English (United States)                                                     |
| Contact email        | info@klaycreate.com                                                         |
| Privacy policy URL   | https://yassinerzk.github.io/react/privacy.html                             |
| Account deletion URL | https://yassinerzk.github.io/react/delete-account.html                      |
| Developer            | Klay Creative Lab LLC — must match the verified organisation on the account |
| Free or paid         | **Free** — see below                                                        |

### Free or paid

Choose **Free**. Play warns that this cannot be changed after publishing, and that warning is about
one direction only: a free app can never be converted to a **paid** app, meaning one with an upfront
price on the store page. It does not lock monetisation.

Free is the right answer here on both counts:

- There is no billing SDK in this build, and every Pro surface is visibly marked "Coming soon". A
  paid app that charges for what ships today would be rejected.
- **A free app can still sell in-app purchases**, which is exactly the planned Pro model in
  `docs/MONETIZATION.md` — remove-the-badge as an IAP, plus ads. Picking Free now costs nothing
  later; the only door it closes is the upfront-price one, which was never the plan.

Setting a price would also cut off the markets this app was localised for: paid apps are unavailable
to buyers in several of them, and card payment rates are low where they are available.

### Permissions — no declaration form needed

The manifest declares 30 permissions, almost all pulled in transitively (the launcher-badge set
comes from `expo-notifications`, `SYSTEM_ALERT_WINDOW` from React Native, `c2dm.RECEIVE` from the
notifications module even though only local notifications are used). Checked against the list Play
gates behind a form, and **none are present**: no `MANAGE_EXTERNAL_STORAGE`, no
`QUERY_ALL_PACKAGES`, no `ACCESS_BACKGROUND_LOCATION`, no exact-alarm, no SMS or Call Log, no
AccessibilityService. Location is foreground-only. So there is no sensitive-permission declaration
to fill in.

`com.google.android.gms.permission.AD_ID` is confirmed **absent**, which is what lets the Data safety
form below say no advertising ID.

## 3. Graphics

| Asset             | Spec                      | Status                                    |
| ----------------- | ------------------------- | ----------------------------------------- |
| App icon          | 512×512 PNG, 32-bit       | ✅ `docs/store/play-icon-512.png`         |
| Feature graphic   | 1024×500 PNG or JPG       | ✅ `docs/store/play-feature-1024x500.png` |
| Phone screenshots | 2–8, min 320px, 16:9–9:16 | ❌ yours to capture                       |

Suggested screenshots, in this order — the first two are what most people ever see:

1. The editor with a Quran card, showing the text and style controls
2. The home screen: today's date, the next prayer, and the grid of cards
3. Prayer times with the Qibla compass
4. The Quran reader with translation on
5. Hadith search with results

Capture them from the installed app, not the web build — the mobile layout differs and reviewers
compare against the binary.

## 4. Data safety

Answer the form to match this exactly. It is the version the shipped build actually behaves like.

| Data type                      | Collected | Shared | Purpose            | Linked to identity | User can delete |
| ------------------------------ | --------- | ------ | ------------------ | ------------------ | --------------- |
| Approximate + precise location | No\*      | No     | App functionality  | No                 | n/a             |
| Email address                  | Yes       | No     | Account management | Yes                | Yes             |
| User content (saved posts)     | Yes       | No     | App functionality  | Yes                | Yes             |

\* Location is read on the device for prayer times and the Qibla and never reaches our servers. Only
the place-name lookup goes to the platform geocoder, which is the operating system, not us. Email
and saved posts are collected **only if** the user chooses to sign up; the app is fully usable
without an account.

Also declare:

- **Data is encrypted in transit:** yes
- **Users can request deletion:** yes — give the account deletion URL above
- **No advertising ID.** Verified in the binary: the manifest contains no `AD_ID` permission
- **No analytics, no ads, no tracking SDK** in this build

The daily reminder notification is scheduled on the device and collects nothing, so it adds no
entry here.

## 5. Ads declaration

**Contains ads: No.** True for this build — no billing or ads SDK is integrated, and the in-app
purchase surfaces are visibly marked "Coming soon". When ads do ship, this declaration, the Data
safety form, the privacy policy in both copies, and the listing text all have to change first. The
checklist is in `docs/MONETIZATION.md`.

## 6. Content rating questionnaire

Step 1 asks for an email and a **category**, offering exactly three: Game, Social or Communication,
and All Other App Types. Answer **All Other App Types**, with `info@klaycreate.com` as the contact —
IARC and the rating authorities may see it, so use the business address. Tick the IARC terms box.

Do not pick **Social or Communication** because the app shares to WhatsApp. That share goes through
the system share sheet, which hands a finished image to another app; Barakah Stories itself has no
messaging, feed, profiles or user-to-user contact. Choosing it would open a branch of questions on
moderation and publicly shared user content, and push the age rating up for a capability the app
does not have.

Answers to the questionnaire that follows, as Play words the questions:

| Question                                                    | Answer  |
| ----------------------------------------------------------- | ------- |
| Ratings-relevant content in the app package                 | No      |
| Natively lets users interact or exchange content            | No      |
| **Content not part of the initial download, reachable in-app** | **Yes** |
| Promotes or sells age-restricted products                   | No      |
| Shares precise location with other users                    | No      |
| Allows purchase of digital goods                            | No      |
| Cash rewards, gift cards, play-to-earn, crypto, NFTs        | No      |
| Is a web browser or search engine                           | No      |
| Is primarily a news or educational product                  | No      |

Three of these are judgement calls rather than obvious:

**Online content is Yes.** The app fetches the Bukhari and Muslim collections (~14 MB and ~12 MB)
from a CDN on first use, and pulls non-English Quran translations a surah at a time. That is content
outside the initial download, so No would be a misdeclaration. The follow-ups ask whether it is
user-generated or moderated; it is neither, being fixed published editions from pinned sources, so
it should not move the rating.

**User content sharing is No.** The operative word in Play's wording is *natively*. Passing a
finished image to the system share sheet is not an in-app exchange channel — there is no messaging,
no server between users, no profiles. The optional account syncs a user's own saved posts between
their own devices, which is not "other users" either.

**Primarily news or educational is No.** The Quran and hadith readers are reference material, but
the app's purpose is making and sharing cards. Yes here would also contradict the News app = No
answer in section 7, and Play checks those forms against each other.

## 7. Target audience and content

- **Target age group:** 18 and over. The app is not directed at children.
- **Appeals to children:** No.
- **News app:** No.
- **COVID-19 contact tracing:** No.
- **Data safety — children:** not applicable.
- **Government app:** No.
- **Financial features:** None.

## 8. Interface languages

The app's interface runs in **English, Arabic, French, Bahasa Indonesia, Bahasa Melayu, Thai and
Urdu**, chosen from a picker on the home screen.

Story cards and the Quran reader show their translation in the chosen language too, from published
editions — Hamidullah, Kementerian Agama, Abdullah Muhammad Basmeih, King Fahd Complex, Fateh
Muhammad Jalandhry for the Quran, and the hadith-api editions for hadith. **Those translators are
credited in the app**, and that attribution is a condition of use: do not remove it.

Coverage is not total and the listings say so. Malay and Thai reach 198 of 305 cards, because no
Malay or Thai edition of any hadith collection was available; French and Urdu reach 263, Indonesian 258. Everything uncovered falls back to English rather than going blank.

## 9. Listing languages

Copy is drafted in `docs/STORE-LISTING.md` for:

English · العربية · Français · Bahasa Indonesia · Bahasa Melayu · ไทย · اردو

The **app interface speaks all seven**, and each listing says so. Each listing also states the two
real limits, because promising past them is what earns one-star reviews: the **Quran reader** shows a
published translation in the chosen language but fetches it a surah at a time rather than shipping it
in the app, and the **hadith library is Arabic and English only** — no Malay or Thai edition of
either collection was available. Keep both statements in.

Every non-English draft still wants a native speaker before it is published.

## 10. Release track

Use **Internal testing** first, then promote. It goes live in minutes, you install from Play exactly
as a user would, and promotion to production is one click. Going straight to production means any
launch-blocking bug reaches real users and a rollback costs a fresh build plus a review cycle.

## 11. Creating the release

| Field        | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Release name | `1.0.0 (6) — first release`                                           |
| Release notes | `docs/release-notes-1.0.0.txt` — all seven locales, ready to paste    |

The release name is **internal only**. Nobody browsing the store sees it; it appears in the Play
Console release list and in Play's own emails to you. Play pre-fills it with `6 (1.0.0)`, which is
fine but tells you nothing in six months' time. Limit is 50 characters.

The release notes **are** user-facing, on the store page under "What's new", limited to **500
characters per language**. The drafted file uses Play's multi-language format, so the whole thing
pastes into the notes box in one go and Play splits it by tag:

```
<en-US>…</en-US>
<ar>…</ar>
```

Locale tags match the listings: `en-US`, `ar`, `fr-FR`, `id-ID`, `ms-MY`, `th-TH`, `ur`. Longest
draft is 462 characters, so there is room to edit. If you publish a listing locale without notes for
it, Play shows that locale the default-language notes.

### Bundle analysis warnings

The Play Console flags three things on this bundle, all advisory — none blocks publishing:

| Warning               | Shown as | Cause                                                  |
| --------------------- | -------- | ------------------------------------------------------ |
| DEX code optimization | Low      | R8 is off, so nothing is shrunk or optimised           |
| Obfuscation           | 1%       | Same — the 1% is what dependencies shipped pre-obfuscated |
| R8 configuration      | —        | No R8 config exists to report                          |

The cause is one thing: `expo prebuild` generates the Android project fresh on every CI run with
Expo's defaults, and those set `enableProguardInReleaseBuilds=false`. There is no committed
`android/` directory to change, so the fix belongs in `app.json` via `expo-build-properties`, which
is not currently a dependency.

**Do not do this on submission day.** Enabling R8 produces a different binary from the one tested,
and React Native plus Expo modules lean on reflection heavily enough that a missing keep rule
produces a crash that appears only in release builds — exactly the failure that reaches users
instead of you. Ship this build; schedule R8 as its own change with a device test pass.

It is worth doing eventually. DEX is 46.7 MB uncompressed, and unlike the 77 MB of native libraries
— which Play splits per ABI so each device downloads roughly a quarter — **every user downloads all
of the DEX**. So it is a larger share of the real download than 20% of the bundle suggests, and the
markets this app targets are the ones where that matters most.

Play's own suggestion to "upgrade to AGP 9.0" is not actionable here: Expo SDK 57 pins the Gradle
plugin version, and moving it independently breaks prebuild.

## 12. Before you hit publish

- [ ] Screenshots captured from the installed app
- [ ] Arabic read through by a native speaker (see `docs/STORE-LISTING.md`)
- [ ] Any other non-English listing read through, or left unpublished
- [ ] Data safety form matches section 4
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL entered and reachable
- [ ] Ads declaration set to **no ads**
- [ ] AAB uploaded to Internal testing and installed from Play

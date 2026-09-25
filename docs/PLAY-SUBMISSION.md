# Play Console — everything to paste

One page for the submission itself. The listing text in every language lives in
`docs/STORE-LISTING.md`; the history and the reasoning behind these answers live in
`docs/RELEASE-LOG.md`.

## 1. The build

| Field        | Value                                                                            |
| ------------ | -------------------------------------------------------------------------------- |
| Upload       | `barakah-stories.aab` (72 MB) from `~/Downloads/barakah-release/…`               |
| Built by     | GitHub Actions run 36132769647, commit `eaa1e52`                                 |
| Package name | `com.barakah.stories`                                                            |
| Version name | `1.0.0`                                                                          |
| Version code | `3`                                                                              |
| Signing      | Release keystore (verified — signing block is `BARAKAH-.RSA`, not the debug key) |
| Target API   | 36, meeting the requirement in force since 31 August 2026                        |

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

Category: **Reference, News, or Educational**. Expected answers:

| Question                                             | Answer |
| ---------------------------------------------------- | ------ |
| Violence, sexual content, profanity, drugs, gambling | No     |
| Contains ads                                         | No     |
| Shares user location with other users                | No     |
| Allows users to interact or exchange content         | No     |
| Allows purchase of digital goods                     | No     |
| Contains user-generated content shared publicly      | No     |

The app has no social layer: stories are exported to the user's own device and shared through the
system share sheet. Nothing is posted anywhere by the app.

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

The **app interface speaks all seven**, so each listing says so. The **Quran and hadith translations
are still English**, and each listing says that too — keep that distinction, because someone who
installs expecting an Indonesian translation of the Quran will say so in a review otherwise.

Every non-English draft still wants a native speaker before it is published.

## 10. Release track

Use **Internal testing** first, then promote. It goes live in minutes, you install from Play exactly
as a user would, and promotion to production is one click. Going straight to production means any
launch-blocking bug reaches real users and a rollback costs a fresh build plus a review cycle.

## 11. Before you hit publish

- [ ] Screenshots captured from the installed app
- [ ] Arabic read through by a native speaker (see `docs/STORE-LISTING.md`)
- [ ] Any other non-English listing read through, or left unpublished
- [ ] Data safety form matches section 4
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL entered and reachable
- [ ] Ads declaration set to **no ads**
- [ ] AAB uploaded to Internal testing and installed from Play

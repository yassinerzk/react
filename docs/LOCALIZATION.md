# Localization plan — Indonesian, Malay, Thai, Urdu

Target languages, with the names used from here on:

| Requested   | Language         | Code | Script            | Direction |
| ----------- | ---------------- | ---- | ----------------- | --------- |
| Indonesian  | Bahasa Indonesia | `id` | Latin             | LTR       |
| Malaysian   | Bahasa Melayu    | `ms` | Latin             | LTR       |
| Thai        | ไทย              | `th` | Thai              | LTR       |
| "Pakistani" | Urdu             | `ur` | Arabic (Nastaliq) | **RTL**   |

Pakistan has no language called Pakistani — the national language is **Urdu**, and that is what an
app for this audience wants. Worth confirming, since Punjabi, Pashto and Sindhi are each spoken by
tens of millions there too.

Indonesian and Malay are close relatives and mostly mutually intelligible, but they are not one
locale: everyday app vocabulary genuinely differs (_bagikan_ vs _kongsi_ for "share"). One
translator can often cover both, which is a cost saving, not a reason to ship one string set.

> [!NOTE]
> **Phase A and the UI-string half of phase B are done** (25 September 2026). The interface speaks
> English, Arabic, French, Bahasa Indonesia, Bahasa Melayu, ไทย and اردو — 176 keys each, complete
> and enforced by the type system — reached through a language picker on the home screen.
>
> What is written below still stands for everything that is **not** the interface: the ~450 registry
> labels fall back to English, the story cards' `translation` field is English, the Quran reader's
> translation is English, and the hadith library is Arabic + English. Those are the sourced,
> licensed layers, and they are still the long pole. Sections 2, 3 and 4 are the plan for them.

## 1. Timing

**This should land after v1 is published, for the same reason AdMob should.** The i18n change
touches the type that every registry in `packages/core` is built on, and it turns the language
toggle into a picker on both apps. Device testing of the Arabic RTL paths was the largest unknown in
the project and has only just been retired (`docs/RELEASE-LOG.md`); a refactor of the locale layer
reopens exactly that. Nothing here is urgent enough to justify delaying a launch that is otherwise
waiting on store graphics.

If you would rather ship v1 multilingual and take the extra test cycle, say so — the plan does not
change, only the order.

## 2. Four layers, four completely different costs

"Add a language" means four separate jobs, and their sizes differ by three orders of magnitude.
Deciding which layers are in scope is the decision that governs everything else.

| Layer           | Volume per language      | Nature                       |
| --------------- | ------------------------ | ---------------------------- |
| UI strings      | 156 keys                 | Authored by a native speaker |
| Registry labels | ~452 en/ar pairs in core | Authored, but **deferrable** |
| Story card text | 305 cards                | **Sourced**, not authored    |
| Quran reader    | 6,236 ayat               | **Sourced**, licensed        |
| Hadith          | 15,152 entries           | **Sourced**, two sources     |

### UI strings — 156 keys × 4 = 624 strings

`packages/core/src/i18n/en.ts` and `ar.ts`. This is the tractable part: a native speaker who uses
Islamic apps can do 156 keys in a sitting. Do not machine-translate them; the app's register matters
and a clumsy UI reads as a clumsy app.

### Registry labels — deferrable, and that is the good news

The 452 `{ en: …, ar: … }` pairs across `themes.ts`, `backgrounds.ts`, `categories.ts`,
`fonts.ts`, `cities.ts`, `occasions.ts` and the post `source`/`headline` fields. Names like
"Mountain lake" or "Emerald night" are pleasant to localize but nobody is blocked without them.

`pick()` and `translate()` in `packages/core/src/i18n/index.ts` **already fall back to English**, and
`dirOf()` already exists. The architecture was built for more than two locales; what blocks it is one
type (see section 4). Once that is fixed, these 452 can be filled in over time, per language, without
breaking a build.

### Story card text — 297 of 305 localised

`postTranslation()` reads three sources in order: renderings the app wrote
(`Post.translations`, greetings only), then `QURAN_TRANSLATIONS`, then
`HADITH_TRANSLATIONS`, both taken from published editions. English is the fallback,
and Arabic resolves to it on purpose — the card already carries the Arabic.

| Locale | Localised | Still English |
| ------ | --------- | ------------- |
| اردو   | **297**   | 8             |
| id     | **291**   | 14            |
| fr     | **275**   | 30            |
| ms     | 198       | 107           |
| th     | 198       | 107           |

**Malay and Thai stop at 198** because no Malay or Thai edition of any hadith collection exists in
the dataset. Their Quran and greeting cards are complete; the 107 transmitted cards are the gap, and
HadeethEnc (section above) is the route if it is worth the work.

**French reaches 275 rather than 291** because there is no French edition of Tirmidhi, which 25
cards cite.

### Two generators

`scripts/gen-quran-translations.mjs` — 155 cards, every locale. Selected by whether the card cites a
Surah rather than by its kind, since many duaa cards are Quranic supplications. Surah and ayah are
universal, so every one maps exactly.

`scripts/gen-hadith-translations.mjs` — 99 of 106 transmitted cards, across Muslim, Bukhari,
Tirmidhi, Abu Dawud, Ibn Majah and Nasa'i.

**Why the hadith one searches rather than looks up.** Hadith numbering is not universal: it differs
between printed editions and between datasets. Matching on the number a card cites attached the
wrong hadith often enough that an early version verified only 16 of 49 — and the numbers were not
even wrong, the check was. The generator now indexes the Arabic of ~34,000 hadith and finds each
card by its own wording, scoring word overlap rather than exact substring: the dataset carries the
whole narration including the chain, a card carries only the Prophet's words, and the two differ in
small orthographic ways (فيهن against فيها) that break an exact match while meaning the same thing.
Below 80% overlap a card keeps its English, because something close but wrong is worse.

### The last 8

Seven transmitted cards score below the threshold — `friday-kahf` cites Al-Hakim and Al-Bayhaqi,
which are not in the dataset; the rest are paraphrases rather than quotations. One greeting has no
English line to translate from. Raising coverage further means adding collections, or rewording those
cards to quote their source exactly.

### Quran reader — 6,236 ayat, and a bundle-size problem

`packages/assets/quran/` is 2.9 MB for Arabic plus one English translation, bundled for offline use.
Four more translations is roughly **+6 MB inside the APK**, on top of a build that is already large
(`docs/RELEASE-LOG.md` size analysis).

Recommendation: bundle Arabic plus **one** translation — the device language at build time is not
knowable, so bundle English — and fetch other languages on demand, cached with `expo-file-system`,
exactly as the hadith collections already work. One translation is ~1.5 MB, which is a fast download
and a trivial cache.

### Hadith — every language can have one, but not all from the same source

Requirement: a usable hadith section in **every** language the app serves, not an English fallback.
That is achievable for all four, but not from one source. Two exist, with different shapes.

**Source A — complete Sahihayn**, `cdn.jsdelivr.net/gh/fawazahmed0/hadith-api`, already in use for
English and Arabic. Public domain (Unlicense) as a compilation. Per-language editions:

| Language   | Bukhari          | Muslim          |
| ---------- | ---------------- | --------------- |
| Indonesian | ✅ `ind-bukhari` | ✅ `ind-muslim` |
| Urdu       | ✅ `urd-bukhari` | ✅ `urd-muslim` |
| Malay      | ❌ none          | ❌ none         |
| Thai       | ❌ none          | ❌ none         |

**Source B — HadeethEnc.com** (IslamHouse network, same family as QuranEnc): a curated, graded,
topic-categorised collection with plain-language explanations, in 103 languages. Counted live from
`hadeethenc.com/api/v1/categories/roots/?language=<code>`:

| Language   | Hadith available | Share of the collection |
| ---------- | ---------------- | ----------------------- |
| Arabic     | 4,273            | 100% (the ceiling)      |
| Indonesian | 2,692            | 63%                     |
| Urdu       | 2,645            | 62%                     |
| Thai       | 1,047            | 24%                     |
| Malay      | **202**          | **5%**                  |

Its usage policy permits downloading, republishing and use in apps, on two conditions: do not alter
the text, and cite the source clearly. **No non-commercial clause** — so unlike the Quran
translations in section 3, it stays usable once ads ship.

**So, per language:**

- **Indonesian and Urdu — full parity with English.** Take the complete Bukhari and Muslim from
  source A. `HADITH_SOURCES` in `packages/core/src/hadith.ts` is already a per-book record of two
  URLs; it becomes per-book, per-locale, and `mergeEditions` takes the chosen translation instead of
  a hard-coded `en`. Search, sections, the duaa filter and "create story" all keep working unchanged.
  This is a small, contained change.
- **Thai — a real hadith section, different shape.** No complete Sahihayn exists, but 1,047
  explained hadith organised into seven topics is a genuine library, arguably friendlier than 15,152
  raw entries for a general audience. It is not Bukhari-and-Muslim-by-number, so it needs source B
  wired in (below).
- **Malay — the one genuine gap.** 202 hadith is not a library, and there is no complete Malay
  edition to be had for free. Three ways out:
  1. **Serve the Indonesian edition to Malay users, labelled honestly** (e.g. "Terjemahan Bahasa
     Indonesia"). The two are largely mutually intelligible and Malay speakers read Indonesian
     routinely; this gives Malaysia a complete Bukhari and Muslim today, and is far better than
     English. **Recommended as the shipping answer**, with a Malay edition replacing it later.
  2. **License a Malay translation.** Complete translations of both collections are published in
     Malaysia (JAKIM, Dewan Bahasa dan Pustaka among others). Costs money and a negotiation, but it
     is the only route to a true Malay edition.
  3. Commission one — 15,152 entries. Not a task; a multi-year project. Rule it out.

### What supporting two hadith sources costs

`HadithEntry` today is `{ book, number, section, en, ar, grade }` — modelled on "a numbered hadith in
one of the two Sahihayn". HadeethEnc has its own ids, its own categories and an explanation field, so
it does not fit that shape. The hadith feature needs a small source abstraction:

- A `HadithSource` discriminated union: `'sahihayn'` (book + number, translation per locale) or
  `'curated'` (collection id + category + explanation).
- Locale decides the source: Arabic, English, Indonesian and Urdu get `sahihayn`; Thai gets
  `curated`; Malay gets `sahihayn` in Indonesian under option 1 above.
- Browse-by-topic already exists and maps cleanly onto HadeethEnc's seven root categories. Search
  works the same way over either shape. The pieces that need care are "create story from a hadith"
  (the curated entries carry an explanation that must not end up on the card) and the duaa filter,
  which currently keys off the complete-books text.

This is the one piece of real engineering in the hadith work. Everything else is a URL table.

## 3. Licensing — and for once the news is good

The pattern that bit recitation audio (`docs/PRO-PLAN.md` §1.1) applies to translated scripture too,
because the app is monetized:

- **Tanzil.net translations are non-commercial only.** Their text licence permits verbatim
  redistribution of the Quran text, but states the translations are for non-commercial purposes and
  that other use needs permission from the translator or publisher. Unusable here.
- **Quran.com / Quran Foundation** content terms are personal, non-commercial use without written
  consent. Same answer.
- **QuranEnc editions are permitted with attribution**, and they cover all four target languages.
  This is the route.

Better still, the dataset the bundled Quran already came from — `risan/quran-json`, whose chapter
shape matches `packages/assets/quran/chapters/*.json` exactly — ships a **"safe profile" of ~90
translations** that includes Malay and the QuranEnc set, deliberately withholding restricted
editions and documenting the review in `data/meta/licensing-review.json`. The licensing homework for
this specific problem has largely been done; verify it rather than repeat it.

### One thing to fix regardless of new languages

There is **no licence or attribution file anywhere in `packages/assets`**, and the bundled English
translation is Saheeh International (identifiable from its distinctive "the Entirely Merciful, the
Especially Merciful"). That translation is copyrighted, not public domain. Before adding four more
translations, record for each one: edition name, translator, licence, and required attribution — and
show the attribution in the reader. Check the existing English edition against that dataset's
licensing review while you are there; it may or may not be in the safe profile.

## 4. The code change

### The one type that blocks everything

```ts
// packages/core/src/types.ts
export type Locale = 'en' | 'ar';
export type Localized = Record<Locale, string>;
```

`Localized` requires **every** locale. Widen `Locale` without changing it and all 452 registry
literals fail to compile at once. So:

```ts
export type Locale = 'en' | 'ar' | 'id' | 'ms' | 'th' | 'ur';
/** English is the only required entry; `pick()` falls back to it. */
export type Localized = { en: string } & Partial<Record<Locale, string>>;
```

That single change turns "add a locale" from a 452-entry blocking edit into an incremental one, and
`pick()` needs no modification — its `?? text.en` fallback is already written.

Dictionaries stay strict on purpose: `DICTIONARIES: Record<Locale, Record<TranslationKey, string>>`
should keep requiring all 156 keys per locale, so a half-finished dictionary is a compile error
rather than a patchwork UI. Add a locale to `LOCALES` only when its dictionary is complete.

### The 11 places that assume Arabic is the only non-English locale

Each is small; the point is that they exist and none of them will fail loudly.

| File                                         | Assumption                               | Fix                                        |
| -------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `apps/mobile/src/i18n.ts:11`                 | `rtl = locale === 'ar'`                  | `dirOf(locale) === 'rtl'` — already exists |
| `apps/web/src/shared/hooks/useT.ts`          | same                                     | same                                       |
| `apps/mobile/app/(tabs)/index.tsx:96`        | toggle flips between en and ar           | locale picker over `LOCALES`               |
| `apps/web/src/app/App.tsx:39`                | same toggle                              | same                                       |
| `packages/core/src/hijri.ts:92,98`           | Arabic-Indic digits and `هـ` only for ar | per-locale digits (Urdu also uses them)    |
| `packages/core/src/prayer.ts:100,103`        | `ar-EG` or `en-GB`, hour12 by locale     | BCP-47 tag on each `LOCALES` entry         |
| `apps/mobile/src/hooks/useWeekday.ts`        | hard-coded AR/EN weekday arrays          | `Intl.DateTimeFormat`                      |
| `apps/mobile/src/monetization/ProPanel.tsx`  | `toLocaleString(locale === 'ar' …)`      | the same BCP-47 tag                        |
| `apps/web/src/features/today/TodayStrip.tsx` | same                                     | same                                       |
| `packages/core/src/i18n/index.ts`            | `detectLocale()` only detects ar         | match each registered locale prefix        |

Add to each `LOCALES` entry: `dir`, a BCP-47 `tag` for `Intl`, and the digit system. Then the call
sites read data instead of testing for Arabic.

### Fonts and script work

This is where the four languages stop being equivalent:

- **Indonesian, Malay** — Latin. `Inter` and `Cormorant Garamond` already cover them. No font work
  at all, which is most of why they should go first.
- **Urdu** — RTL, so it needs the `dirOf` fix to lay out at all. Your Arabic faces will _render_
  Urdu, and Scheherazade New and Noto Naskh Arabic cover the extra letters (ٹ ڈ ڑ ں ے ہ ھ), but
  Naskh makes Urdu look like Arabic. Idiomatic Urdu is Nastaliq — add `Noto Nastaliq Urdu` and
  select it automatically when the card's text is Urdu. Note Nastaliq needs far more line height
  than Naskh, so `computeTypography` in `design.ts` needs a per-script line-height factor or
  descenders will collide.
- **Thai** — no coverage at all: `Inter` has no Thai glyphs, so today every Thai string renders as
  boxes. Needs `Noto Sans Thai` or `Sarabun`. Thai also writes **without spaces between words**, so
  naive wrapping breaks mid-word — which matters more here than in most apps, because the story card
  _is_ the text. Budget real layout testing, not just a font import.

## 5. Suggested order

Ordered by reach per unit of work, not by the order they were asked for.

| Phase | Work                                                                                                                              | Blocked on                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| A ✅  | Done. `Localized` is partial, locale metadata drives direction, Intl tags, digits and the era marker, and the toggle is a picker. | nothing                              |
| B 🟡  | UI strings done for all five new locales. The sourced layers — card translations, Quran, hadith — are not.                        | translator                           |
| C     | **Urdu**. RTL is already fixed by phase A; adds the Nastaliq font and the line-height factor. Complete hadith available.          | translator, font                     |
| D     | **Thai**. New font, word-breaking work, and the curated hadith source — the most engineering of the four.                         | translator, font, source abstraction |

Phase A is pure engineering and needs no translator, so it can happen while procurement runs — same
shape as the recitation plan.

## 6. Decisions needed

1. **Which layers?** UI only (624 strings), UI plus story cards (~1,800), or everything including the
   Quran reader (~26,000, sourced and licensed). This governs cost, timeline and bundle size.
2. **Urdu confirmed** as the Pakistani language, rather than Punjabi/Pashto/Sindhi.
3. **Malay hadith** — ship the Indonesian edition labelled as such (recommended, available now), or
   hold Malay hadith back until a Malay translation is licensed from a Malaysian publisher?
4. **Thai hadith** — accept the curated 1,047-hadith collection as Thai's hadith section, which means
   building the source abstraction, or delay Thai until that work is scheduled?
5. **Quran translations bundled or downloaded?** Recommendation in section 2: bundle one, download
   the rest.
6. **Who translates?** 156 UI keys per language needs a native speaker who uses apps like this one;
   scripture comes from licensed editions, never from that translator.

## References

- [Tanzil text licence](https://tanzil.net/docs/text_license) — verbatim redistribution permitted, translations non-commercial.
- [Quran.com terms](https://quran.com/terms-and-conditions) — personal, non-commercial use.
- [risan/quran-json](https://github.com/risan/quran-json) — the dataset the bundled chapters match; safe-profile translations and its licensing review.
- [fawazahmed0/hadith-api editions](https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json) — the per-language edition list, Unlicense.
- [HadeethEnc API](https://hadeethenc.com/api/v1/languages) and the [IslamHouse API hub](https://github.com/IslamHouse-API/multilingual-quran-hadith-islamic-content-database-api-hub) — the 103-language list, the per-language counts quoted above, and the no-modification/attribution terms.

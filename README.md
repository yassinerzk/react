# Barakah Stories

Create and share Islamic WhatsApp story posts: Jumu'ah greetings, morning and evening adhkar, Ramadan, Laylat al-Qadr, Eid al-Fitr, Dhul Hijjah and Arafah, Eid al-Adha, the Hijri new year and Ashura, Isra and Mi'raj, plus daily Quran verses, hadith, duaa and life occasions.

Pick a post, change any of the text, choose a background, decoration and font, then share it straight to your WhatsApp status at the native 1080x1920 size.

## Features

- **Bilingual UI** (English / Arabic, RTL aware) with Arabic content and English translations.
- **Today strip**: shows the Hijri date and suggests categories for the current day (Friday, Ramadan, the ten days of Dhul Hijjah, Eid, morning/evening…).
- **Editor**: headline, Arabic text, translation, source, footer, toggles, 10 colour themes, 12 photo backgrounds (flowers, rivers, lakes, forests, desert, night sky, mosques), 9 decorations, 7 Arabic fonts, size slider, alignment, frame, "surprise me".
- **Share**: native share sheet on phones (WhatsApp → My status), PNG download on desktop, copy-as-text caption.
- **My posts**: save and reopen designs (stored locally in the browser).
- Fonts are self-hosted so export works offline and without third-party requests.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build locally
npm run check      # typecheck + lint + prettier + tests
```

Requires Node 20+.

## Project structure

```
src/
  app/            App shell, navigation and Zustand stores (settings, editor, library, toasts)
  domain/         Pure, framework-light business layer
    types.ts        All domain types (add ids here first)
    content/        Categories + posts, one file per category
    themes/         Theme registry (colours, gradient, pattern)
    decorations/    SVG decoration registry (drawn in 1080x1920 space)
    patterns/       Tiled geometric patterns
    fonts/          Font registry + self-hosted font imports
    occasions.ts    Rules that decide what is relevant "today"
    design.ts       StoryDesign factory, typography engine, caption text
  features/       Screen-level UI, one folder per feature
    gallery/  today/  editor/  library/  story/ (StoryCard + preview)
  shared/         Reusable, feature-agnostic code
    ui/  hooks/  lib/ (hijri, export, share)  i18n/
  styles/         Global CSS (design tokens, layout, story card)
```

Dependencies flow downward only: `features → domain/shared`, `shared → domain`, and `domain` imports nothing from the UI.

## Extending the app

**Add a post**: append an object to the matching file in `src/domain/content/posts/`. The test suite verifies ids are unique, referenced themes/decorations/fonts exist, and Quran/hadith entries carry a source.

**Add a category**: add the id to `CategoryId` in `domain/types.ts`, register it in `content/categories.ts`, create `posts/<name>.ts` and spread it into `posts/index.ts`. Optionally add a rule in `domain/occasions.ts` so it appears in the Today strip.

**Add a theme**: add the id to `ThemeId` and an entry in `domain/themes/index.ts`. Themes are pure data.

**Add a photo background**: put `public/backgrounds/<id>.webp` (1080x1920) and `public/backgrounds/thumbs/<id>.webp` (270x480) in place, add the id to `BackgroundId` and register it in `domain/backgrounds/index.ts`. A test checks both files exist. The `Fetch backgrounds` workflow (`workflow_dispatch`, input `manifest` = JSON of id → image URL) downloads, resizes and commits new photos for you.

**Add a decoration**: write a component that draws in the 1080x1920 SVG viewBox and register it in `domain/decorations/index.tsx`.

**Add a font**: install the `@fontsource/*` package, import its CSS in `domain/fonts/index.ts` and add an entry to the registry.

**Add a UI language**: add the locale to `Locale`, create `shared/i18n/<locale>.ts` typed against `TranslationKey`, and register it in `DICTIONARIES` and `LOCALES`.

## How sharing works

The story card is rendered at its native size and scaled with CSS for preview. On export, `html-to-image` rasterises the same DOM node to a 1080x1920 PNG. On phones the Web Share API opens the share sheet, where WhatsApp offers "My status"; elsewhere the PNG is downloaded.

## Deployment

`vite.config.ts` uses a relative base path so the build works from any sub-path. A GitHub Pages workflow (`.github/workflows/deploy-pages.yml`) publishes `dist/` on every push to `main`; enable Pages with the "GitHub Actions" source in the repository settings.

## Content sources

Quran text follows the standard Uthmani mushaf; hadith are quoted with their collection and number (Bukhari, Muslim, Tirmidhi, Abu Dawud, Ibn Majah). Please report any typo in the Arabic text.

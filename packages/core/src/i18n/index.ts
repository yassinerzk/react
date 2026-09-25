import type { Locale, Localized, PostKind } from '../types';
import { en, type TranslationKey } from './en';
import { ar } from './ar';
import { fr } from './fr';
import { id } from './id';
import { ms } from './ms';
import { th } from './th';
import { ur } from './ur';

export type { TranslationKey };

/**
 * Dictionary registry. Deliberately a strict `Record<Locale, …>` of complete
 * dictionaries: a locale with missing keys is a compile error rather than a
 * patchwork screen. Add a locale here, to `Locale` in types.ts, and to
 * `LOCALES` below.
 */
export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
  fr,
  id,
  ms,
  th,
  ur,
};

export type TextDirection = 'ltr' | 'rtl';
/** Which numerals dates and counters are written in. */
export type DigitSystem = 'latn' | 'arab';

export interface LocaleMeta {
  id: Locale;
  /**
   * The language's own name. A picker shows this, never a translation of it —
   * someone looking for their language recognises it written their way.
   */
  label: string;
  dir: TextDirection;
  /** BCP-47 tag for `Intl`. */
  tag: string;
  digits: DigitSystem;
  /** Era marker after a Hijri year. */
  hijriSuffix: string;
}

/**
 * Every locale the interface speaks, in the order a picker shows them.
 *
 * Note `th-TH-u-ca-gregory`: Thai defaults to the Buddhist calendar in `Intl`,
 * which would date the app six centuries out.
 */
export const LOCALES: readonly LocaleMeta[] = [
  { id: 'en', label: 'English', dir: 'ltr', tag: 'en-GB', digits: 'latn', hijriSuffix: 'AH' },
  { id: 'ar', label: 'العربية', dir: 'rtl', tag: 'ar-EG', digits: 'arab', hijriSuffix: 'هـ' },
  { id: 'fr', label: 'Français', dir: 'ltr', tag: 'fr-FR', digits: 'latn', hijriSuffix: 'AH' },
  { id: 'id', label: 'Bahasa Indonesia', dir: 'ltr', tag: 'id-ID', digits: 'latn', hijriSuffix: 'H' },
  { id: 'ms', label: 'Bahasa Melayu', dir: 'ltr', tag: 'ms-MY', digits: 'latn', hijriSuffix: 'H' },
  { id: 'th', label: 'ไทย', dir: 'ltr', tag: 'th-TH-u-ca-gregory', digits: 'latn', hijriSuffix: 'ฮ.ศ.' },
  { id: 'ur', label: 'اردو', dir: 'rtl', tag: 'ur-PK', digits: 'arab', hijriSuffix: 'ھ' },
];

const META = Object.fromEntries(LOCALES.map((l) => [l.id, l])) as Record<Locale, LocaleMeta>;

export function localeMeta(locale: Locale): LocaleMeta {
  return META[locale] ?? META.en;
}

export function translate(locale: Locale, key: TranslationKey): string {
  return DICTIONARIES[locale]?.[key] ?? DICTIONARIES.en[key] ?? key;
}

/** English is the fallback, which is why it is the one required key on `Localized`. */
export function pick(locale: Locale, text: Localized): string {
  return text[locale] ?? text.en;
}

export function dirOf(locale: Locale): TextDirection {
  return localeMeta(locale).dir;
}

/** BCP-47 tag for `Intl`, so call sites never hard-code one. */
export function tagOf(locale: Locale): string {
  return localeMeta(locale).tag;
}

export function isRtl(locale: Locale): boolean {
  return dirOf(locale) === 'rtl';
}

export const KIND_KEY: Record<PostKind, TranslationKey> = {
  quran: 'kindQuran',
  hadith: 'kindHadith',
  dua: 'kindDua',
  dhikr: 'kindDhikr',
  greeting: 'kindGreeting',
};

/**
 * Best starting locale for this device.
 *
 * Matches on the language subtag only, so `id-ID`, `in` (the legacy Indonesian
 * code some devices still report) and plain `id` all land on Indonesian.
 */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of langs) {
    const code = raw?.toLowerCase().split('-')[0];
    if (!code) continue;
    if (code === 'in') return 'id'; // superseded ISO code, still emitted by some devices
    const hit = LOCALES.find((l) => l.id === code);
    if (hit) return hit.id;
  }
  return 'en';
}

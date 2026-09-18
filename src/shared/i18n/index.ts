import type { Locale, Localized, PostKind } from '@/domain/types';
import { en, type TranslationKey } from './en';
import { ar } from './ar';

export type { TranslationKey };

/** Dictionary registry. Add a locale here and to `Locale` in domain/types.ts. */
export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, ar };

export const LOCALES: ReadonlyArray<{ id: Locale; label: string; dir: 'ltr' | 'rtl' }> = [
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'ar', label: 'العربية', dir: 'rtl' },
];

export function translate(locale: Locale, key: TranslationKey): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
}

export function pick(locale: Locale, text: Localized): string {
  return text[locale] ?? text.en;
}

export function dirOf(locale: Locale): 'ltr' | 'rtl' {
  return LOCALES.find((l) => l.id === locale)?.dir ?? 'ltr';
}

export const KIND_KEY: Record<PostKind, TranslationKey> = {
  quran: 'kindQuran',
  hadith: 'kindHadith',
  dua: 'kindDua',
  dhikr: 'kindDhikr',
  greeting: 'kindGreeting',
};

/** Detects a sensible starting locale from the browser. */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages ?? [navigator.language];
  return langs.some((l) => l?.toLowerCase().startsWith('ar')) ? 'ar' : 'en';
}

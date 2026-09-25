import { useCallback } from 'react';
import { useSettingsStore } from '@/app/store';
import { dirOf, isRtl, pick, translate, type TranslationKey, type Localized } from '@barakah/core';

/** Typed translation helpers bound to the current locale. */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);
  const l = useCallback((text: Localized) => pick(locale, text), [locale]);
  return { t, l, locale, dir: dirOf(locale), rtl: isRtl(locale) };
}

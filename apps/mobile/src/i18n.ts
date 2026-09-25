import { useCallback } from 'react';
import { isRtl, pick, translate, type Localized, type TranslationKey } from '@barakah/core';
import { useSettingsStore } from './store';
import { uiFontFor } from './fonts';

/** Typed translation helpers plus direction-aware layout values. */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);
  const l = useCallback((text: Localized) => pick(locale, text), [locale]);
  const rtl = isRtl(locale);
  return {
    t,
    l,
    locale,
    rtl,
    row: (rtl ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    textAlign: (rtl ? 'right' : 'left') as 'left' | 'right',
    font: uiFontFor(locale),
  };
}

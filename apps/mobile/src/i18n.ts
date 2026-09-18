import { useCallback } from 'react';
import { pick, translate, type Localized, type TranslationKey } from '@barakah/core';
import { useSettingsStore } from './store';
import { UI_FONT, UI_FONT_AR } from './fonts';

/** Typed translation helpers plus direction-aware layout values. */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);
  const l = useCallback((text: Localized) => pick(locale, text), [locale]);
  const rtl = locale === 'ar';
  return {
    t,
    l,
    locale,
    rtl,
    row: (rtl ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    textAlign: (rtl ? 'right' : 'left') as 'left' | 'right',
    font: rtl ? UI_FONT_AR : UI_FONT,
  };
}

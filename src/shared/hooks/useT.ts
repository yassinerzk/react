import { useCallback } from 'react';
import { useSettingsStore } from '@/app/store';
import { pick, translate, type TranslationKey } from '@/shared/i18n';
import type { Localized } from '@/domain/types';

/** Typed translation helpers bound to the current locale. */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);
  const l = useCallback((text: Localized) => pick(locale, text), [locale]);
  return { t, l, locale };
}

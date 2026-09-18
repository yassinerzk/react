import { useMemo } from 'react';
import { formatHijri, toHijri, getOccasions } from '@barakah/core';
import { useSettingsStore } from '@/app/store';

export function useHijriToday(now: Date = new Date()) {
  const locale = useSettingsStore((s) => s.locale);
  const dayKey = now.toDateString() + now.getHours();
  return useMemo(() => {
    const hijri = toHijri(now);
    return {
      hijri,
      label: hijri ? formatHijri(hijri, locale) : '',
      occasions: getOccasions(now, hijri),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey, locale]);
}

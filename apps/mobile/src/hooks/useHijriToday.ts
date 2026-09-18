import { useEffect, useMemo, useState } from 'react';
import { formatHijri, getOccasions, toHijri } from '@barakah/core';
import { useSettingsStore } from '../store';

/** Hijri date, formatted label and today's occasions; refreshes hourly. */
export function useHijriToday() {
  const locale = useSettingsStore((s) => s.locale);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    const hijri = toHijri(now);
    return {
      now,
      hijri,
      label: hijri ? formatHijri(hijri, locale) : '',
      occasions: getOccasions(now, hijri),
    };
  }, [now, locale]);
}

import type { Locale } from '@barakah/core';

const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** Weekday name without relying on the JS engine's locale data. */
export function weekdayName(date: Date, locale: Locale): string {
  return (locale === 'ar' ? AR : EN)[date.getDay()];
}

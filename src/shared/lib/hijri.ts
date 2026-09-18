import type { Locale } from '@/domain/types';

export interface HijriDate {
  day: number;
  /** 1 = Muharram … 12 = Dhul Hijjah */
  month: number;
  year: number;
}

export const HIJRI_MONTHS: ReadonlyArray<Record<Locale, string>> = [
  { en: 'Muharram', ar: 'محرم' },
  { en: 'Safar', ar: 'صفر' },
  { en: "Rabi' al-Awwal", ar: 'ربيع الأول' },
  { en: "Rabi' al-Thani", ar: 'ربيع الآخر' },
  { en: 'Jumada al-Ula', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Akhirah', ar: 'جمادى الآخرة' },
  { en: 'Rajab', ar: 'رجب' },
  { en: "Sha'ban", ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال' },
  { en: "Dhul Qi'dah", ar: 'ذو القعدة' },
  { en: 'Dhul Hijjah', ar: 'ذو الحجة' },
];

/**
 * Converts a Gregorian date to the Umm al-Qura Hijri calendar using the
 * platform's Intl support. Returns null when the runtime lacks the calendar.
 */
export function toHijri(date: Date): HijriDate | null {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const day = get('day');
    const month = get('month');
    const year = get('year');
    if ([day, month, year].some((n) => !Number.isFinite(n))) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toLocaleDigits(n: number, locale: Locale): string {
  const s = String(n);
  if (locale !== 'ar') return s;
  return s.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function formatHijri(h: HijriDate, locale: Locale): string {
  const month = HIJRI_MONTHS[h.month - 1]?.[locale] ?? '';
  const suffix = locale === 'ar' ? 'هـ' : 'AH';
  return `${toLocaleDigits(h.day, locale)} ${month} ${toLocaleDigits(h.year, locale)} ${suffix}`;
}

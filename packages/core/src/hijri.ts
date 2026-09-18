import type { Locale } from './types';

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
  return toHijriIntl(date) ?? toHijriTabular(date);
}

function toHijriIntl(date: Date): HijriDate | null {
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

/**
 * Arithmetic (tabular) Islamic calendar, the "Kuwaiti algorithm". Used when
 * the runtime lacks the Umm al-Qura calendar (some Android JS engines). It can
 * differ from the observed calendar by a day or two around month boundaries.
 */
export function toHijriTabular(date: Date): HijriDate {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jd =
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
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

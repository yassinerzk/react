import type { Locale, Localized } from './types';
import { localeMeta, pick } from './i18n';

export interface HijriDate {
  day: number;
  /** 1 = Muharram … 12 = Dhul Hijjah */
  month: number;
  year: number;
}

export const HIJRI_MONTHS: readonly Localized[] = [
  { en: 'Muharram', ar: 'محرم', fr: 'Mouharram', id: 'Muharram', ms: 'Muharam', th: 'มุฮัรรอม', ur: 'محرم' },
  { en: 'Safar', ar: 'صفر', fr: 'Safar', id: 'Safar', ms: 'Safar', th: 'เศาะฟัร', ur: 'صفر' },
  {
    en: "Rabi' al-Awwal",
    ar: 'ربيع الأول',
    fr: 'Rabi al-Awwal',
    id: 'Rabiulawal',
    ms: 'Rabiulawal',
    th: 'ร่อบีอุลเอาวัล',
    ur: 'ربیع الاول',
  },
  {
    en: "Rabi' al-Thani",
    ar: 'ربيع الآخر',
    fr: 'Rabi al-Thani',
    id: 'Rabiulakhir',
    ms: 'Rabiulakhir',
    th: 'ร่อบีอุษษานี',
    ur: 'ربیع الثانی',
  },
  {
    en: 'Jumada al-Ula',
    ar: 'جمادى الأولى',
    fr: 'Joumada al-Oula',
    id: 'Jumadilawal',
    ms: 'Jamadilawal',
    th: 'ญุมาดัลอูลา',
    ur: 'جمادی الاول',
  },
  {
    en: 'Jumada al-Akhirah',
    ar: 'جمادى الآخرة',
    fr: 'Joumada al-Akhira',
    id: 'Jumadilakhir',
    ms: 'Jamadilakhir',
    th: 'ญุมาดัลอาคิเราะฮฺ',
    ur: 'جمادی الثانی',
  },
  { en: 'Rajab', ar: 'رجب', fr: 'Rajab', id: 'Rajab', ms: 'Rejab', th: 'ร่อญับ', ur: 'رجب' },
  { en: "Sha'ban", ar: 'شعبان', fr: 'Chaabane', id: 'Syakban', ms: 'Syaaban', th: 'ชะอฺบาน', ur: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان', fr: 'Ramadan', id: 'Ramadan', ms: 'Ramadan', th: 'รอมฎอน', ur: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال', fr: 'Chawwal', id: 'Syawal', ms: 'Syawal', th: 'เชาวาล', ur: 'شوال' },
  {
    en: "Dhul Qi'dah",
    ar: 'ذو القعدة',
    fr: "Dhou al-Qi'da",
    id: 'Zulkaidah',
    ms: 'Zulkaedah',
    th: 'ซุลเกาะอฺดะฮฺ',
    ur: 'ذوالقعدہ',
  },
  {
    en: 'Dhul Hijjah',
    ar: 'ذو الحجة',
    fr: 'Dhou al-Hijja',
    id: 'Zulhijah',
    ms: 'Zulhijah',
    th: 'ซุลฮิจญะฮฺ',
    ur: 'ذوالحجہ',
  },
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

/** Numerals in the locale's own digits — Arabic and Urdu read Arabic-Indic. */
export function toLocaleDigits(n: number, locale: Locale): string {
  const s = String(n);
  if (localeMeta(locale).digits !== 'arab') return s;
  return s.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function formatHijri(h: HijriDate, locale: Locale): string {
  const entry = HIJRI_MONTHS[h.month - 1];
  const month = entry ? pick(locale, entry) : '';
  const { hijriSuffix } = localeMeta(locale);
  return `${toLocaleDigits(h.day, locale)} ${month} ${toLocaleDigits(h.year, locale)} ${hijriSuffix}`;
}

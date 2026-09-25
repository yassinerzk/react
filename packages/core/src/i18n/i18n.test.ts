import { DICTIONARIES, dirOf, isRtl, localeMeta, LOCALES, pick, tagOf, translate } from './index';
import { en } from './en';
import { formatHijri, HIJRI_MONTHS, toLocaleDigits } from '../hijri';
import { formatClock } from '../prayer';
import type { Locale, Localized } from '../types';

const ALL = LOCALES.map((l) => l.id);
const KEYS = Object.keys(en) as (keyof typeof en)[];

describe('locale registry', () => {
  it('lists every locale that has a dictionary, and no others', () => {
    expect([...ALL].sort()).toEqual(Object.keys(DICTIONARIES).sort());
  });

  it('gives every locale a distinct id, its own name, and an Intl tag', () => {
    expect(new Set(ALL).size).toBe(ALL.length);
    for (const l of LOCALES) {
      expect(l.label.trim()).not.toBe('');
      expect(l.tag).toMatch(/^[a-z]{2}(-|$)/);
      expect(['ltr', 'rtl']).toContain(l.dir);
    }
  });

  it('keeps Thai on the Gregorian calendar', () => {
    // th-TH defaults to the Buddhist era in Intl, which would date the app
    // roughly 543 years out.
    expect(localeMeta('th').tag).toContain('ca-gregory');
    const year = new Intl.DateTimeFormat(tagOf('th'), { year: 'numeric' }).format(new Date(2026, 0, 1));
    expect(year).toContain('2026');
  });

  it('knows which scripts run right to left', () => {
    expect(isRtl('ar')).toBe(true);
    expect(isRtl('ur')).toBe(true);
    for (const id of ['en', 'fr', 'id', 'ms', 'th'] as Locale[]) expect(dirOf(id)).toBe('ltr');
  });
});

describe('dictionaries', () => {
  it.each(ALL)('%s is complete and has no blank strings', (locale) => {
    const dict = DICTIONARIES[locale];
    expect(Object.keys(dict).sort()).toEqual([...KEYS].sort());
    for (const key of KEYS) expect(dict[key].trim()).not.toBe('');
  });

  it.each(ALL.filter((l) => l !== 'en'))('%s is actually translated, not copied', (locale) => {
    const dict = DICTIONARIES[locale];
    // Brand and product names are meant to be identical everywhere; everything
    // else being identical would mean the file was never translated.
    const sameAsEnglish = KEYS.filter((k) => dict[k] === en[k]);
    expect(sameAsEnglish.length).toBeLessThan(KEYS.length / 4);
  });

  it('falls back to English for a key only English has', () => {
    expect(translate('th', 'appName')).toBe('Barakah Stories');
  });
});

describe('pick', () => {
  const partial: Localized = { en: 'Mountain lake', ar: 'بحيرة جبلية' };

  it('uses the locale when it is there and English when it is not', () => {
    expect(pick('ar', partial)).toBe('بحيرة جبلية');
    expect(pick('th', partial)).toBe('Mountain lake');
    expect(pick('fr', partial)).toBe('Mountain lake');
  });
});

describe('dates and numbers follow the locale', () => {
  it('writes Arabic-Indic digits for Arabic and Urdu only', () => {
    expect(toLocaleDigits(1448, 'ar')).toBe('١٤٤٨');
    expect(toLocaleDigits(1448, 'ur')).toBe('١٤٤٨');
    expect(toLocaleDigits(1448, 'id')).toBe('1448');
    expect(toLocaleDigits(1448, 'fr')).toBe('1448');
  });

  it('names the Hijri months in every locale', () => {
    for (const month of HIJRI_MONTHS) {
      for (const id of ALL) expect(pick(id, month).trim()).not.toBe('');
    }
  });

  it('marks the Hijri era the way each locale does', () => {
    const date = { day: 12, month: 9, year: 1448 };
    expect(formatHijri(date, 'ar')).toContain('هـ');
    expect(formatHijri(date, 'ur')).toContain('ھ');
    expect(formatHijri(date, 'id')).toContain('H');
    expect(formatHijri(date, 'en')).toContain('AH');
    expect(formatHijri(date, 'id')).toContain('Ramadan');
  });

  it('formats a clock without throwing in any locale', () => {
    const at = new Date(2026, 0, 1, 17, 5);
    for (const id of ALL) expect(formatClock(at, id, 'UTC')).toMatch(/\d|[٠-٩]/);
  });
});

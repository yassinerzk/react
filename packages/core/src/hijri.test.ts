import { formatHijri, toHijri, toHijriTabular, toLocaleDigits } from './hijri';

describe('hijri', () => {
  it('converts a known Gregorian date (Eid al-Fitr 1445)', () => {
    // 10 April 2024 was 1 Shawwal 1445 in the Umm al-Qura calendar.
    const h = toHijri(new Date(2024, 3, 10, 12));
    expect(h).toEqual({ day: 1, month: 10, year: 1445 });
  });

  it('tabular fallback lands within two days of the Umm al-Qura date', () => {
    for (const [y, m, d] of [
      [2024, 3, 10],
      [2025, 2, 28],
      [2026, 8, 18],
      [2030, 0, 1],
    ]) {
      const date = new Date(y, m, d, 12);
      const intl = toHijri(date)!;
      const tab = toHijriTabular(date);
      const days = (h: { day: number; month: number; year: number }) => h.year * 354 + h.month * 29.5 + h.day;
      expect(Math.abs(days(intl) - days(tab))).toBeLessThanOrEqual(2.5);
    }
  });

  it('formats in English and Arabic', () => {
    const h = { day: 27, month: 9, year: 1446 };
    expect(formatHijri(h, 'en')).toBe('27 Ramadan 1446 AH');
    expect(formatHijri(h, 'ar')).toBe('٢٧ رمضان ١٤٤٦ هـ');
  });

  it('converts digits only for Arabic', () => {
    expect(toLocaleDigits(1446, 'en')).toBe('1446');
    expect(toLocaleDigits(1446, 'ar')).toBe('١٤٤٦');
  });
});

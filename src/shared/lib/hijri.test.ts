import { formatHijri, toHijri, toLocaleDigits } from './hijri';

describe('hijri', () => {
  it('converts a known Gregorian date (Eid al-Fitr 1445)', () => {
    // 10 April 2024 was 1 Shawwal 1445 in the Umm al-Qura calendar.
    const h = toHijri(new Date(2024, 3, 10, 12));
    expect(h).toEqual({ day: 1, month: 10, year: 1445 });
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

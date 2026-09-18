import { HADITH_BOOKS, isDua, mergeEditions, normalizeText, searchHadith, type HadithEntry } from './hadith';

const entries: HadithEntry[] = [
  {
    book: 'bukhari',
    number: 1,
    section: 1,
    en: 'Actions are judged by intentions.',
    ar: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
  },
  {
    book: 'bukhari',
    number: 2,
    section: 11,
    en: 'The Prophet prayed on Friday and said: O Allah, forgive us.',
    ar: 'اللَّهُمَّ اغْفِرْ لَنَا',
  },
  {
    book: 'bukhari',
    number: 3,
    section: 25,
    en: 'Whoever performs Hajj and does not commit sin returns as the day his mother bore him.',
    ar: 'مَنْ حَجَّ',
  },
];

describe('hadith', () => {
  it('bundles section indexes for both books', () => {
    expect(HADITH_BOOKS.bukhari.sections.length).toBeGreaterThan(90);
    expect(HADITH_BOOKS.muslim.sections.length).toBeGreaterThan(50);
    expect(HADITH_BOOKS.bukhari.sections.find((s) => s.en === 'Friday Prayer')?.id).toBe(11);
  });

  it('normalises Arabic diacritics and case', () => {
    expect(normalizeText('إِنَّمَا الْأَعْمَالُ')).toBe('انما الاعمال');
    expect(normalizeText('O Allah!')).toBe('o allah');
  });

  it('detects supplications', () => {
    expect(isDua(entries[1])).toBe(true);
    expect(isDua(entries[0])).toBe(false);
  });

  it('searches English, Arabic and section titles', () => {
    expect(searchHadith(entries, 'intentions').map((e) => e.number)).toEqual([1]);
    expect(searchHadith(entries, 'النيات').map((e) => e.number)).toEqual([1]);
    expect(searchHadith(entries, 'friday').map((e) => e.number)).toEqual([2]);
    expect(searchHadith(entries, 'hajj', { duaOnly: true })).toEqual([]);
    expect(searchHadith(entries, 'allah', { duaOnly: true }).map((e) => e.number)).toEqual([2]);
    expect(searchHadith(entries, '')).toEqual([]);
  });

  it('merges English and Arabic editions by number', () => {
    const merged = mergeEditions(
      'muslim',
      {
        hadiths: [
          { hadithnumber: 1, text: '', reference: { book: 0, hadith: 1 } },
          {
            hadithnumber: 2,
            text: 'Text',
            reference: { book: 1, hadith: 2 },
            grades: [{ name: 'x', grade: 'Sahih' }],
          },
        ],
      },
      { hadiths: [{ hadithnumber: 2, text: 'نص' }] },
    );
    expect(merged).toEqual([{ book: 'muslim', number: 2, section: 1, en: 'Text', ar: 'نص', grade: 'Sahih' }]);
  });
});

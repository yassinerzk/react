import {
  addFinished,
  continuePosition,
  getChapterMeta,
  QURAN_INDEX,
  quranPercent,
  removeFinished,
} from './quran';

describe('quran', () => {
  it('bundles all 114 chapters with 6236 verses', () => {
    expect(QURAN_INDEX).toHaveLength(114);
    expect(QURAN_INDEX.reduce((a, c) => a + c.total_verses, 0)).toBe(6236);
    expect(getChapterMeta(1)?.transliteration).toBe('Al-Fatihah');
    expect(getChapterMeta(114)?.name).toBe('الناس');
  });

  it('tracks finished chapters without duplicates', () => {
    expect(addFinished([2, 1], 1)).toEqual([2, 1]);
    expect(addFinished([2], 1)).toEqual([1, 2]);
    expect(removeFinished([1, 2], 1)).toEqual([2]);
  });

  it('weights progress by verse count', () => {
    expect(quranPercent([])).toBe(0);
    expect(quranPercent([2])).toBeCloseTo(4.6, 1); // Al-Baqarah has 286 verses
    expect(quranPercent(QURAN_INDEX.map((c) => c.id))).toBe(100);
  });

  it('suggests where to continue', () => {
    expect(continuePosition({ lastRead: { surah: 5, ayah: 10 }, finished: [] })).toEqual({
      surah: 5,
      ayah: 10,
    });
    expect(continuePosition({ lastRead: null, finished: [1, 2] })).toEqual({ surah: 3, ayah: 1 });
  });
});

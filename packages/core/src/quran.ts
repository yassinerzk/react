import QURAN_INDEX_JSON from '../../assets/quran/index.json';

export interface QuranVerse {
  id: number;
  /** Uthmani Arabic text. */
  text: string;
  /** English translation (Saheeh International). */
  translation: string;
}

export interface QuranChapterMeta {
  id: number;
  /** Arabic name, e.g. الفاتحة */
  name: string;
  /** Latin transliteration, e.g. Al-Fatihah */
  transliteration: string;
  /** English meaning, e.g. The Opener */
  translation: string;
  type: 'meccan' | 'medinan';
  total_verses: number;
}

export interface QuranChapter extends QuranChapterMeta {
  verses: QuranVerse[];
}

export interface QuranPosition {
  surah: number;
  ayah: number;
}

export interface QuranProgress {
  lastRead: QuranPosition | null;
  /** Chapter ids the reader has completed. */
  finished: number[];
  updatedAt: number;
}

export const QURAN_CHAPTER_COUNT = 114;
export const QURAN_VERSE_COUNT = 6236;

/** Chapter metadata for all 114 surahs (bundled; text is loaded per chapter). */
export const QURAN_INDEX: readonly QuranChapterMeta[] = QURAN_INDEX_JSON as QuranChapterMeta[];

export function getChapterMeta(id: number): QuranChapterMeta | undefined {
  return QURAN_INDEX[id - 1];
}

export function addFinished(finished: readonly number[], surah: number): number[] {
  return finished.includes(surah) ? [...finished] : [...finished, surah].sort((a, b) => a - b);
}

export function removeFinished(finished: readonly number[], surah: number): number[] {
  return finished.filter((s) => s !== surah);
}

/** Share of the Quran completed, weighted by verse count, 0–100. */
export function quranPercent(finished: readonly number[]): number {
  const verses = finished.reduce((sum, id) => sum + (getChapterMeta(id)?.total_verses ?? 0), 0);
  return Math.round((verses / QURAN_VERSE_COUNT) * 1000) / 10;
}

/** Where to continue: the last position, else the first chapter not yet finished. */
export function continuePosition(progress: Pick<QuranProgress, 'lastRead' | 'finished'>): QuranPosition {
  if (progress.lastRead) return progress.lastRead;
  const next = QURAN_INDEX.find((c) => !progress.finished.includes(c.id));
  return { surah: next?.id ?? 1, ayah: 1 };
}

export function formatAyahRef(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

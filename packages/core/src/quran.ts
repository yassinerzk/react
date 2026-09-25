import type { Locale } from './types';
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

/**
 * Simplified orthography for story cards: rare Uthmani annotation marks are
 * dropped or mapped to standard tashkeel so every font (including web font
 * subsets) shapes the text. The reader keeps the full Uthmani text.
 * Keep in sync with scripts/gen-quran-posts.mjs.
 */
export function simplifyUthmani(text: string): string {
  return text
    .replace(/\u0671/g, '\u0627')
    .replace(/\u06E1/g, '\u0652')
    .replace(/\u0657/g, '\u064F')
    .replace(/\u065E/g, '\u064E')
    .replace(/[\u0656\u06D6-\u06ED]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatAyahRef(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

/**
 * Published Quran translations, one per locale, matching the editions the story
 * cards use so a verse reads the same in the reader and on a card.
 *
 * English is absent because it is bundled with the Arabic text; Arabic is absent
 * because the reader already shows it.
 */
export const QURAN_EDITIONS: Partial<Record<Locale, { id: string; credit: string }>> = {
  fr: { id: 'fra-muhammadhamidul', credit: 'Muhammad Hamidullah' },
  id: { id: 'ind-indonesianislam', credit: 'Kementerian Agama Republik Indonesia' },
  ms: { id: 'msa-abdullahmuhamma', credit: 'Abdullah Muhammad Basmeih' },
  th: { id: 'tha-kingfahadquranc', credit: 'King Fahd Complex' },
  ur: { id: 'urd-fatehmuhammadja', credit: 'Fateh Muhammad Jalandhry' },
};

/**
 * One chapter of one edition. Tens of kilobytes rather than the ~1.3 MB a whole
 * edition weighs, so the reader fetches a surah when it is opened instead of
 * making anyone download five translations up front or shipping them in the app.
 */
export function quranTranslationUrl(locale: Locale, chapter: number): string | null {
  const edition = QURAN_EDITIONS[locale];
  if (!edition) return null;
  return `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${edition.id}/${chapter}.min.json`;
}

/** Shape of the per-chapter file the URL above returns. */
export interface RawQuranTranslation {
  chapter: { chapter: number; verse: number; text: string }[];
}

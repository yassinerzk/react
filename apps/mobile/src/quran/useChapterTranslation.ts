import { useEffect, useState } from 'react';
import { QURAN_EDITIONS, type Locale } from '@barakah/core';
import { getLoadedTranslation, loadChapterTranslation } from './translations';

export interface ChapterTranslation {
  /** Verse number to its text, or null while loading or when there is no edition. */
  verses: Map<number, string> | null;
  /** Who translated it, to be shown wherever the text is. */
  credit?: string;
}

interface Loaded {
  /** Which surah and locale this result belongs to. */
  key: string;
  verses: Map<number, string> | null;
}

const keyOf = (locale: Locale, chapter: number) => `${locale}:${chapter}`;

/**
 * The current locale's translation of one surah.
 *
 * Never blocks: until it resolves the reader shows the bundled English, which
 * is also what happens when there is no edition or the fetch fails. A result is
 * tagged with the surah and locale it was requested for, so paging quickly
 * through chapters cannot leave the wrong translation on screen.
 */
export function useChapterTranslation(chapter: number, locale: Locale): ChapterTranslation {
  const edition = QURAN_EDITIONS[locale];
  const key = keyOf(locale, chapter);

  // Seeded from memory so a surah opened twice paints immediately.
  const [loaded, setLoaded] = useState<Loaded>(() => ({
    key,
    verses: getLoadedTranslation(locale, chapter) ?? null,
  }));

  useEffect(() => {
    if (!edition) return;
    let cancelled = false;
    // Always via the loader, even for a memory hit: resolving a promise keeps
    // this effect free of a synchronous state write.
    void loadChapterTranslation(locale, chapter).then((verses) => {
      if (!cancelled) setLoaded({ key: keyOf(locale, chapter), verses });
    });
    return () => {
      cancelled = true;
    };
  }, [chapter, locale, edition]);

  const verses = loaded.key === key ? loaded.verses : null;
  return { verses, credit: verses ? edition?.credit : undefined };
}

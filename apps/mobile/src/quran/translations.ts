import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { quranTranslationUrl, type Locale, type RawQuranTranslation } from '@barakah/core';

/**
 * Quran translations for the reader, fetched a surah at a time.
 *
 * A whole edition is about 1.3 MB, so five of them would add well over 6 MB to
 * the app for translations most readers never open. One chapter is tens of
 * kilobytes, so the reader fetches the surah being read and keeps it — the same
 * download-once-then-cached arrangement the hadith library uses.
 *
 * English needs none of this: it ships inside the bundled chapter files.
 */

const memory = new Map<string, Map<number, string>>();

const key = (locale: Locale, chapter: number) => `${locale}:${chapter}`;

function cacheFile(locale: Locale, chapter: number): File {
  return new File(Paths.cache, `quran-${locale}-${chapter}.json`);
}

/** Already in memory, so the reader can render it without waiting. */
export function getLoadedTranslation(locale: Locale, chapter: number): Map<number, string> | undefined {
  return memory.get(key(locale, chapter));
}

/**
 * The chapter's translation, from memory, then disk, then the network.
 * Resolves to null for locales with no edition, and on any failure — the reader
 * falls back to the bundled English rather than showing nothing.
 */
export async function loadChapterTranslation(
  locale: Locale,
  chapter: number,
): Promise<Map<number, string> | null> {
  const cached = memory.get(key(locale, chapter));
  if (cached) return cached;

  const url = quranTranslationUrl(locale, chapter);
  if (!url) return null;

  try {
    let raw: RawQuranTranslation;
    if (Platform.OS === 'web') {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      raw = (await res.json()) as RawQuranTranslation;
    } else {
      const file = cacheFile(locale, chapter);
      if (!file.exists) {
        new Directory(Paths.cache).create({ idempotent: true, intermediates: true });
        await File.downloadFileAsync(url, file, { idempotent: true });
      }
      raw = JSON.parse(await file.text()) as RawQuranTranslation;
    }
    const verses = new Map<number, string>();
    for (const v of raw.chapter) verses.set(v.verse, v.text);
    memory.set(key(locale, chapter), verses);
    return verses;
  } catch {
    // Offline and not cached, or a bad response. English is already on screen.
    return null;
  }
}

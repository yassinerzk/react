import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { create } from 'zustand';
import {
  HADITH_SOURCES,
  mergeEditions,
  type HadithBookId,
  type HadithEntry,
  type RawHadithEdition,
} from '@barakah/core';
import { useHadithStore } from '../store';

const memory = new Map<HadithBookId, HadithEntry[]>();

function cacheFile(book: HadithBookId, lang: 'en' | 'ar'): File {
  return new File(Paths.cache, `hadith-${book}-${lang}.json`);
}

async function readEdition(book: HadithBookId, lang: 'en' | 'ar'): Promise<RawHadithEdition> {
  const url = HADITH_SOURCES[book][lang];
  if (Platform.OS === 'web') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as RawHadithEdition;
  }
  const file = cacheFile(book, lang);
  if (!file.exists) {
    new Directory(Paths.cache).create({ idempotent: true, intermediates: true });
    await File.downloadFileAsync(url, file, { idempotent: true });
  }
  return JSON.parse(await file.text()) as RawHadithEdition;
}

/** True when both editions are already on disk (native) or in memory (web). */
export function isBookCached(book: HadithBookId): boolean {
  if (memory.has(book)) return true;
  if (Platform.OS === 'web') return false;
  return cacheFile(book, 'en').exists && cacheFile(book, 'ar').exists;
}

/** Loads a book, downloading it on first use, and keeps it in memory. */
export async function loadBook(book: HadithBookId): Promise<HadithEntry[]> {
  const cached = memory.get(book);
  if (cached) return cached;
  const [en, ar] = await Promise.all([readEdition(book, 'en'), readEdition(book, 'ar')]);
  const entries = mergeEditions(book, en, ar);
  memory.set(book, entries);
  useHadithStore.getState().setDownloaded(book, true);
  return entries;
}

export function getLoadedBook(book: HadithBookId): HadithEntry[] | undefined {
  return memory.get(book);
}

/** Per-book loading state shared by the screens. */
interface LibraryState {
  status: Partial<Record<HadithBookId, 'idle' | 'loading' | 'ready' | 'error'>>;
  entries: Partial<Record<HadithBookId, HadithEntry[]>>;
  ensure: (book: HadithBookId) => Promise<HadithEntry[] | undefined>;
}
export const useHadithLibrary = create<LibraryState>()((set, get) => ({
  status: {},
  entries: {},
  ensure: async (book) => {
    if (get().entries[book]) return get().entries[book];
    set({ status: { ...get().status, [book]: 'loading' } });
    try {
      const entries = await loadBook(book);
      set({ status: { ...get().status, [book]: 'ready' }, entries: { ...get().entries, [book]: entries } });
      return entries;
    } catch {
      set({ status: { ...get().status, [book]: 'error' } });
      return undefined;
    }
  },
}));

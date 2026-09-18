import BUKHARI from '../../assets/hadith/bukhari.json';
import MUSLIM from '../../assets/hadith/muslim.json';

export type HadithBookId = 'bukhari' | 'muslim';

export interface HadithSection {
  id: number;
  /** Topic title, e.g. "Friday Prayer". */
  en: string;
  /** First and last hadith number in the section. */
  first: number;
  last: number;
}

export interface HadithBookMeta {
  id: HadithBookId;
  name: string;
  nameAr: string;
  hadithCount: number;
  sections: HadithSection[];
}

export interface HadithEntry {
  book: HadithBookId;
  number: number;
  section: number;
  ar: string;
  en: string;
  grade?: string;
}

/** Shape of one edition file from the hadith-api dataset. */
export interface RawHadithEdition {
  hadiths: Array<{
    hadithnumber: number;
    text: string;
    grades?: Array<{ name: string; grade: string }>;
    reference?: { book: number; hadith: number };
  }>;
}

export const HADITH_BOOKS: Record<HadithBookId, HadithBookMeta> = {
  bukhari: BUKHARI as HadithBookMeta,
  muslim: MUSLIM as HadithBookMeta,
};

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

/** Download locations for each book's English and Arabic edition (~4–9 MB each). */
export const HADITH_SOURCES: Record<HadithBookId, { en: string; ar: string; approxMb: number }> = {
  bukhari: { en: `${CDN}/eng-bukhari.min.json`, ar: `${CDN}/ara-bukhari.min.json`, approxMb: 14 },
  muslim: { en: `${CDN}/eng-muslim.min.json`, ar: `${CDN}/ara-muslim.min.json`, approxMb: 12 },
};

/** Joins the English and Arabic editions of a book by hadith number. */
export function mergeEditions(book: HadithBookId, en: RawHadithEdition, ar: RawHadithEdition): HadithEntry[] {
  const arabic = new Map(ar.hadiths.map((h) => [h.hadithnumber, h.text]));
  return en.hadiths
    .filter((h) => h.text.trim() !== '')
    .map((h) => ({
      book,
      number: h.hadithnumber,
      section: h.reference?.book ?? 0,
      en: h.text,
      ar: arabic.get(h.hadithnumber) ?? '',
      grade: h.grades?.[0]?.grade,
    }));
}

export function getSection(book: HadithBookId, sectionId: number): HadithSection | undefined {
  return HADITH_BOOKS[book].sections.find((s) => s.id === sectionId);
}

const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** Lowercases and strips Arabic diacritics, tatweel and letter variants for matching. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(TASHKEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DUA_MARKERS = [
  /\bo allah\b/,
  /\bsupplicat/,
  /\binvok/,
  /\bprayed to allah\b/,
  /اللهم/,
  /\bاعوذ\b/,
  /\bرب اغفر/,
  /\bرب /,
];

/** True when the hadith contains a supplication. */
export function isDua(entry: Pick<HadithEntry, 'en' | 'ar'>): boolean {
  const text = normalizeText(`${entry.en} ${entry.ar}`);
  return DUA_MARKERS.some((re) => re.test(text));
}

export interface HadithSearchOptions {
  duaOnly?: boolean;
  limit?: number;
}

/**
 * Keyword search across English and Arabic text and section titles. Every
 * token must appear; results are ranked by matches in the section title,
 * then by how many times the tokens occur.
 */
export function searchHadith(
  entries: readonly HadithEntry[],
  query: string,
  opts: HadithSearchOptions = {},
): HadithEntry[] {
  const tokens = normalizeText(query)
    .split(' ')
    .filter((t) => t.length > 1);
  if (tokens.length === 0) return [];
  const limit = opts.limit ?? 100;
  const scored: Array<{ entry: HadithEntry; score: number }> = [];
  for (const entry of entries) {
    if (opts.duaOnly && !isDua(entry)) continue;
    const section = normalizeText(getSection(entry.book, entry.section)?.en ?? '');
    const body = normalizeText(`${entry.en} ${entry.ar}`);
    let score = 0;
    let ok = true;
    for (const token of tokens) {
      const inSection = section.includes(token);
      const count = body.split(token).length - 1;
      if (!inSection && count === 0) {
        ok = false;
        break;
      }
      score += (inSection ? 5 : 0) + Math.min(count, 5);
    }
    if (ok) scored.push({ entry, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.entry.number - b.entry.number)
    .slice(0, limit)
    .map((s) => s.entry);
}

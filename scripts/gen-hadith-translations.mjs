// Fills every transmitted story card — hadith, duaa, dhikr — with translations
// in the locales that have a published edition. Run:
//
//   node scripts/gen-hadith-translations.mjs
//
// Output: packages/core/src/content/hadithTranslations.generated.ts
//
// Three things make this harder than the Quran, and all three are guarded:
//
//   1. Numbering is not universal, so cards are matched by their Arabic text.
//   2. A short card can match scattered words in a long narration by chance, so
//      the matching words must also sit close together — a real quotation, not
//      a coincidence spread over four hundred words.
//   3. A published hadith carries its chain of narrators, which the cards do
//      not. The Prophet's words are lifted out of the translation, and anything
//      that still looks nothing like the English keeps its English instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'packages/core/src/content/posts');
const out = path.join(root, 'packages/core/src/content/hadithTranslations.generated.ts');
const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

const BOOKS = ['muslim', 'bukhari', 'tirmidhi', 'abudawud', 'ibnmajah', 'nasai'];

const EDITIONS = {
  fr: { prefix: 'fra', credit: 'hadith-api, éditions françaises' },
  id: { prefix: 'ind', credit: 'hadith-api, edisi Indonesia' },
  ur: { prefix: 'urd', credit: 'hadith-api، اردو ایڈیشن' },
};

/** Share of the card's words that must appear in the matched hadith. */
const MIN_COVERAGE = 0.8;
/** …and within a span no more than this many times the card's own length. */
const MAX_SPREAD = 3;
/** A kept translation must be this close in length to the English matn. */
const MIN_RATIO = 0.35;
const MAX_RATIO = 2.5;

const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

function words(s) {
  return s
    .replace(TASHKEEL, '')
    .replace(/[^ء-ي\s]/g, ' ')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

async function edition(name) {
  const res = await fetch(`${CDN}/${name}.min.json`);
  return res.ok ? res.json() : null;
}

function quranCovered() {
  const file = path.join(root, 'packages/core/src/content/quranTranslations.generated.ts');
  if (!fs.existsSync(file)) return new Set();
  const text = fs.readFileSync(file, 'utf8');
  const body = text.slice(text.indexOf('QURAN_TRANSLATIONS: Record'));
  return new Set([...body.matchAll(/^ {2}["']([^"']+)["']: \{/gm)].map((m) => m[1]));
}

function transmittedCards() {
  const skip = quranCovered();
  const found = [];
  for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith('.ts'))) {
    const text = fs.readFileSync(path.join(postsDir, file), 'utf8');
    for (const m of text.matchAll(/\{\s*id: '([^']+)',([\s\S]*?)\n {2}\},/g)) {
      const [, id, body] = m;
      const kind = /kind: '(\w+)'/.exec(body)?.[1];
      if (!kind || kind === 'quran' || kind === 'greeting') continue;
      if (skip.has(id)) continue;
      const english = /translation:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(body);
      const arabic = /arabic:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(body);
      if (!english || !arabic) continue;
      found.push({ id, kind, english: english[1], words: words(arabic[1]) });
    }
  }
  return found;
}

/**
 * Does the card's wording appear as a run inside this hadith?
 *
 * Coverage alone is not enough: a six-word duaa will find all six words
 * somewhere in a four-hundred-word narration about something else entirely.
 * Requiring them inside a short span is what separates a quotation from a
 * coincidence.
 */
function quotationScore(cardWords, hadithWords) {
  const wanted = new Set(cardWords);
  const hits = [];
  for (let i = 0; i < hadithWords.length; i++) {
    if (wanted.has(hadithWords[i])) hits.push([i, hadithWords[i]]);
  }
  if (!hits.length) return 0;
  const need = Math.ceil(wanted.size * MIN_COVERAGE);
  const maxSpan = Math.max(cardWords.length * MAX_SPREAD, 12);
  const counts = new Map();
  let distinct = 0;
  let best = 0;
  let left = 0;
  for (let right = 0; right < hits.length; right++) {
    const w = hits[right][1];
    counts.set(w, (counts.get(w) ?? 0) + 1);
    if (counts.get(w) === 1) distinct++;
    while (distinct >= need) {
      const span = hits[right][0] - hits[left][0] + 1;
      if (span <= maxSpan) best = Math.max(best, distinct / wanted.size);
      const lw = hits[left][1];
      counts.set(lw, counts.get(lw) - 1);
      if (counts.get(lw) === 0) distinct--;
      left++;
    }
  }
  return best;
}

/** The Prophet's words, lifted out of a narration that carries its chain. */
const QUOTE_PAIRS = [
  ['«', '»'],
  ['”', '“'],
  ['“', '”'],
  ['"', '"'],
];

/**
 * "He said:" in each language, used only when a narration carries no quotation
 * marks to cut on. Everything before the last one is the chain of narrators.
 */
const SAID = [/فرمایا\s*[:؛]?\s*["”«]?/g, /bersabda\s*[:,]\s*["“]?/gi, /a dit\s*:\s*[«"“]?/gi];

function afterNarration(text, targetLength) {
  let best = text;
  for (const marker of SAID) {
    marker.lastIndex = 0;
    let m;
    while ((m = marker.exec(text)) !== null) {
      const tail = text.slice(m.index + m[0].length).trim();
      // Only if what follows is substantial enough to be the saying itself.
      if (tail.length >= targetLength * 0.4 && tail.length < best.length) best = tail;
    }
  }
  return best;
}

function matn(text, targetLength) {
  const spans = [];
  for (const [open, close] of QUOTE_PAIRS) {
    let i = text.indexOf(open);
    while (i !== -1) {
      const j = text.indexOf(close, i + 1);
      if (j === -1) break;
      const span = text.slice(i + 1, j).trim();
      if (span.length > 15) spans.push(span);
      i = text.indexOf(open, j + 1);
    }
  }
  if (!spans.length) return afterNarration(text.trim(), targetLength);
  // A narration can quote several things — the Prophet's words, a companion's
  // question, a second hadith. Take the one closest in length to the English
  // this card already carries, rather than simply the longest.
  spans.sort((a, b) => Math.abs(a.length - targetLength) - Math.abs(b.length - targetLength));
  return spans[0];
}

const cards = transmittedCards();
console.log(`transmitted cards: ${cards.length}`);

const corpus = [];
const index = new Map();
for (const book of BOOKS) {
  process.stdout.write(`  indexing ${book} … `);
  const json = await edition(`ara-${book}`);
  if (!json) {
    console.log('unavailable');
    continue;
  }
  let n = 0;
  for (const h of json.hadiths) {
    const list = words(h.text);
    if (list.length < 4) continue;
    const ref = corpus.length;
    corpus.push({ book, number: h.hadithnumber, list });
    for (const w of new Set(list)) {
      let posting = index.get(w);
      if (!posting) index.set(w, (posting = []));
      posting.push(ref);
    }
    n++;
  }
  console.log(`${n} hadith`);
}
console.log(`corpus: ${corpus.length} hadith, ${index.size} distinct words`);

function bestMatch(card) {
  const rare = [...new Set(card.words)]
    .map((w) => [w, index.get(w)?.length ?? 0])
    .filter(([, n]) => n > 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 6);
  const seen = new Set();
  for (const [w] of rare) for (const ref of index.get(w)) seen.add(ref);
  let best = null;
  for (const ref of seen) {
    const entry = corpus[ref];
    const score = quotationScore(card.words, entry.list);
    if (!best || score > best.score) best = { book: entry.book, number: entry.number, score };
  }
  return best;
}

const matched = [];
const weak = [];
for (const card of cards) {
  const hit = bestMatch(card);
  if (hit && hit.score >= MIN_COVERAGE) matched.push({ ...card, ...hit });
  else weak.push({ id: card.id, score: hit ? hit.score : 0 });
}
console.log(`\nquoted in a hadith: ${matched.length}/${cards.length}`);

const needed = [...new Set(matched.map((m) => m.book))];
const translations = {};
const dropped = [];
for (const [locale, meta] of Object.entries(EDITIONS)) {
  let kept = 0;
  let cut = 0;
  for (const book of needed) {
    const json = await edition(`${meta.prefix}-${book}`);
    if (!json) continue;
    const byNumber = new Map(json.hadiths.map((h) => [h.hadithnumber, h.text]));
    for (const card of matched.filter((m) => m.book === book)) {
      const raw = byNumber.get(card.number);
      if (!raw?.trim()) continue;
      const text = matn(raw, card.english.length);
      const ratio = text.length / Math.max(card.english.length, 1);
      if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
        cut++;
        dropped.push(`${card.id} [${locale}] ${ratio.toFixed(1)}x`);
        continue;
      }
      (translations[card.id] ??= {})[locale] = text;
      kept++;
    }
  }
  console.log(`  ${locale} … kept ${kept}, dropped ${cut} for length`);
}

console.log(`\nno confident quotation (${weak.length}):`);
for (const w of weak) console.log(`  ${w.id} (best ${(w.score * 100).toFixed(0)}%)`);

const body = `/**
 * Translations for the transmitted story cards — hadith, duaa and dhikr — taken
 * from published editions.
 * Generated by scripts/gen-hadith-translations.mjs — do not edit by hand.
 *
 * Each card is matched to a hadith by its Arabic appearing as a run inside it,
 * not by the number it cites and not by scattered words. The Prophet's words are
 * then lifted out of the published narration, which carries its chain of
 * narrators, and anything still wildly longer or shorter than the English keeps
 * its English instead.
 *
 * Malay and Thai are absent: no edition of any of these collections exists for
 * them in this dataset.
 */
import type { Locale } from '../types';

export const HADITH_TRANSLATION_CREDITS: Partial<Record<Locale, string>> = ${JSON.stringify(
  Object.fromEntries(Object.entries(EDITIONS).map(([l, e]) => [l, e.credit])),
  null,
  2,
)};

/** Card id to its translation in each locale that has an edition. */
export const HADITH_TRANSLATIONS: Record<string, Partial<Record<Locale, string>>> = ${JSON.stringify(
  translations,
  null,
  2,
)};
`;

fs.writeFileSync(out, body, 'utf8');
console.log(`\ncards covered: ${Object.keys(translations).length}`);
console.log(`Written: ${path.relative(root, out)}`);

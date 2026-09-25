// Fills every transmitted story card — hadith, duaa, dhikr — with translations
// in the locales that have a published edition. Run:
//
//   node scripts/gen-hadith-translations.mjs
//
// Output: packages/core/src/content/hadithTranslations.generated.ts
//
// Cards are matched to a hadith by their **Arabic text**, not by the number they
// cite. Hadith numbering is not universal: it differs between printed editions
// and between datasets, so a number alone can point at a different hadith
// entirely and would attach the wrong translation to a card. Matching on the
// text finds the right hadith wherever it sits, and a card that matches nothing
// well enough keeps its English rather than getting something close but wrong.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'packages/core/src/content/posts');
const out = path.join(root, 'packages/core/src/content/hadithTranslations.generated.ts');
const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

/** Collections the cards draw on, in rough order of how often they are cited. */
const BOOKS = ['muslim', 'bukhari', 'tirmidhi', 'abudawud', 'ibnmajah', 'nasai'];

/**
 * Locales with published editions. Malay and Thai have none for any collection
 * in this dataset, so their hadith cards keep English — see docs/LOCALIZATION.md.
 */
const EDITIONS = {
  fr: { prefix: 'fra', credit: 'hadith-api, éditions françaises' },
  id: { prefix: 'ind', credit: 'hadith-api, edisi Indonesia' },
  ur: { prefix: 'urd', credit: 'hadith-api، اردو ایڈیشن' },
};

/** Accept a match only when this much of the card's wording is present. */
const MIN_SCORE = 0.8;

const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** Words only, vowels and orthographic variants flattened. */
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
  if (!res.ok) return null;
  return res.json();
}

/** Cards the Quran generator already covers, whatever their kind. */
function quranCovered() {
  const file = path.join(root, 'packages/core/src/content/quranTranslations.generated.ts');
  if (!fs.existsSync(file)) return new Set();
  const text = fs.readFileSync(file, 'utf8');
  const body = text.slice(text.indexOf('QURAN_TRANSLATIONS: Record'));
  // Quotes depend on whether Prettier has run over the generated file yet.
  return new Set([...body.matchAll(/^ {2}["']([^"']+)["']: \{/gm)].map((m) => m[1]));
}

/** Every card whose text is transmitted rather than written by us. */
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
      if (!/translation:/.test(body)) continue;
      const arabic = /arabic:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(body);
      if (!arabic) continue;
      found.push({ id, kind, words: words(arabic[1]) });
    }
  }
  return found;
}

const cards = transmittedCards();
console.log(`transmitted cards: ${cards.length}`);

// Index the Arabic corpus once: word -> the hadith containing it.
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
    const set = new Set(words(h.text));
    if (set.size < 4) continue;
    const ref = corpus.length;
    corpus.push({ book, number: h.hadithnumber, set });
    for (const w of set) {
      let list = index.get(w);
      if (!list) index.set(w, (list = []));
      list.push(ref);
    }
    n++;
  }
  console.log(`${n} hadith`);
}
console.log(`corpus: ${corpus.length} hadith, ${index.size} distinct words`);

/** Best-scoring hadith for a card, whatever the score. */
function bestMatch(card) {
  // Start from the card's rarest words so the candidate set stays small.
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
    let hit = 0;
    for (const w of card.words) if (entry.set.has(w)) hit++;
    const score = hit / card.words.length;
    if (!best || score > best.score) best = { book: entry.book, number: entry.number, score };
  }
  return best;
}

const matched = [];
const weak = [];
for (const card of cards) {
  const hit = bestMatch(card);
  if (hit && hit.score >= MIN_SCORE) matched.push({ ...card, ...hit });
  else weak.push({ id: card.id, score: hit ? hit.score : 0 });
}
console.log(`\nmatched to a hadith: ${matched.length}/${cards.length}`);
for (const w of weak) console.log(`  no confident match: ${w.id} (best ${(w.score * 100).toFixed(0)}%)`);

// Pull the translations, only for collections something actually matched in.
const needed = [...new Set(matched.map((m) => m.book))];
const translations = {};
for (const [locale, meta] of Object.entries(EDITIONS)) {
  let filled = 0;
  for (const book of needed) {
    const json = await edition(`${meta.prefix}-${book}`);
    if (!json) continue;
    const byNumber = new Map(json.hadiths.map((h) => [h.hadithnumber, h.text]));
    for (const card of matched.filter((m) => m.book === book)) {
      const text = byNumber.get(card.number)?.trim();
      if (!text) continue;
      (translations[card.id] ??= {})[locale] = text;
      filled++;
    }
  }
  console.log(`  ${locale} … ${filled}/${matched.length}`);
}

const body = `/**
 * Translations for the transmitted story cards — hadith, duaa and dhikr — taken
 * from published editions.
 * Generated by scripts/gen-hadith-translations.mjs — do not edit by hand.
 *
 * Cards are matched to a hadith by their Arabic text rather than by the number
 * they cite, because hadith numbering differs between editions and a number
 * alone can point somewhere else entirely. A card that matches nothing well
 * enough keeps its English.
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

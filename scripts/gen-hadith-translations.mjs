// Fills the hadith story cards with translations in the locales that have an
// established edition. Run:
//
//   node scripts/gen-hadith-translations.mjs
//
// Output: packages/core/src/content/hadithTranslations.generated.ts
//
// Unlike Quran verses, hadith numbering is not universal — it differs between
// printed editions and between datasets. Trusting a number alone would risk
// attaching the wrong hadith's translation to a card, which is worse than
// showing English. So every match is verified against the card's own Arabic
// before it is accepted, and anything that does not line up is dropped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'packages/core/src/content/posts');
const out = path.join(root, 'packages/core/src/content/hadithTranslations.generated.ts');

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

/** Collections the cards cite, and the dataset slug for each. */
const BOOKS = { bukhari: 'bukhari', muslim: 'muslim' };

/**
 * Locales with a published edition of both collections. Malay and Thai have
 * none in this dataset — see docs/LOCALIZATION.md — so they keep English.
 */
const EDITIONS = {
  fr: { prefix: 'fra', credit: 'Traduction française, hadith-api' },
  id: { prefix: 'ind', credit: 'Terjemahan Indonesia, hadith-api' },
  ur: { prefix: 'urd', credit: 'اردو ترجمہ، hadith-api' },
};

const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const NON_ARABIC = /[^ء-ي]/g;

/** Comparable form of an Arabic string: letters only, no vowels or tatweel. */
const norm = (s, keepWords = false) =>
  s
    .replace(TASHKEEL, '')
    .replace(keepWords ? /[^ء-ي\s]/g : NON_ARABIC, keepWords ? ' ' : '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * How much of the card's wording appears in the full hadith.
 *
 * Not a substring test: the dataset carries the whole narration including the
 * chain, while the card carries only the Prophet's words, and the two differ in
 * small orthographic ways (فيهن against فيها, and so on) that break an exact
 * match while meaning the same thing. Word overlap tolerates that and still
 * falls to near zero when a number points at a different hadith entirely.
 */
function overlap(cardArabic, fullArabic) {
  const words = norm(cardArabic, true)
    .split(' ')
    .filter((w) => w.length > 2);
  if (words.length < 4) return 0;
  const haystack = ' ' + norm(fullArabic, true) + ' ';
  const present = words.filter((w) => haystack.includes(w)).length;
  return present / words.length;
}

/** Below this, the number is assumed to point at a different hadith. */
const MIN_OVERLAP = 0.75;

function hadithPosts() {
  const found = [];
  for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith('.ts'))) {
    const text = fs.readFileSync(path.join(postsDir, file), 'utf8');
    for (const m of text.matchAll(/\{\s*id: '([^']+)',([\s\S]*?)\n {2}\},/g)) {
      const [, id, body] = m;
      if (!/kind: 'hadith'/.test(body)) continue;
      const i = body.indexOf('source:');
      const ref = i === -1 ? null : /(Bukhari|Muslim)[^0-9]{0,12}(\d+)/.exec(body.slice(i));
      if (!ref) continue;
      const arabic = /arabic:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(body);
      if (!arabic) continue;
      found.push({
        id,
        book: BOOKS[ref[1].toLowerCase()],
        number: Number(ref[2]),
        arabic: arabic[1],
      });
    }
  }
  return found;
}

async function edition(name) {
  const res = await fetch(`${CDN}/${name}.min.json`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const json = await res.json();
  const byNumber = new Map();
  for (const h of json.hadiths) byNumber.set(h.hadithnumber, h.text);
  return byNumber;
}

const posts = hadithPosts();
console.log(`hadith cards citing Bukhari or Muslim: ${posts.length}`);

// The Arabic editions are the yardstick the numbering is checked against.
const arabic = {};
for (const book of new Set(posts.map((p) => p.book))) {
  arabic[book] = await edition(`ara-${book}`);
}

const scored = posts.map((p) => {
  const text = arabic[p.book]?.get(p.number);
  return { ...p, score: text ? overlap(p.arabic, text) : 0 };
});
const verified = scored.filter((p) => p.score >= MIN_OVERLAP);
const rejected = scored.filter((p) => p.score < MIN_OVERLAP);
console.log(`numbering verified against the Arabic text: ${verified.length}/${posts.length}`);
for (const r of rejected) {
  console.log(`  rejected ${r.id} (${r.book} ${r.number}) overlap ${(r.score * 100).toFixed(0)}%`);
}

const translations = {};
for (const [locale, meta] of Object.entries(EDITIONS)) {
  let filled = 0;
  for (const book of new Set(verified.map((p) => p.book))) {
    const byNumber = await edition(`${meta.prefix}-${book}`);
    for (const post of verified.filter((p) => p.book === book)) {
      const text = byNumber.get(post.number);
      if (!text?.trim()) continue;
      (translations[post.id] ??= {})[locale] = text.trim();
      filled++;
    }
  }
  console.log(`  ${locale} ${meta.prefix} … ${filled}/${verified.length}`);
}

const body = `/**
 * Hadith translations for the story cards, from published editions.
 * Generated by scripts/gen-hadith-translations.mjs — do not edit by hand.
 *
 * Every entry was verified against the card's own Arabic before being accepted,
 * because hadith numbering differs between editions. Malay and Thai are absent:
 * no edition of either collection exists in this dataset for them.
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

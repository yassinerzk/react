// Generates Quran verse cards from the bundled quran-json chapters so the
// Arabic text and translation are exact. Run: node scripts/gen-quran-posts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chaptersDir = path.join(root, 'packages/assets/quran/chapters');
const out = path.join(root, 'packages/core/src/content/posts/quranVerses.generated.ts');

/** [reference, category, optional headline en|ar] */
const REFS = [
  // general reflection
  ['2:45', 'quran'],
  ['2:153', 'quran'],
  ['2:216', 'quran'],
  ['2:257', 'quran'],
  ['3:26', 'quran'],
  ['3:31', 'quran'],
  ['3:159', 'quran'],
  ['3:185', 'quran'],
  ['3:200', 'quran'],
  ['4:36', 'quran'],
  ['5:2', 'quran'],
  ['6:17', 'quran'],
  ['6:162', 'quran'],
  ['7:55', 'quran'],
  ['7:199', 'quran'],
  ['8:2', 'quran'],
  ['9:129', 'quran'],
  ['10:57', 'quran'],
  ['10:58', 'quran'],
  ['11:88', 'quran'],
  ['11:114', 'quran'],
  ['11:115', 'quran'],
  ['13:11', 'quran'],
  ['13:24', 'quran'],
  ['15:9', 'quran'],
  ['16:18', 'quran'],
  ['16:90', 'quran'],
  ['16:97', 'quran'],
  ['17:37', 'quran'],
  ['17:82', 'quran'],
  ['18:46', 'quran'],
  ['19:96', 'quran'],
  ['20:2-3', 'quran'],
  ['20:46', 'quran'],
  ['21:107', 'quran'],
  ['25:63', 'quran'],
  ['26:80', 'quran'],
  ['28:56', 'quran'],
  ['29:2', 'quran'],
  ['29:45', 'quran'],
  ['29:69', 'quran'],
  ['31:17', 'quran'],
  ['31:18', 'quran'],
  ['33:41-42', 'quran'],
  ['33:56', 'quran'],
  ['33:70', 'quran'],
  ['35:34', 'quran'],
  ['36:58', 'quran'],
  ['36:82', 'quran'],
  ['39:10', 'quran'],
  ['39:36', 'quran'],
  ['40:44', 'quran'],
  ['41:30', 'quran'],
  ['41:34', 'quran'],
  ['42:30', 'quran'],
  ['49:13', 'quran'],
  ['50:16', 'quran'],
  ['51:56', 'quran'],
  ['54:17', 'quran'],
  ['55:13', 'quran'],
  ['57:4', 'quran'],
  ['58:11', 'quran'],
  ['64:11', 'quran'],
  ['65:2-3', 'quran'],
  ['67:2', 'quran'],
  ['68:4', 'quran'],
  ['73:8', 'quran'],
  ['76:9', 'quran'],
  ['87:14-15', 'quran'],
  ['89:27-30', 'quran'],
  ['91:9-10', 'quran'],
  ['93:3', 'quran'],
  ['93:4', 'quran'],
  ['93:7-8', 'quran'],
  ['93:11', 'quran'],
  ['94:1-4', 'quran'],
  ['96:1', 'quran'],
  ['103:1-3', 'quran'],
  ['110:3', 'quran'],
  ['112:1-4', 'quran'],
  ['1:1-7', 'quran', 'Al-Fatihah|الفاتحة'],
  // friday / seasons
  ['62:10', 'friday'],
  ['2:183', 'ramadan'],
  ['2:184', 'ramadan'],
  ['44:3-4', 'laylat-al-qadr'],
  ['22:27', 'dhul-hijjah'],
  ['22:28', 'dhul-hijjah'],
  ['22:32', 'dhul-hijjah'],
  ['3:96-97', 'dhul-hijjah'],
  ['22:26', 'dhul-hijjah'],
  ['53:9-10', 'isra-miraj'],
  ['17:79', 'evening'],
  ['36:37-38', 'evening'],
  ['73:6', 'evening'],
  ['25:61-62', 'evening'],
  ['30:17-18', 'morning'],
  ['6:96', 'morning'],
  ['78:9-11', 'morning'],
  ['93:1-2', 'morning'],
  ['91:1-4', 'morning'],
  // occasions
  ['30:21', 'occasions', 'For a marriage|للزواج'],
  ['25:74', 'occasions', 'For the family|للأسرة'],
  ['14:41', 'occasions', 'For our parents|للوالدين'],
  ['31:14', 'occasions', 'Gratitude to parents|بر الوالدين'],
  // dua from the Quran
  ['2:250', 'dua'],
  ['3:147', 'dua'],
  ['7:126', 'dua'],
  ['7:151', 'dua'],
  ['18:10', 'dua'],
  ['21:87', 'dua', 'Duaa of Yunus|دعاء ذي النون'],
  ['21:89', 'dua'],
  ['23:118', 'dua'],
  ['25:65', 'dua'],
  ['26:83-85', 'dua'],
  ['27:19', 'dua'],
  ['28:24', 'dua'],
  ['59:10', 'dua'],
  ['71:28', 'dua'],
  ['3:16', 'dua'],
  ['3:53', 'dua'],
  ['10:85-86', 'dua'],
  ['14:35', 'dua'],
  ['2:127-128', 'dua'],
  ['3:193', 'dua'],
  ['66:8', 'dua'],
  ['46:15', 'dua'],
];

const STYLES = [
  ['emerald-night', 'arch', 'amiri'],
  ['midnight-blue', 'stars', 'scheherazade'],
  ['ivory-gold', 'arch', 'amiri'],
  ['royal-purple', 'crescent', 'naskh'],
  ['olive-sage', 'none', 'amiri'],
  ['charcoal-minimal', 'none', 'scheherazade'],
  ['burgundy-gold', 'stars', 'naskh'],
  ['teal-lagoon', 'crescent', 'amiri'],
  ['desert-dawn', 'sunrise', 'naskh'],
  ['rose-gold', 'none', 'amiri'],
];
const PHOTOS = [
  'wildflowers',
  'river-valley',
  'mountain-lake',
  'forest-light',
  'ocean-sunrise',
  'desert-dusk',
  'starry-night',
  'mosque-sunset',
  'mosque-courtyard',
  'mosque-sea',
  'cherry-blossom',
  'lavender-field',
];
const MAX_ARABIC = 300;
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const ar = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[d]);

const chapters = new Map();
const chapter = (id) => {
  if (!chapters.has(id))
    chapters.set(id, JSON.parse(fs.readFileSync(path.join(chaptersDir, `${id}.json`), 'utf8')));
  return chapters.get(id);
};

const posts = [];
const skipped = [];
REFS.forEach(([ref, category, headline], i) => {
  const [s, range] = ref.split(':');
  const [from, to] = range.split('-').map(Number);
  const ch = chapter(Number(s));
  const verses = ch.verses.filter((v) => v.id >= from && v.id <= (to ?? from));
  const arabic = verses.map((v) => v.text).join(' ۝ ');
  if (arabic.length > MAX_ARABIC) return skipped.push(`${ref} (${arabic.length})`);
  const translation = verses.map((v) => v.translation.trim().replace(/\s+/g, ' ')).join(' ');
  const rangeEn = to ? `${from}-${to}` : `${from}`;
  const rangeAr = to ? `${ar(from)}-${ar(to)}` : ar(from);
  const [theme, decoration, font] = STYLES[i % STYLES.length];
  const photo = i % 3 === 0 ? PHOTOS[Math.floor(i / 3) % PHOTOS.length] : null;
  const [hEn, hAr] = headline ? headline.split('|') : [];
  posts.push({
    id: `qv-${s}-${rangeEn}`,
    category,
    kind: category === 'dua' ? 'dua' : 'quran',
    ...(headline ? { headline: { en: hEn, ar: hAr } } : {}),
    arabic,
    translation,
    source: { en: `Surah ${ch.transliteration} ${s}:${rangeEn}`, ar: `سورة ${ch.name} ${ar(s)}:${rangeAr}` },
    theme,
    decoration: photo ? 'none' : decoration,
    ...(photo ? { background: photo } : {}),
    font,
  });
});

const body = posts.map((p) => '  ' + JSON.stringify(p, null, 2).replace(/\n/g, '\n  ')).join(',\n');
fs.writeFileSync(
  out,
  `// GENERATED by scripts/gen-quran-posts.mjs from packages/assets/quran. Do not edit by hand.
import type { Post } from '../../types';

export const quranVersePosts: Post[] = [
${body},
];
`,
);
console.log(`wrote ${posts.length} posts; skipped ${skipped.length}: ${skipped.join(', ')}`);

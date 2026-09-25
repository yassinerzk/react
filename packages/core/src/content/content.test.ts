import { CATEGORIES, CATEGORY_MAP, POSTS, getPostsByCategory } from '.';
import { THEME_MAP } from '../themes';
import { ARABIC_FONT_MAP } from '../fonts';
import { BACKGROUND_MAP, BACKGROUNDS } from '../backgrounds';
import { postTranslation } from '../design';
import { QURAN_TRANSLATIONS, QURAN_TRANSLATION_CREDITS } from './quranTranslations.generated';
import { HADITH_TRANSLATIONS } from './hadithTranslations.generated';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ASSETS = resolve(__dirname, '../../../assets/backgrounds');

const ARABIC = /[؀-ۿ]/;

describe('background registry', () => {
  it('has unique ids and shipped image files', () => {
    const ids = BACKGROUNDS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const b of BACKGROUNDS) {
      expect(existsSync(resolve(ASSETS, `${b.id}.webp`)), `${b.id}.webp`).toBe(true);
      expect(existsSync(resolve(ASSETS, 'thumbs', `${b.id}.webp`)), `thumbs/${b.id}.webp`).toBe(true);
    }
  });
});

describe('content registry', () => {
  it('ships more than 200 cards', () => {
    expect(POSTS.length).toBeGreaterThan(200);
  });

  it('has unique post ids', () => {
    const ids = POSTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique category ids and orders', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = CATEGORIES.map((c) => c.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('every category has at least one post', () => {
    for (const c of CATEGORIES) {
      expect(getPostsByCategory(c.id).length, `category ${c.id}`).toBeGreaterThan(0);
    }
  });

  it.each(POSTS.map((p) => [p.id, p] as const))('%s references valid registries and content', (_id, post) => {
    expect(CATEGORY_MAP[post.category]).toBeDefined();
    expect(THEME_MAP[post.theme]).toBeDefined();
    if (post.font) expect(ARABIC_FONT_MAP[post.font]).toBeDefined();
    if (post.background && post.background !== 'none') expect(BACKGROUND_MAP[post.background]).toBeDefined();
    expect(post.arabic.trim().length).toBeGreaterThan(0);
    expect(ARABIC.test(post.arabic)).toBe(true);
    // Quran and hadith must always carry a reference.
    if (post.kind === 'quran' || post.kind === 'hadith') {
      expect(post.source?.en, `${post.id} needs a source`).toBeTruthy();
      expect(post.source?.ar).toBeTruthy();
    }
    if (post.headline) {
      expect(post.headline.en).toBeTruthy();
      expect(post.headline.ar).toBeTruthy();
    }
  });
  /**
   * The guard that matters most in this file.
   *
   * A card's `translations` are written by us. That is fine for a greeting —
   * "Eid Mubarak, may you be well every year" is a well-wish. It is not fine
   * for anything transmitted: rendering a Quran verse or a hadith into another
   * language is a translation of scripture, and publishing one we wrote
   * ourselves under the app's name would be exactly the thing every licensing
   * note in docs/LOCALIZATION.md warns against.
   *
   * Those renderings must come from an established, attributable edition. Until
   * they are sourced, only greetings may carry them.
   */
  it('only greeting cards carry translations written by us', () => {
    const transmitted = POSTS.filter((p) => p.kind !== 'greeting' && p.translations);
    expect(
      transmitted.map((p) => `${p.id} (${p.kind})`),
      'scripture needs a sourced translation, not one written here',
    ).toEqual([]);
  });

  it('every greeting rendering is complete and distinct from the English', () => {
    const LOCALES_WRITTEN = ['fr', 'id', 'ms', 'th', 'ur'] as const;
    for (const post of POSTS) {
      if (!post.translations) continue;
      for (const loc of LOCALES_WRITTEN) {
        const value = post.translations[loc];
        expect(value, `${post.id} is missing ${loc}`).toBeTruthy();
        expect(value!.trim()).not.toBe('');
        expect(value, `${post.id} ${loc} was left as English`).not.toBe(post.translation);
      }
    }
  });

  it('every Quran card has a sourced translation in every locale', () => {
    const verses = POSTS.filter((p) => p.kind === 'quran');
    const written = ['fr', 'id', 'ms', 'th', 'ur'] as const;
    const gaps: string[] = [];
    for (const post of verses) {
      for (const loc of written) {
        if (!QURAN_TRANSLATIONS[post.id]?.[loc]) gaps.push(`${post.id}:${loc}`);
      }
    }
    expect(gaps, 'run scripts/gen-quran-translations.mjs').toEqual([]);
    expect(verses.length).toBeGreaterThan(100);
  });

  /**
   * A published hadith carries its chain of narrators; a card carries only the
   * saying. If a fetched translation is far longer than the English the card
   * already has, the chain came with it — which is a wall of text on a story
   * card and was the bug this guard exists to stop coming back.
   */
  it('no sourced translation runs away from the English it replaces', () => {
    const byId = new Map(POSTS.map((p) => [p.id, p]));
    const bloated: string[] = [];
    for (const [id, locales] of Object.entries(HADITH_TRANSLATIONS)) {
      const english = byId.get(id)?.translation;
      if (!english) continue;
      for (const [loc, text] of Object.entries(locales)) {
        const ratio = text.length / english.length;
        if (ratio > 2.6 || ratio < 0.3) bloated.push(`${id}:${loc} ${ratio.toFixed(1)}x`);
      }
    }
    expect(bloated, 're-run scripts/gen-hadith-translations.mjs').toEqual([]);
  });

  it('names the translator for every sourced locale', () => {
    for (const loc of ['fr', 'id', 'ms', 'th', 'ur'] as const) {
      expect(QURAN_TRANSLATION_CREDITS[loc], `${loc} needs an attribution`).toBeTruthy();
    }
  });

  it('resolves a card to the reader language, and leaves Arabic on English', () => {
    const greeting = POSTS.find((p) => p.translations)!;
    expect(postTranslation(greeting, 'id')).toBe(greeting.translations!.id);
    // Arabic deliberately has no entry: the card already carries the Arabic.
    expect(postTranslation(greeting, 'ar')).toBe(greeting.translation);
    // A verse now resolves to its sourced edition, never to something we wrote.
    const verse = POSTS.find((p) => p.kind === 'quran' && p.translation)!;
    expect(postTranslation(verse, 'th')).toBe(QURAN_TRANSLATIONS[verse.id].th);
    expect(postTranslation(verse, 'ar')).toBe(verse.translation);
  });
});

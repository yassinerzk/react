import { CATEGORIES, CATEGORY_MAP, POSTS, getPostsByCategory } from '.';
import { THEME_MAP } from '../themes';
import { ARABIC_FONT_MAP } from '../fonts';
import { BACKGROUND_MAP, BACKGROUNDS } from '../backgrounds';
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
});

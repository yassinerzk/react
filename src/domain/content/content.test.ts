import { CATEGORIES, CATEGORY_MAP, POSTS, getPostsByCategory } from '@/domain/content';
import { THEME_MAP } from '@/domain/themes';
import { DECORATION_MAP } from '@/domain/decorations';
import { ARABIC_FONT_MAP } from '@/domain/fonts';

const ARABIC = /[؀-ۿ]/;

describe('content registry', () => {
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
    expect(DECORATION_MAP[post.decoration]).toBeDefined();
    if (post.font) expect(ARABIC_FONT_MAP[post.font]).toBeDefined();
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

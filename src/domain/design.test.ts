import { computeTypography, designFromPost, designToText, DEFAULT_DESIGN } from './design';
import { getPost } from '@/domain/content';

describe('design', () => {
  it('builds an editable design from a post', () => {
    const post = getPost('friday-best-day')!;
    const d = designFromPost(post, 'ar');
    expect(d.postId).toBe(post.id);
    expect(d.arabic).toBe(post.arabic);
    expect(d.source).toBe(post.source?.ar);
    expect(d.showTranslation).toBe(true);
    expect(d.theme).toBe(post.theme);
  });

  it('shrinks Arabic text as it gets longer', () => {
    const short = computeTypography({ ...DEFAULT_DESIGN, arabic: 'الحمد لله' });
    const long = computeTypography({ ...DEFAULT_DESIGN, arabic: 'كلمة '.repeat(50) });
    expect(short.arabicSize).toBeGreaterThan(long.arabicSize);
  });

  it('respects the user font scale', () => {
    const base = computeTypography({ ...DEFAULT_DESIGN, arabic: 'الحمد لله' });
    const bigger = computeTypography({ ...DEFAULT_DESIGN, arabic: 'الحمد لله', fontScale: 1.3 });
    expect(bigger.arabicSize).toBeGreaterThan(base.arabicSize);
  });

  it('produces a plain-text caption', () => {
    const text = designToText({
      ...DEFAULT_DESIGN,
      headline: 'جمعة مباركة',
      arabic: 'نص',
      translation: 'Text',
      source: 'Src',
      footer: '',
    });
    expect(text).toBe('جمعة مباركة\n\nنص\n\nText\n\n— Src');
  });
});

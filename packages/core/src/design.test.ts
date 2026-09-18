import {
  computeTypography,
  designFromPost,
  designToText,
  DEFAULT_DESIGN,
  designFromHadith,
  designFromVerses,
} from './design';
import { getChapterMeta } from './quran';
import { getPost } from './content';

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

  it('builds a story from Quran verses', () => {
    const d = designFromVerses(
      getChapterMeta(94)!,
      [
        {
          id: 5,
          text: 'فَإِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا',
          translation: 'For indeed, with hardship [will be] ease.',
        },
        { id: 6, text: 'إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا', translation: 'Indeed, with hardship [will be] ease.' },
      ],
      'en',
    );
    expect(d.kind).toBe('quran');
    expect(d.arabic).toBe('فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا');
    expect(d.source).toBe('Surah Ash-Sharh 94:5-6');
  });

  it('builds a story from a hadith', () => {
    const d = designFromHadith(
      {
        book: 'muslim',
        number: 55,
        section: 1,
        ar: 'قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم ‏"‏ الدِّينُ النَّصِيحَةُ ‏"‏',
        en: 'Narrated Tamim: Religion is sincerity.',
      },
      'ar',
    );
    expect(d.arabic).toBe('الدِّينُ النَّصِيحَةُ');
    expect(d.translation).toBe('Religion is sincerity.');
    expect(d.source).toBe('صحيح مسلم ٥٥');
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

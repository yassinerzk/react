/**
 * Core domain types. Every registry (categories, posts, themes, decorations,
 * fonts) is typed against this file so that adding new content is a
 * compile-time-checked operation.
 */

export type Locale = 'en' | 'ar';

/** A string that exists in every supported UI locale. */
export type Localized = Record<Locale, string>;

/** What kind of text a post carries. Drives the small label on the card. */
export type PostKind = 'quran' | 'hadith' | 'dua' | 'dhikr' | 'greeting';

export type CategoryId =
  | 'friday'
  | 'morning'
  | 'evening'
  | 'ramadan'
  | 'laylat-al-qadr'
  | 'eid-al-fitr'
  | 'dhul-hijjah'
  | 'eid-al-adha'
  | 'muharram'
  | 'isra-miraj'
  | 'quran'
  | 'hadith'
  | 'dua'
  | 'occasions';

export type ThemeId =
  | 'emerald-night'
  | 'midnight-blue'
  | 'royal-purple'
  | 'desert-dawn'
  | 'rose-gold'
  | 'ivory-gold'
  | 'teal-lagoon'
  | 'burgundy-gold'
  | 'charcoal-minimal'
  | 'olive-sage';

export type PatternId = 'star8' | 'zellige' | 'lattice' | 'dots' | 'none';

export type BackgroundId =
  | 'none'
  | 'wildflowers'
  | 'river-valley'
  | 'mosque-sunset'
  | 'mountain-lake'
  | 'forest-light'
  | 'desert-dusk'
  | 'starry-night'
  | 'mosque-courtyard'
  | 'ocean-sunrise'
  | 'cherry-blossom'
  | 'lavender-field'
  | 'mosque-sea';

export type DecorationId =
  'none' | 'crescent' | 'lanterns' | 'mosque' | 'kaaba' | 'arch' | 'lights' | 'sunrise' | 'stars';

export type ArabicFontId =
  'amiri' | 'scheherazade' | 'naskh' | 'cairo' | 'tajawal' | 'reem-kufi' | 'aref-ruqaa';

export type LatinFontId = 'cormorant' | 'inter';

export type TextAlign = 'center' | 'start';

export interface Category {
  id: CategoryId;
  label: Localized;
  description: Localized;
  /** Emoji used as a lightweight icon in chips. */
  icon: string;
  /** Sort order in the gallery. */
  order: number;
}

export interface Post {
  id: string;
  category: CategoryId;
  kind: PostKind;
  /** Arabic body text. The primary text on the card. */
  arabic: string;
  /** English rendering: a translation, or the greeting in English. */
  translation?: string;
  /** Reference shown in small print, e.g. "Surah Al-Jumu'ah 62:9". */
  source?: Localized;
  /** Optional short headline above the body, e.g. "جمعة مباركة". */
  headline?: Localized;
  /** Suggested visual defaults. The user can override every one of them. */
  theme: ThemeId;
  decoration: DecorationId;
  /** Optional photo background; when set it replaces the theme's gradient. */
  background?: BackgroundId;
  font?: ArabicFontId;
  tags?: string[];
}

export interface Theme {
  id: ThemeId;
  name: Localized;
  mode: 'dark' | 'light';
  /** CSS background for the card (usually a gradient). */
  background: string;
  pattern: PatternId;
  patternColor: string;
  patternOpacity: number;
  /** Primary text color. */
  text: string;
  /** Secondary text color (translation, source). */
  muted: string;
  /** Accent color for ornaments, dividers and the headline. */
  accent: string;
  /** Color used by decorations (silhouettes, lanterns). */
  decor: string;
}

/** A photographic background rendered under a legibility scrim. */
export interface Background {
  id: BackgroundId;
  name: Localized;
  /** Path relative to the app base URL, full size 1080x1920. */
  src: string;
  /** Small preview for the picker. */
  thumb: string;
  /** CSS gradient laid over the photo so text stays readable. */
  scrim: string;
}

export interface ArabicFont {
  id: ArabicFontId;
  name: Localized;
  family: string;
  /** Multiplier applied to the computed size so fonts look optically equal. */
  scale: number;
  lineHeight: number;
  weight: number;
  /** True for calligraphic faces best suited to Quran and hadith. */
  classical: boolean;
}

export interface LatinFont {
  id: LatinFontId;
  name: Localized;
  family: string;
  italic: boolean;
  scale: number;
}

/**
 * Everything needed to render one story card. This is the unit that gets
 * edited, saved, and exported. It is deliberately flat and serialisable.
 */
export interface StoryDesign {
  /** The post this design was started from, if any. */
  postId?: string;
  kind: PostKind;
  headline: string;
  arabic: string;
  translation: string;
  source: string;
  /** Free text at the bottom, typically the user's name or a wish. */
  footer: string;
  showTranslation: boolean;
  showSource: boolean;
  showHijriDate: boolean;
  showFrame: boolean;
  theme: ThemeId;
  /** Photo background; 'none' uses the theme gradient. */
  background: BackgroundId;
  decoration: DecorationId;
  arabicFont: ArabicFontId;
  latinFont: LatinFontId;
  /** 0.7 – 1.4 multiplier on top of the automatic size. */
  fontScale: number;
  align: TextAlign;
}

export interface SavedDesign {
  id: string;
  design: StoryDesign;
  createdAt: number;
  updatedAt: number;
}

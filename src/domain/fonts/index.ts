import type { ArabicFont, ArabicFontId, LatinFont, LatinFontId } from '@/domain/types';

// Self-hosted fonts (bundled by Vite) so PNG export works offline and never
// depends on a third-party CDN being reachable from the user's phone.
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/scheherazade-new/400.css';
import '@fontsource/scheherazade-new/700.css';
import '@fontsource/noto-naskh-arabic/400.css';
import '@fontsource/noto-naskh-arabic/700.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/reem-kufi/400.css';
import '@fontsource/reem-kufi/600.css';
import '@fontsource/aref-ruqaa/400.css';
import '@fontsource/aref-ruqaa/700.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

export const ARABIC_FONTS: readonly ArabicFont[] = [
  {
    id: 'amiri',
    name: { en: 'Amiri', ar: 'أميري' },
    family: "'Amiri', serif",
    scale: 1,
    lineHeight: 1.9,
    weight: 400,
    classical: true,
  },
  {
    id: 'scheherazade',
    name: { en: 'Scheherazade', ar: 'شهرزاد' },
    family: "'Scheherazade New', serif",
    scale: 1.08,
    lineHeight: 1.85,
    weight: 700,
    classical: true,
  },
  {
    id: 'naskh',
    name: { en: 'Naskh', ar: 'نسخ' },
    family: "'Noto Naskh Arabic', serif",
    scale: 0.95,
    lineHeight: 1.95,
    weight: 400,
    classical: true,
  },
  {
    id: 'aref-ruqaa',
    name: { en: 'Ruqaa', ar: 'رقعة' },
    family: "'Aref Ruqaa', serif",
    scale: 0.98,
    lineHeight: 2.05,
    weight: 400,
    classical: false,
  },
  {
    id: 'reem-kufi',
    name: { en: 'Kufi', ar: 'كوفي' },
    family: "'Reem Kufi', sans-serif",
    scale: 0.92,
    lineHeight: 1.9,
    weight: 600,
    classical: false,
  },
  {
    id: 'cairo',
    name: { en: 'Cairo', ar: 'القاهرة' },
    family: "'Cairo', sans-serif",
    scale: 0.9,
    lineHeight: 1.85,
    weight: 700,
    classical: false,
  },
  {
    id: 'tajawal',
    name: { en: 'Tajawal', ar: 'تجوال' },
    family: "'Tajawal', sans-serif",
    scale: 0.95,
    lineHeight: 1.8,
    weight: 700,
    classical: false,
  },
];

export const LATIN_FONTS: readonly LatinFont[] = [
  {
    id: 'cormorant',
    name: { en: 'Cormorant', ar: 'كورمورانت' },
    family: "'Cormorant Garamond', Georgia, serif",
    italic: true,
    scale: 1.1,
  },
  {
    id: 'inter',
    name: { en: 'Inter', ar: 'إنتر' },
    family: "'Inter', system-ui, sans-serif",
    italic: false,
    scale: 0.92,
  },
];

export const ARABIC_FONT_MAP = Object.fromEntries(ARABIC_FONTS.map((f) => [f.id, f])) as Record<
  ArabicFontId,
  ArabicFont
>;
export const LATIN_FONT_MAP = Object.fromEntries(LATIN_FONTS.map((f) => [f.id, f])) as Record<
  LatinFontId,
  LatinFont
>;

export function getArabicFont(id: ArabicFontId): ArabicFont {
  return ARABIC_FONT_MAP[id];
}
export function getLatinFont(id: LatinFontId): LatinFont {
  return LATIN_FONT_MAP[id];
}

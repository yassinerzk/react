import { useFonts } from 'expo-font';
import { Amiri_400Regular } from '@expo-google-fonts/amiri/400Regular';
import { Amiri_700Bold } from '@expo-google-fonts/amiri/700Bold';
import { ScheherazadeNew_400Regular } from '@expo-google-fonts/scheherazade-new/400Regular';
import { ScheherazadeNew_700Bold } from '@expo-google-fonts/scheherazade-new/700Bold';
import { NotoNaskhArabic_400Regular } from '@expo-google-fonts/noto-naskh-arabic/400Regular';
import { NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic/700Bold';
import { Cairo_400Regular } from '@expo-google-fonts/cairo/400Regular';
import { Cairo_600SemiBold } from '@expo-google-fonts/cairo/600SemiBold';
import { Cairo_700Bold } from '@expo-google-fonts/cairo/700Bold';
import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { ReemKufi_400Regular } from '@expo-google-fonts/reem-kufi/400Regular';
import { ReemKufi_600SemiBold } from '@expo-google-fonts/reem-kufi/600SemiBold';
import { ArefRuqaa_400Regular } from '@expo-google-fonts/aref-ruqaa/400Regular';
import { ArefRuqaa_700Bold } from '@expo-google-fonts/aref-ruqaa/700Bold';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond/400Regular';
import { CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond/400Regular_Italic';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import type { ArabicFontId, LatinFontId } from '@barakah/core';

/** Every face the app loads. Keys are the React Native fontFamily names. */
export const FONT_ASSETS = {
  Amiri_400Regular,
  Amiri_700Bold,
  ScheherazadeNew_400Regular,
  ScheherazadeNew_700Bold,
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_700Bold,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Tajawal_400Regular,
  Tajawal_700Bold,
  ReemKufi_400Regular,
  ReemKufi_600SemiBold,
  ArefRuqaa_400Regular,
  ArefRuqaa_700Bold,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
};

export type FontName = keyof typeof FONT_ASSETS;

/** Native face names for each core Arabic font at regular and bold weight. */
export const ARABIC_FACES: Record<ArabicFontId, { regular: FontName; bold: FontName }> = {
  amiri: { regular: 'Amiri_400Regular', bold: 'Amiri_700Bold' },
  scheherazade: { regular: 'ScheherazadeNew_400Regular', bold: 'ScheherazadeNew_700Bold' },
  naskh: { regular: 'NotoNaskhArabic_400Regular', bold: 'NotoNaskhArabic_700Bold' },
  cairo: { regular: 'Cairo_400Regular', bold: 'Cairo_700Bold' },
  tajawal: { regular: 'Tajawal_400Regular', bold: 'Tajawal_700Bold' },
  'reem-kufi': { regular: 'ReemKufi_400Regular', bold: 'ReemKufi_600SemiBold' },
  'aref-ruqaa': { regular: 'ArefRuqaa_400Regular', bold: 'ArefRuqaa_700Bold' },
};

export const LATIN_FACES: Record<LatinFontId, { regular: FontName; italic: FontName }> = {
  cormorant: { regular: 'CormorantGaramond_400Regular', italic: 'CormorantGaramond_400Regular_Italic' },
  inter: { regular: 'Inter_400Regular', italic: 'Inter_400Regular' },
};

/** Picks the native face for a core font id and a CSS-style weight. */
export function arabicFace(id: ArabicFontId, weight: number): FontName {
  const faces = ARABIC_FACES[id];
  return weight >= 600 ? faces.bold : faces.regular;
}

export const UI_FONT = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;
export const UI_FONT_AR = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_600SemiBold',
  semibold: 'Cairo_700Bold',
} as const;

export function useAppFonts() {
  return useFonts(FONT_ASSETS);
}

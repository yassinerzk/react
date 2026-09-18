import type { Theme, ThemeGradient, ThemeId } from './types';

/** CSS string for a structured gradient (web renderer). */
export function gradientToCss(g: ThemeGradient): string {
  const stops = g.stops.map(([o, c]) => `${c} ${Math.round(o * 100)}%`).join(', ');
  return g.kind === 'linear'
    ? `linear-gradient(${g.angle}deg, ${stops})`
    : `radial-gradient(${g.rx}% ${g.ry}% at ${g.cx}% ${g.cy}%, ${stops})`;
}

const linear = (angle: number, ...stops: Array<[number, string]>): ThemeGradient => ({
  kind: 'linear',
  angle,
  stops,
});
const radial = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ...stops: Array<[number, string]>
): ThemeGradient => ({
  kind: 'radial',
  cx,
  cy,
  rx,
  ry,
  stops,
});

const GOLD = '#d9b65c';

/**
 * Theme registry. A theme is pure data, so adding one is a single entry here
 * plus its id in `ThemeId`.
 */
export const THEMES: readonly Theme[] = [
  {
    id: 'emerald-night',
    name: { en: 'Emerald Night', ar: 'ليل زمردي' },
    mode: 'dark',
    gradient: radial(50, 0, 120, 80, [0, '#17594d'], [0.55, '#0b2e2a'], [1, '#06201d']),
    pattern: 'star8',
    patternColor: '#e9d9a3',
    patternOpacity: 0.08,
    text: '#f7f1df',
    muted: '#cfd9cf',
    accent: GOLD,
    decor: '#e5c977',
  },
  {
    id: 'midnight-blue',
    name: { en: 'Midnight Blue', ar: 'أزرق منتصف الليل' },
    mode: 'dark',
    gradient: linear(180, [0, '#0c1a3a'], [0.5, '#142b5c'], [1, '#0a1430']),
    pattern: 'dots',
    patternColor: '#ffffff',
    patternOpacity: 0.09,
    text: '#f4f1e6',
    muted: '#c7cee0',
    accent: '#e9c46a',
    decor: '#f1d78a',
  },
  {
    id: 'royal-purple',
    name: { en: 'Royal Purple', ar: 'بنفسجي ملكي' },
    mode: 'dark',
    gradient: radial(50, 100, 100, 70, [0, '#4a1d6e'], [0.55, '#2b0f45'], [1, '#170826']),
    pattern: 'zellige',
    patternColor: '#f3d6ff',
    patternOpacity: 0.07,
    text: '#fbf4ff',
    muted: '#d8c8e6',
    accent: '#e7b85c',
    decor: '#f0cf82',
  },
  {
    id: 'desert-dawn',
    name: { en: 'Desert Dawn', ar: 'فجر الصحراء' },
    mode: 'dark',
    gradient: linear(180, [0, '#f6c177'], [0.4, '#e2865a'], [0.8, '#8e3b4b'], [1, '#4a1f36']),
    pattern: 'lattice',
    patternColor: '#ffffff',
    patternOpacity: 0.1,
    text: '#fff8ee',
    muted: '#ffe8d6',
    accent: '#fff1c9',
    decor: '#ffe9b3',
  },
  {
    id: 'rose-gold',
    name: { en: 'Rose Gold', ar: 'وردي ذهبي' },
    mode: 'light',
    gradient: linear(160, [0, '#fbe6e0'], [0.45, '#f5c9c0'], [1, '#e9a8a3']),
    pattern: 'star8',
    patternColor: '#a5484f',
    patternOpacity: 0.08,
    text: '#4a1f24',
    muted: '#7a4a4f',
    accent: '#b3742f',
    decor: '#b98a4e',
  },
  {
    id: 'ivory-gold',
    name: { en: 'Ivory & Gold', ar: 'عاجي وذهبي' },
    mode: 'light',
    gradient: radial(50, 40, 90, 60, [0, '#fffdf6'], [0.7, '#f3e9d2'], [1, '#e6d7b5']),
    pattern: 'zellige',
    patternColor: '#a88532',
    patternOpacity: 0.1,
    text: '#2a2417',
    muted: '#5e5340',
    accent: '#a88532',
    decor: '#b89a4e',
  },
  {
    id: 'teal-lagoon',
    name: { en: 'Teal Lagoon', ar: 'بحيرة فيروزية' },
    mode: 'dark',
    gradient: linear(180, [0, '#0f4c5c'], [0.5, '#0b6e78'], [1, '#073b45']),
    pattern: 'lattice',
    patternColor: '#d7f5f0',
    patternOpacity: 0.08,
    text: '#f2fbfa',
    muted: '#c9e6e3',
    accent: '#f4d06f',
    decor: '#f6dd8e',
  },
  {
    id: 'burgundy-gold',
    name: { en: 'Burgundy & Gold', ar: 'خمري وذهبي' },
    mode: 'dark',
    gradient: radial(50, 10, 110, 80, [0, '#7a1f36'], [0.55, '#4d1024'], [1, '#2c0812']),
    pattern: 'star8',
    patternColor: '#f3d59a',
    patternOpacity: 0.08,
    text: '#fff5ea',
    muted: '#e6cfc7',
    accent: GOLD,
    decor: '#e9cd7f',
  },
  {
    id: 'charcoal-minimal',
    name: { en: 'Charcoal Minimal', ar: 'فحمي بسيط' },
    mode: 'dark',
    gradient: linear(180, [0, '#1c1c1e'], [1, '#101012']),
    pattern: 'none',
    patternColor: '#ffffff',
    patternOpacity: 0,
    text: '#f5f5f4',
    muted: '#b9b7b0',
    accent: '#d4b06a',
    decor: '#cdb072',
  },
  {
    id: 'olive-sage',
    name: { en: 'Olive & Sage', ar: 'زيتوني' },
    mode: 'light',
    gradient: linear(170, [0, '#e9eddc'], [0.5, '#cdd5b6'], [1, '#a9b78f']),
    pattern: 'dots',
    patternColor: '#3c4a2a',
    patternOpacity: 0.1,
    text: '#24301a',
    muted: '#4d5b3d',
    accent: '#7a6a2c',
    decor: '#6e7d4d',
  },
];

/** Solid fallback colour (first gradient stop), e.g. while an image loads. */
export function themeBaseColor(theme: Theme): string {
  return theme.gradient.stops[0][1];
}

export const THEME_MAP: Readonly<Record<ThemeId, Theme>> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
) as Record<ThemeId, Theme>;

export function getTheme(id: ThemeId): Theme {
  return THEME_MAP[id];
}

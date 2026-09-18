/** UI design tokens for the mobile shell (the story cards use core themes). */
export const ui = {
  bg: '#0b1f1c',
  bgElev: '#12302b',
  bgElev2: '#183a34',
  line: 'rgba(255,255,255,0.10)',
  text: '#f3efe4',
  textMuted: '#a9b8b1',
  accent: '#d9b65c',
  accentInk: '#1b1400',
  danger: '#e06c6c',
  success: '#1f5a44',
  radius: 14,
} as const;

export const space = (n: number) => n * 4;
